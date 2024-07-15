// Import necessary modules
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
import { errorHandler, notFound } from "./middleware/errorhandler.js";
import { sendOTPByPhoneNumber, verifyOTPByPhoneNumber } from "./controllers/OTPByPhoneNumberControllers.js";
import { sendOTPByEmail, verifyOTPByEmail } from "./controllers/OTPByEmailControllers.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet()); // Set various HTTP headers for security
app.use(mongoSanitize()); // Prevent MongoDB Operator Injection
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // Prevent client-side JavaScript access to cookies
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Mitigate CSRF attacks by asserting same-site
    },
  }),
);

// Middleware for parsing application/json
app.use(express.json());

// Middleware for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Middleware for cookie parsing
app.use(cookieParser());

// Logging middleware (use only in development environment)
if (process.env.NODE_ENV === "production") {
  app.use(morgan("dev"));
}

// Set X-Frame-Options header to mitigate clickjacking
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

// Route for root endpoint
app.get("/api/v1", (req, res) => {
  res.send("API is working");
});

// Routes for OTP Phone Number
app.use("/api/v1/auth/phone", sendOTPByPhoneNumber, verifyOTPByPhoneNumber);

// Route for OTP Email
app.use("/api/v1/auth/email", sendOTPByEmail);

// Route for verifying OTP Email
app.use("/api/v1/auth/verify", verifyOTPByEmail);

// Use router defined in routes.js
app.use("/api/v1/auth", router);

// Middleware for error handling
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Centralized error handling

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
  console.log(`Server running on http://localhost:${port}`);
});
