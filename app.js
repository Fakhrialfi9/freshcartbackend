// app.js

import express from "express";
import session from "express-session";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import router from "./routes/routes.js";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { errorHandler, notFound } from "./middleware/errorhandler.js";
import { sendOTPByPhoneNumber, verifyOTPByPhoneNumber } from "./controllers/OTPByPhoneNumberControllers.js";
import { sendOTPByEmail, verifyOTPByEmail } from "./controllers/OTPByEmailControllers.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // maksimum 100 permintaan per windowMs
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
app.use(limiter);

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  }),
);

// Middleware untuk parsing application/json
app.use(express.json());

// Middleware untuk parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Middleware untuk cookie-parser
app.use(cookieParser());

// Logging middleware (gunakan hanya di environment development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set X-Frame-Options header untuk mengatasi clickjacking
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

// Route untuk endpoint root
app.get("/api/v1", (req, res) => {
  res.send("API is working");
});

// Route untuk OTP Phone Number
app.use("/api/v1/auth/phone", sendOTPByPhoneNumber, verifyOTPByPhoneNumber);

// Route untuk OTP Email
app.use("/api/v1/auth/email", sendOTPByEmail);

// Route untuk verifikasi OTP Email
app.use("/api/v1/auth/verify", verifyOTPByEmail);

// Gunakan router yang didefinisikan di routes.js
app.use("/api/v1/auth", router);

// Middleware untuk penanganan error
app.use(errorHandler);
app.use(notFound);

// Hubungkan ke MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Mulai server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
