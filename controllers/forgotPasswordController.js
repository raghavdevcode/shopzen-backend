const crypto = require("crypto");
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const sendEmail = require("../utils/sendEmail");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // purana koi token tha to hatao (optional but recommended)
    await PasswordReset.deleteMany({ user: user._id });

    // naya record banao
    await PasswordReset.create({
      user: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

   const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Password",
      html: `<h2>Password Reset Request</h2>
             <p>Click below link to reset your password:</p>
             <a href="${resetUrl}">Reset Password</a>
             <p>This link will expire in 15 minutes.</p>`,
    });

    res.json({ message: "Reset password link sent to your email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = forgotPassword;