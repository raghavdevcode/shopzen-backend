// controllers/changePasswordController.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please login again." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // current password match check
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // naya password purane jaisa na ho
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password cannot be the same as current password",
      });
    }

    user.password = newPassword;
    await user.save();
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAMESITE || "lax",
    });
    res.json({ message: "Password changed successfully, Please login again." });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = changePassword;