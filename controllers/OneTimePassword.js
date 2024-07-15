// // OneTimePassword.js

// import express from "express";
// const router = express.Router();
// import randomstring from "randomstring";

// // Function to generate OTP
// function generateOTP() {
//   return randomstring.generate({
//     length: 6,
//     charset: "numeric",
//   });
// }

// router.post("/sendotp", (req, res) => {
//   const { phoneNumber, email, otp } = req.body;

//   // Debug: Log received request body
//   console.log("Received request:", req.body);

//   if (!phoneNumber && !email) {
//     return res.status(400).json({ success: false, message: "Phone number or email is required" });
//   }

//   if (!otp) {
//     return res.status(400).json({ success: false, message: "OTP is required" });
//   }

//   try {
//     const generatedOTP = generateOTP(); // Renamed to avoid conflict

//     if (otp === generatedOTP) {
//       res.status(200).json({ success: true, message: "OTP Request Success" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Error processing /sendotp request:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// });

// export default router;
