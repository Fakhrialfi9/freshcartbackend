// signup.js

import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../../middleware/asyncHandler.js";

// Helper function to get signup data from session
const getSignupData = (req) => {
  return req.session.signupData || {};
};

// Helper function to save signup data to session
const saveSignupData = (req, data) => {
  req.session.signupData = { ...req.session.signupData, ...data };
};

// Helper function to clear signup data from session
const clearSignupData = (req) => {
  delete req.session.signupData;
};

// Helper function to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Helper function to send JWT token and user data in response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: false,
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    data: user,
  });
};

/**
 * Handle user signup with basic information
 **/

// |------------------------------------------------------------------------------|
// |                                                                              |
// |                         SIGNUP PROCESS - BATCH 1                             |
// |                                                                              |
// |------------------------------------------------------------------------------|

export const SignupUserBasicInformation = asyncHandler(async (req, res) => {
  const authRoleAdmin = (await User.countDocuments()) === 0;
  const role = authRoleAdmin ? "admin" : "user";

  let signupData = getSignupData(req);

  const { firstName, lastName, email, password } = req.body;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({ message: "Email already exists" });
  }

  saveSignupData(req, {
    firstName,
    lastName,
    email,
    password,
    role,
  });

  res.status(200).json({ message: "Basic information saved" });
});

/**
 * Handle user signup with contact information
 **/

// |------------------------------------------------------------------------------|
// |                                                                              |
// |                         SIGNUP PROCESS - BATCH 2                             |
// |                                                                              |
// |------------------------------------------------------------------------------|

// Import asyncHandler to handle async/await properly
export const SignupUserContactInformation = asyncHandler(async (req, res) => {
  let signupData = getSignupData(req);

  const { phoneNumber, address, city, state, country, postalCode } = req.body;

  saveSignupData(req, {
    phoneNumber,
    address,
    city,
    state,
    country,
    postalCode,
  });

  res.status(200).json({ message: "Contact information saved" });
});

/**
 * Handle user signup with profile setup
 **/

// |------------------------------------------------------------------------------|
// |                                                                              |
// |                         SIGNUP PROCESS - BATCH 3                             |
// |                                                                              |
// |------------------------------------------------------------------------------|

// Import asyncHandler to handle async/await properly
export const SignupUserProfileSetup = asyncHandler(async (req, res) => {
  let signupData = getSignupData(req);

  const { avatarUser, userName, bio } = req.body;

  const file = req.file;

  try {
    // Validasi apakah userName sudah ada
    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Validasi apakah file ada
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Simpan file avatarUser dan path-nya
    const imageFileName = file.filename;
    const pathImageFile = `/user/avatarUser/${imageFileName}`;

    saveSignupData(req, {
      avatarUser: pathImageFile,
      userName,
      bio,
    });

    // Berikan respons berhasil
    res.status(200).json({ message: "Profile setup saved", data: saveSignupData });
  } catch (error) {
    console.error("SignupUserProfileSetup error:", error);
    // Berikan respons gagal dengan status dan pesan yang sesuai
    res.status(500).json({ message: "Failed to save profile setup", error: error.message });
  }
});

/**
 * Handle user signup with security question
 **/

// |------------------------------------------------------------------------------|
// |                                                                              |
// |                         SIGNUP PROCESS - BATCH  4                            |
// |                                                                              |
// |------------------------------------------------------------------------------|

// Import asyncHandler to handle async/await properly
export const SignupUserSecurityQuestion = asyncHandler(async (req, res) => {
  let signupData = getSignupData(req);

  const { securityQuestions } = req.body;

  if (!securityQuestions || securityQuestions.length !== 2) {
    return res.status(400).json({ message: "Both security questions and answers are required" });
  }

  saveSignupData(req, {
    securityQuestions,
  });

  res.status(200).json({ message: "Security questions saved" });
});

/**
 * Handle user signup with authentication
 **/
// |------------------------------------------------------------------------------|
// |                                                                              |
// |                         SIGNUP PROCESS - BATCH  5                            |
// |                                                                              |
// |------------------------------------------------------------------------------|

// Import asyncHandler to handle async/await properly
export const SignupUserAuthentication = asyncHandler(async (req, res) => {
  let signupData = getSignupData(req);

  const { verifyotp } = req.body;

  saveSignupData(req, {
    verifyotp,
  });

  try {
    const createUser = await User.create(signupData);
    clearSignupData(req);
    createSendToken(createUser, 201, res);
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});
