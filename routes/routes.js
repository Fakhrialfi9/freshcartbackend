// routes.js

import express from "express";
import { rateLimit } from "express-rate-limit";
import {
  SignupUserBasicInformation,
  SignupUserContactInformation,
  SignupUserProfileSetup,
  SignupUserAuthentication,
  SignupUserSecurityQuestion,
} from "../controllers/auth/signup.js";
import { upload } from "../utils/uploadFileHandlers.js";
import { SigninUser, SigninUserLimited } from "../controllers/auth/signin.js";
import { SignoutUser } from "../controllers/auth/signout.js";
import { getUser } from "../controllers/auth/getuser.js";
import { sendOTPByPhoneNumber, verifyOTPByPhoneNumber } from "../controllers/OTPByPhoneNumberControllers.js";
import { sendOTPByEmail, verifyOTPByEmail } from "../controllers/OTPByEmailControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ensurePreviousStepsCompleted } from "../middleware/ensurePreviousStepsCompleted.js";

const router = express.Router();

// Definisikan rate limit untuk membatasi percobaan login yang gagal
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 3, // Maksimum 3 percobaan dalam rentang waktu tersebut
  message: "Too many login attempts from this IP, please try again later.",
});

// POST /api/v1/auth/signup/basic-information
router.post("/signup/basicinformation", ensurePreviousStepsCompleted, SignupUserBasicInformation);

// POST /api/v1/auth/signup/contact-information
router.post("/signup/contactinformation", ensurePreviousStepsCompleted, SignupUserContactInformation);

// POST /api/v1/auth/signup/profile-setup
router.post("/signup/profilesetup", ensurePreviousStepsCompleted, upload.single("avatarUser"), SignupUserProfileSetup);

// POST /api/v1/auth/signup/security-question
router.post("/signup/securityquestion", ensurePreviousStepsCompleted, SignupUserSecurityQuestion);

// POST /api/v1/auth/signup/authentication
router.post("/signup/authentication", ensurePreviousStepsCompleted, SignupUserAuthentication);

// POST /api/v1/auth/signin
router.post("/signin", limiter, SigninUserLimited, SigninUser);

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
