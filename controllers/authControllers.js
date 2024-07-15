// authControllers.js

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";

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

export const SignupUser = asyncHandler(async (req, res) => {
  const authRoleAdmin = (await User.countDocuments()) === 0;
  const role = authRoleAdmin ? "admin" : "user";
  const { firstName, lastName, email, password, phoneNumber, address, city, state, country, postalCode, avatarUser, userName, bio } = req.body;

  // Create new user using User model
  const createUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    address,
    city,
    state,
    country,
    postalCode,
    avatarUser,
    userName,
    bio,
    role,
  });

  // Send JWT cookie and user data in response
  createSendToken(createUser, 201, res);
});

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

export const SignoutUser = (req, res) => {
  // Menghapus cookie jwt dengan mengatur expire date-nya ke tanggal 1 Januari 1970
  res.cookie("jwt", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: false, // Ubah dari 'security' menjadi 'secure'
  });

  // Memberikan respons bahwa signout berhasil dengan status 200
  res.status(200).json({ message: "Signout Successfully" });
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select({ password: 0 });

    if (user) {
      return res.status(200).json({ user });
    } else {
      return res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// export const SignupUserSecurityQuestion = asyncHandler(async (req, res) => {
//   const { securityQuestions } = req.body;

//   // Validate the presence of both security questions
//   if (!securityQuestions || securityQuestions.length !== 2) {
//     return res.status(400).json({ message: "Both security questions and answers are required" });
//   }

//   // Get user data from session
//   let signupData = req.session.signupData || {};

//   // Merge data from this step with existing session data
//   signupData = {
//     ...signupData,
//     securityQuestions: securityQuestions,
//   };

//   try {
//     // Create user in database with all collected data
//     const createUser = await User.create(signupData);

//     // Save user data to session
//     clearSignupData(req, signupData);

//     // Send response with token or other required information
//     createSendToken(createUser, 201, res);
//   } catch (error) {
//     // Handle error if user creation fails
//     res.status(500).json({ message: "Error registering user", error });
//   }
// });
