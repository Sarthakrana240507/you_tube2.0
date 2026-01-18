import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTP = async (req, res) => {
    const { method, email, phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

    try {
        if (method === "email") {
            const mailOptions = {
                from: `"YourTube Security" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Your Login OTP Verification",
                html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: auto;">
            <h2 style="color: #df0000; text-align: center;">OTP Verification</h2>
            <p>Hello,</p>
            <p>Your one-time password (OTP) for logging into YourTube is:</p>
            <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #888;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="text-align: center; font-size: 10px; color: #aaa;">&copy; 2026 YourTube Clone Inc.</p>
          </div>
        `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`[AUTH] Email OTP ${otp} sent to ${email}`);

            return res.status(200).json({
                message: "OTP sent via Email successfully",
                methodUsed: "email",
            });
        } else {
            // Logic for Mobile OTP (Simulation)
            console.log(`[AUTH] SMS OTP ${otp} triggered for mobile: ${phone}`);

            // In a real app, you'd use a service like Twilio or Vonage here
            // For this task, we simulate the 'triggering' as requested

            return res.status(200).json({
                message: `OTP triggered via Mobile SMS for ${phone}`,
                methodUsed: "mobile",
                simulationOtp: otp // Included for ease of testing in this dev environment
            });
        }
    } catch (error) {
        console.error("OTP Send Error:", error);
        return res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};
