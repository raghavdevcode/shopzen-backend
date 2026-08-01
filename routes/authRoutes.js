const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyCode,
  resendCode,
  checkAuth,
} = require("../controllers/authController");

const resetPassword = require("../controllers/resetPasswordController");
const forgotPassword = require("../controllers/forgotPasswordController");
const changePassword = require("../controllers/changePasswordController");
const verifyToken = require("../middleware/verifyToken");



router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/check-auth", verifyToken, checkAuth);
router.post("/forgot-password",forgotPassword)
router.post("/reset-password/:token",resetPassword)
router.post("/change-password",verifyToken,changePassword)
router.post("/verify-code", verifyCode);  
router.post("/resend-code", resendCode);
module.exports = router;