const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Register User
const registerUser = async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;

        if (!name || !phone || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isActivated) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const activationCode = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 10 * 60 * 1000); //valid for 10 mins

        // Agar pehle se unactivated user hai to usse update karo
        let user;
        if (existingUser && !existingUser.isActivated) {
            user = await User.findByIdAndUpdate(
                existingUser._id,
                { actCode: activationCode, actCodeExpiry: expiry },
                { new: true }
            );
        } else {
            user = await User.create({ name, phone, email, password, actCode: activationCode, actCodeExpiry: expiry });
        }

        try {
            await sendEmail({
                to: email,
                subject: "Your Activation Code",
                html: `
                    <h2>Thankyou for registering on <b>ShopZen!</b></h2>
                    <p>Your 6-digit activation code is:</p>
                    <h1 style="letter-spacing: 8px; color: #378ADD;">${activationCode}</h1>
                    <p>This code is valid for one-time use only.</p>
                `,
            });
        } catch (emailError) {
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: "Could not send verification email. Please try again." });
        }

        res.status(201).json({
            message: "User registered. Please check your email for the 6-digit code.",
            userId: user._id  // frontend ko bhejo taaki verify mein use ho sake
        });

    } catch (error) {
        console.error("Register error:", error.message);
        res.status(500).json({ message: "Something went wrong, please try again" });
    }
};
//login 
const loginUser = async (req, res) => {
    try {
        const { uname, pass, remember } = req.body;

        if (!uname || !pass) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const user = await User.findOne({ email: uname });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.isActivated) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
            });
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        const expiresIn = remember ? "7d" : "1h";
        const maxAge = remember ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                remember: !!remember,
            },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === "true",
            sameSite: process.env.COOKIE_SAMESITE || "lax",
            maxAge,
        });

        res.status(200).json({
            success: true,
            message: "Login Successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

// Verify OTP Code
const verifyCode = async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ message: "userId and code are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isActivated) {
            return res.status(400).json({ message: "Account already activated" });
        }

        if (String(user.actCode) !== String(code)) {
            return res.status(400).json({ message: "Invalid activation code" });
        }

        if (user.actCodeExpiry < new Date()) {
            return res.status(400).json({ message: "Code has expired. Please request a new one." });
        }

        await User.findByIdAndUpdate(user._id, {
            isActivated: true,
            actCode: null,
            actCodeExpiry: null
        });

        res.status(200).json({ message: "Account activated successfully!" });

    } catch (error) {
        console.error("Verify error:", error.message);
        res.status(500).json({ message: "Something went wrong" });
    }
};

//  Resend Code
const resendCode = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isActivated) {
            return res.status(400).json({ message: "Account already activated" });
        }

        const newCode = Math.floor(100000 + Math.random() * 900000);
        user.actCode = newCode;
        user.actCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await User.findByIdAndUpdate(user._id, {
            actCode: newCode,
            actCodeExpiry: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendEmail({
            to: user.email,
            subject: "Your New Activation Code",
            html: `
                <h2>Welcome back to ShopZen</h2>
                <p>Your new 6-digit activation code is:</p>
                <h1 style="letter-spacing: 8px; color: #378ADD;">${newCode}</h1>
                <p>This code is valid for one-time use only.</p>
            `,
        });

        res.status(200).json({ message: "New code sent to your email." });

    } catch (error) {
        console.error("Resend error:", error.message);
        res.status(500).json({ message: "Could not resend email. Try again." });
    }
};

const checkAuth = (req, res) => {
    res.status(200).json({ message: "Token valid", user: req.user });
};

module.exports = { registerUser, loginUser, verifyCode, resendCode, checkAuth };