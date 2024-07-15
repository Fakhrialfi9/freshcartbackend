// app.js

import express from "express";
import session from "express-session"; // Import session module
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import router from "./routes/routes.js";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import { errorHandler, notFound } from "./middleware/errorhandler.js";
import { sendOTPByPhoneNumber, verifyOTPByPhoneNumber } from "./controllers/OTPByPhoneNumberControllers.js";
import { sendOTPByEmail, verifyOTPByEmail } from "./controllers/OTPByEmailControllers.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

// Endpoint for root
app.get("/api/v1", (req, res) => {
  res.send("Test API is working");
});

// Use the OTP Phone Number router
app.use("/api/v1/auth/phone", sendOTPByPhoneNumber, verifyOTPByPhoneNumber);

// Use the OTP Email router
app.use("/api/v1/auth/email", sendOTPByEmail);

// Use the OTP Email router
app.use("/api/v1/auth/verify", verifyOTPByEmail);

// Use the router defined in routes.js
app.use("/api/v1/auth", router);

app.use(errorHandler);
app.use(notFound);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Start the server
app.listen(port, () => {
  console.log(`Server berjalan pada http://localhost:${port}`);
});
