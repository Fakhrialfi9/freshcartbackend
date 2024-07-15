// signin.js

import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../../middleware/asyncHandler.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    security: false,
  };

  // Set JWT cookie in the response
  res.cookie("jwt", token, cookieOptions);

  // Remove sensitive data from user object
  user.password = undefined;

  // Send response with user data and status code
  res.status(statusCode).json({
    data: user,
  });
};

export const SigninUser = asyncHandler(async (req, res) => {
  // Check if email and password are provided
  if (!req.body.email && !req.body.password) {
    res.status(400);
    throw new Error("Email and Password are required fields");
  }

  // Find user by email and validate password
  const userData = await User.findOne({
    email: req.body.email,
  });

  if (userData && (await userData.comparePassword(req.body.password))) {
    createSendToken(userData, 200, res);
  } else {
    // User not found or password does not match
    res.status(400);
    throw new Error("Invalid email or Password");
  }
});
