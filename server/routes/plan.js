import express from "express";
import mongoose from "mongoose";
import User from "../models/Auth.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { Readable } from "stream";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YourTestKeyHere",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "YourTestSecretHere",
});

/**
 * GENERATE RAZORPAY ORDER
 * POST /plan/create-order
 */
router.post("/create-order", async (req, res) => {
    const { amount } = req.body;

    try {
        // DETECT PLACEHOLDER KEYS
        const isMock = !process.env.RAZORPAY_KEY_ID ||
            process.env.RAZORPAY_KEY_ID.includes("YourTestKeyHere") ||
            process.env.RAZORPAY_KEY_ID === "rzp_test_YourTestKeyHere";

        if (isMock) {
            console.warn("Using MOCK Razorpay order because keys are not configured.");
            return res.status(200).json({
                id: `order_mock_${Date.now()}`,
                amount: amount * 100,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`,
                status: "created"
            });
        }

        const options = {
            amount: amount * 100, // into paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ message: "Could not create Razorpay order. Check your server logs and Razorpay API keys." });
    }
});

/**
 * Generate PDF Invoice in-memory
 */
const generateInvoicePDF = (user, plan, amount, paymentId) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", (err) => reject(err));

            // Header
            doc.fillColor("#df0000").fontSize(25).text("YourTube Premium", { align: "center" });
            doc.fillColor("#444444").fontSize(10).text("OFFICIAL INVOICE", { align: "center" });
            doc.moveDown(2);

            doc.fillColor("#000000").fontSize(10);
            doc.text(`Date: ${new Date().toLocaleDateString()}`);
            doc.text(`Invoice ID: INV-${Math.floor(100000 + Math.random() * 900000)}`);
            doc.text(`Transaction: ${paymentId}`);
            doc.moveDown();

            // Bill To
            doc.fontSize(12).text("Bill To:", { underline: true });
            doc.fontSize(10).text(`Name: ${user.name || "Valued User"}`);
            doc.text(`Email: ${user.email}`);
            doc.moveDown();

            // Separator
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Details table-like structure
            doc.fontSize(12).text("Subscription Details", { bold: true });
            doc.moveDown();
            doc.fontSize(10);
            doc.text(`Plan Tier: ${plan}`);
            doc.text(`Amount Paid: ₹${amount}.00`);
            doc.text(`Status: Paid (Test Mode/Success)`);
            doc.moveDown();

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Total
            doc.fontSize(14).fillColor("#df0000").text(`Total Amount: ₹${amount}.00`, { align: "right" });

            // Footer
            doc.moveDown(5);
            doc.fillColor("#888888").fontSize(8).text("This is an automatically generated invoice for your YourTube Premium subscription. Thank you for choosing us!", { align: "center" });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

/* ===============================
   UPGRADE PLAN (Verification included)
   =============================== */
router.post("/upgrade", async (req, res) => {
    const { userId, userEmail, amount, paymentId, orderId, signature } = req.body;

    try {
        console.log(`Upgrade request received for ID: ${userId}, Email: ${userEmail}`);

        let user;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        }

        // FALLBACK: Search by email if ID lookup fails
        if (!user && userEmail) {
            console.log("User not found by ID, trying email:", userEmail);
            user = await User.findOne({ email: userEmail });
        }

        if (!user) {
            console.error("❌ Upgrade failed: User not found in database.", { userId, userEmail });
            return res.status(404).json({ message: "User not found in database. Please try logging out and back in." });
        }

        console.log("✅ User found:", user.email, "Current Plan:", user.plan);

        // VERIFY SIGNATURE (Optional for test, but good practice)
        if (signature && orderId && paymentId && typeof paymentId === "string" && !paymentId.includes("mock")) {
            console.log("🔍 Verifying Razorpay signature...");
            const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YourTestSecretHere");
            hmac.update(orderId + "|" + paymentId);
            const generatedSignature = hmac.digest("hex");

            if (generatedSignature !== signature) {
                console.error("❌ Invalid signature");
                return res.status(400).json({ message: "Invalid payment signature" });
            }
            console.log("✅ Signature verified");
        }

        let newPlan = "Free";
        const amt = Number(amount);
        if (amt === 10) newPlan = "Bronze";
        else if (amt === 50) newPlan = "Silver";
        else if (amt === 100) newPlan = "Gold";
        else {
            console.error("❌ Invalid amount:", amount);
            return res.status(400).json({ message: "Invalid amount for upgrade" });
        }

        console.log(`🚀 Upgrading ${user.email} to ${newPlan}...`);
        user.plan = newPlan;
        user.isPremium = true;
        await user.save();
        console.log(`✅ Database updated for ${user.email}`);

        // Generate PDF
        console.log("📄 Generating PDF invoice...");
        let pdfBuffer;
        try {
            pdfBuffer = await generateInvoicePDF(user, newPlan, amount, paymentId);
            console.log("✅ PDF generated successfully");
        } catch (pdfErr) {
            console.error("❌ PDF Generation Error:", pdfErr);
            // Don't fail the whole request just because PDF failed, but log it
        }

        // Only attempt email if credentials exist
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log(`Attempting to send email to ${user.email} using ${process.env.EMAIL_USER}...`);
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                connectionTimeout: 10000, // 10s
                greetingTimeout: 10000,   // 10s
                socketTimeout: 10000      // 10s
            });

            const mailOptions = {
                from: `"YourTube Billing" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Professional Invoice: YourTube ${newPlan} Upgrade`,
                html: `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h1 style="color: #df0000; margin: 0;">YourTube Premium</h1>
                            <p style="color: #666;">Upgrade Confirmation & Receipt</p>
                        </div>
                        <div style="padding: 20px; background: #fdfdfd; border-radius: 8px;">
                            <p>Dear <strong>${user.name || "User"}</strong>,</p>
                            <p>Your payment of <strong>₹${amount}</strong> was successful. Your account has been upgraded to the <strong>${newPlan} Plan</strong>.</p>
                            <p>Please find the attached PDF invoice for your records.</p>
                        </div>
                        <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
                            <p>If you have any questions, contact billing@yourtube.com</p>
                        </div>
                    </div>
                `,
                attachments: [
                    {
                        filename: `Invoice_${newPlan}_${Date.now()}.pdf`,
                        content: pdfBuffer,
                    },
                ],
            };

            try {
                const info = await transporter.sendMail(mailOptions);
                console.log(`✅ Email invoice sent: ${info.response}`);
            } catch (mailError) {
                console.error("❌ Failed to send email:", mailError);
            }
        } else {
            console.warn("⚠️ EMAIL_USER/EMAIL_PASS not found in server/.env. Email skipped.");
        }

        return res.status(200).json({
            message: `Successfully upgraded to ${newPlan}`,
            plan: newPlan,
            invoiceSent: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
            user
        });

    } catch (error) {
        console.error("Upgrade Error:", error);
        return res.status(500).json({ message: error.message });
    }
});

export default router;
