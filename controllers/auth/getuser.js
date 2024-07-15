// getuser.js

import User from "../../models/User.js";

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
