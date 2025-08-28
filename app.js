// Import required modules
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
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
import { errorHandler, notFound } from "./middleware/errorhandler.js";
import { sendOTPByPhoneNumber, verifyOTPByPhoneNumber } from "./controllers/OTPByPhoneNumberControllers.js";
import { sendOTPByEmail, verifyOTPByEmail } from "./controllers/OTPByEmailControllers.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Rate limiter middleware setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: "draft-7", // specifying standard headers
  legacyHeaders: false, // using modern header handling
});

// Function to encrypt text using AES
const encryptText = (text) => {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return { encrypted, key: key.toString("base64"), iv: iv.toString("base64") };
};

// Middleware setup
app.use(limiter); // Apply rate limiter
app.use(helmet()); // Enhance security with Helmet
app.use(mongoSanitize()); // Prevent MongoDB injection attacks
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
// app.use(express.static("public")); // express.static
app.use(express.static(path.join(__dirname, "public"))); // express.static

// Use Morgan in development environment for HTTP request logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("dev"));
}

// Set trust proxy untuk mendukung X-Forwarded-For header
app.set("trust proxy", 1);

// Generate and encrypt SESSION_SECRET
const { encrypted: sessionSecretEncrypted, key: sessionKey, iv: sessionIV } = encryptText(process.env.SESSION_SECRET);
app.use(
  session({
    secret: sessionSecretEncrypted, // Use the encrypted SESSION_SECRET
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Cookie options
  }),
);

// Set X-Frame-Options header to mitigate clickjackings
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});

// Simulate storedHash (replace with actual value from the appropriate source)
let storedHash = process.env.STORED_HASH;

// Endpoint to send HTML response
app.get("/api/v1/", (req, res) => {
  const url = req.originalUrl;
  // Create SHA-256 hash of the URL
  const hash = crypto.createHash("sha256").update(url).digest("hex");

  // Compare with the stored hash
  if (hash === storedHash) {
    console.log("URL is already encrypted");
  } else {
    console.log("URL is not encrypted or does not match the previous one");
  }

  // Encrypt API_RESPONSE value
  const { encrypted: apiResponseEncrypted, key: apiResponseKey, iv: apiResponseIV } = encryptText(process.env.API_RESPONSE);

  const htmlResponse = `
    <html>
      <head>
        <style>
          .api-response {
            display: flex;
            flex-direction: column;
            width: 100% !important;
            max-width: 100% !important;
            height: auto;
            max-height: auto;
            min-height: auto;
            justify-content: center;
            align-items: center;
            align-content: center;
            margin: 0 auto;
            padding: 0 1rem 1.5rem 1rem;
            background-color: white;
            white-space: pre-line;
            word-break: break-word;
            overflow-x: hidden;
            box-sizing: border-box;
            text-align: justify;
          }
        </style>
      </head>
      <body>
        <div class="api-response">
          ${apiResponseEncrypted}
        </div>
        <div style="display: none;">Key: ${apiResponseKey}, IV: ${apiResponseIV}</div> 
      </body>
    </html>
  `;
  res.send(htmlResponse); // Send HTML response to client
});

// Route for OTP by phone number
app.use("/api/v1/auth/phone", sendOTPByPhoneNumber, verifyOTPByPhoneNumber);

// Route for OTP by email
app.use("/api/v1/auth/email", sendOTPByEmail);

// Route for OTP verification by email
app.use("/api/v1/auth/verify", verifyOTPByEmail);

// Use custom routes defined in routes.js
app.use("/api/v1/auth", router);

// Error handling middleware
app.use(errorHandler);

// Middleware for handling 404 - Not Found errors
app.use(notFound);

// Connect to MongoDB database
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
  console.log(`Server is running at http://localhost:${port}`);
});
