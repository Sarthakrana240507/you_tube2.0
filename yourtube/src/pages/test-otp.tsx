"use client";
import { useEffect } from "react";
import { getOtpMethod } from "@/utils/otpUtils";

export default function TestOtpPage() {
  useEffect(() => {
    console.log("OTP South:", getOtpMethod("Tamil Nadu"));
    console.log("OTP South:", getOtpMethod("Kerala"));
    console.log("OTP Other:", getOtpMethod("Haryana"));
    console.log("OTP Other:", getOtpMethod("Delhi"));
    console.log("OTP Fallback:", getOtpMethod(null)); // ✔ Works in JS
  }, []);

  return <div className="p-4 text-xl text-black dark:text-white">Check console</div>;
}
