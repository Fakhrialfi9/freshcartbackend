// routes.js

import express from "express";
import {
  SignupUserBasicInformation,
  SignupUserContactInformation,
  SignupUserProfileSetup,
  SignupUserAuthentication,
  SignupUserSecurityQuestion,
} from "../controllers/auth/signup.js";
import { SigninUser } from "../controllers/auth/signin.js";
import { SignoutUser } from "../controllers/auth/signout.js";
import { getUser } from "../controllers/auth/getuser.js";
import { sendOTPByPhoneNumber, verifyOTPByPhoneNumber } from "../controllers/OTPByPhoneNumberControllers.js";
import { sendOTPByEmail, verifyOTPByEmail } from "../controllers/OTPByEmailControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ensurePreviousStepsCompleted } from "../middleware/ensurePreviousStepsCompleted.js";

const router = express.Router();

// POST /api/v1/auth/signup/basic-information
router.post("/signup/basicinformation", SignupUserBasicInformation);

// POST /api/v1/auth/signup/contact-information
router.post("/signup/contactinformation", SignupUserContactInformation);

// POST /api/v1/auth/signup/profile-setup
router.post("/signup/profilesetup", SignupUserProfileSetup);

// POST /api/v1/auth/signup/security-question
router.post("/signup/securityquestion", SignupUserSecurityQuestion);

// POST /api/v1/auth/signup/authentication
router.post("/signup/authentication", ensurePreviousStepsCompleted, SignupUserAuthentication);

// POST /api/v1/auth/signin
router.post("/signin", SigninUser);

// GET /api/v1/auth/signout
router.get("/signout", SignoutUser);

// GET /api/v1/auth/getuser
router.get("/getuser", authMiddleware, getUser);

// Route untuk mengirim OTP
router.get("/otp", sendOTPByPhoneNumber);

// Route untuk memverifikasi OTP
router.get("/verify-otp", verifyOTPByPhoneNumber);

// Route untuk mengirim OTP
router.get("/otp", sendOTPByEmail);

// Route untuk memverifikasi OTP
router.get("/otp", verifyOTPByEmail);

export default router;
