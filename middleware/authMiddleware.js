import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({
      message: "You are not authorized to access this page.",
    });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    } else {
      return res.status(401).json({ message: "Failed to authenticate token." });
    }
  }
};

// export const authMiddleware = async (req, res, next) => {
//   let token;
//   token = req.cookies.jwt;

//   if (!token) {
//     return res.status(401).json({
//       message: "You are not authorized to access this page.",
//     });
//   }

//   let decoded;
//   try {
//     decoded = await jwt.verify(token, process.env.JWT_SECRET);
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token." });
//   }

//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return res.status(401).json({
//       message: "User not found.",
//     });
//   }

//   req.user = currentUser;
//   next();
// };
