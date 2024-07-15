// OTPByPhoneNumberControllers.js

import OtpsByPhoneNumber from "../models/OTPS-ByPhoneNumber.js";
import randomstring from "randomstring";

// Generate OTP
function generateOTP() {
  return randomstring.generate({
    length: 6,
    charset: "numeric",
  });
}

// Send OTP to the provided phone number via SMS
export const sendOTPByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const otp = generateOTP();
    const newOTP = new OtpsByPhoneNumber({ phoneNumber, otp });
    await newOTP.save();

    // Replace with your SMS sending logic
    await sendSMS(phoneNumber, `Your OTP is: ${otp}`);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Verify OTP provided by the user
export const verifyOTPByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.query;
    const existingOTP = await OtpsByPhoneNumber.findOneAndDelete({ phoneNumber, otp });

    if (existingOTP) {
      res.status(200).json({ success: true, message: "OTP verification successful" });
    } else {
      res.status(400).json({ success: false, error: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
