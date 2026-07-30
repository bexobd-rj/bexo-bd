import { Request, Response } from "express";
import { otpStore } from "./send-otp.ts";

export default async function verifyOtp(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const record = otpStore.get(email);
  
  if (!record) {
    return res.status(400).json({ error: "No OTP requested for this email or it has expired" });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP has expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  // OTP is correct
  otpStore.delete(email);
  res.status(200).json({ success: true, message: "OTP verified successfully" });
}
