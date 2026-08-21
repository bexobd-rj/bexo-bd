import { Request, Response } from "express";
import nodemailer from "nodemailer";

// In-memory store for OTPs for simplicity (in production, use Redis or DB)
export const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export default async function sendOtp(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP (expires in 10 minutes)
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  // If SMTP is not configured, we fail fast or mock if instructed, 
  // but instruction says NO MOCK. So we try to send and fail if missing env vars.
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!host || !user || !pass) {
    console.warn("SMTP credentials not provided in .env. OTP was generated but not sent.");
    return res.status(500).json({ error: "SMTP configuration is missing on the server. Please add SMTP_HOST, SMTP_USER, SMTP_PASS to .env" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"Bexo BD" <${user}>`,
      to: email,
      subject: "Your Registration OTP Code - Bexo BD",
      text: `Your Bexo BD registration verification code is: ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Bexo BD Registration</h2>
          <p>Your verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 4px; color: #f97316; background: #fff7ed; padding: 10px 20px; border-radius: 8px; display: inline-block;">${otp}</h1>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ error: "Failed to send OTP email: " + error.message });
  }
}
