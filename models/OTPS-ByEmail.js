// OTPS-ByEmail.js

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "10m" }, // OTP expires after 10 minutes
});

const OtpsByEmail = mongoose.model("OtpsByEmail", otpSchema);
export default OtpsByEmail;
