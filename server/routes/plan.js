import express from "express";
import User from "../models/Auth.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

const router = express.Router();

/**
 * Generate PDF Invoice in-memory
 */
const generateInvoicePDF = (user, plan, amount, paymentId) => {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fillColor("#444444").fontSize(20).text("INVOICE", { align: "right" });
        doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
        doc.text(`Invoice #: INV-${Date.now().toString().slice(-6)}`, { align: "right" });
        doc.moveDown();

        // Company Details
        doc.fillColor("#000000").fontSize(14).text("YourTube Clone Inc.", { align: "left" });
        doc.fontSize(10).text("123 Tech Avenue, Silicon Valley", { align: "left" });
        doc.text("Email: billing@yourtube.com", { align: "left" });
        doc.moveDown();

        // Bill To
        doc.fontSize(12).text("Bill To:", { underline: true });
        doc.fontSize(10).text(`Name: ${user.name || "Valued User"}`);
        doc.text(`Email: ${user.email}`);
        doc.moveDown();

        // Table Header
        const tableTop = 250;
        doc.fontSize(10).text("Description", 50, tableTop);
        doc.text("Plan Tier", 200, tableTop);
        doc.text("Transaction ID", 300, tableTop);
        doc.text("Amount (INR)", 450, tableTop, { align: "right" });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Content
        const rowTop = tableTop + 30;
        doc.text("Premium Subscription Upgrade", 50, rowTop);
        doc.text(plan, 200, rowTop);
        doc.text(paymentId, 300, rowTop);
        doc.text(`Rs. ${amount}.00`, 450, rowTop, { align: "right" });

        // Total
        doc.moveTo(50, rowTop + 20).lineTo(550, rowTop + 20).stroke();
        doc.fontSize(12).fillColor("#df0000").text("Total:", 350, rowTop + 40);
        doc.text(`Rs. ${amount}.00`, 450, rowTop + 40, { align: "right" });

        // Footer
        doc.fillColor("#888888").fontSize(10).text("Thank you for your business!", 50, 700, { align: "center", width: 500 });

        doc.end();
    });
};

/* ===============================
   UPGRADE PLAN
   =============================== */
router.post("/upgrade", async (req, res) => {
    const { userId, amount, paymentId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        let newPlan = "Free";
        if (amount === 10) newPlan = "Bronze";
        else if (amount === 50) newPlan = "Silver";
        else if (amount === 100) newPlan = "Gold";
        else return res.status(400).json({ message: "Invalid amount for upgrade" });

        user.plan = newPlan;
        user.isPremium = true;
        await user.save();

        console.log(`Plan upgraded for ${user.email} to ${newPlan}`);

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(user, newPlan, amount, paymentId);

        // Only attempt email if credentials exist
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
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

            await transporter.sendMail(mailOptions);
            console.log(`Email invoice with PDF sent to ${user.email}`);
        } else {
            console.warn("EMAIL_USER/EMAIL_PASS not found in server/.env. Email skipped.");
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
