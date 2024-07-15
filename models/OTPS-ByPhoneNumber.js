// models/OTPS-ByPhoneNumber.js

import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "10m" }, // OTP expires after 10 minutes
});

const OtpsByPhoneNumber = mongoose.model("OtpsByPhoneNumber", otpSchema);
export default OtpsByPhoneNumber;
