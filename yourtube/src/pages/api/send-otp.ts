import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, email, phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  if (method === "email") {
    console.log(`Email OTP sent to ${email}: ${otp}`);
  } else {
    console.log(`SMS OTP sent to ${phone}: ${otp}`);
  }

  res.status(200).json({ success: true });
}
