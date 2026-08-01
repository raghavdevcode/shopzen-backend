const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1. pehle password validate karo
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 2. token hash karo
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 3. DB se record dhundo aur delete karo (ye pehli aur ek hi baar declare ho raha hai)
    const resetRecord = await PasswordReset.findOneAndDelete({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    // 4. AB check karo ki mila ya nahi
    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 5. user dhundo
    const user = await User.findById(resetRecord.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 6. password update karo
    user.password = password;
    await user.save();

    // 7. baaki purane tokens bhi saaf kar do (optional)
    await PasswordReset.deleteMany({ user: resetRecord.user });

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
};

module.exports = resetPassword;