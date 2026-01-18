import express from "express";
const router = express.Router();

import { sendOTP } from "../controllers/otpController.js";

router.post("/send-otp", sendOTP);

export default router;
