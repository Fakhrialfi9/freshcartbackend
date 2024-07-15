// app.js

import express from "express";
import session from "express-session";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import router from "./routes/routes.js";
import csrf from "csurf";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler, notFound } from "./middleware/errorhandler.js";
import { sendOTPByPhoneNumber, verifyOTPByPhoneNumber } from "./controllers/OTPByPhoneNumberControllers.js";
import { sendOTPByEmail, verifyOTPByEmail } from "./controllers/OTPByEmailControllers.js";

dotenv.config();

const app = express();
const csrfProtection = csrf();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(mongoSanitize());
app.use(csrfProtection);
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set X-Frame-Options header
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" ? true : false },
  }),
);

// Endpoint untuk root
app.get("/api/v1", (req, res) => {
  res.send("API is working");
});

// Gunakan router OTP Phone Number
app.use("/api/v1/auth/phone", sendOTPByPhoneNumber, verifyOTPByPhoneNumber);

// Gunakan router OTP Email
app.use("/api/v1/auth/email", sendOTPByEmail);

// Gunakan router untuk verifikasi OTP Email
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

// Redirect if top !== self
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(["https://", req.get("Host"), req.url].join(""));
    }
    next();
  });
}

// Mulai server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
