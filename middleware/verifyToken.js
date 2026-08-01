const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided. Please login." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, remember, iat, exp }

    // token refresh logic
    const timeLeft = decoded.exp - Math.floor(Date.now() / 1000);
    if (timeLeft < 5 * 60) {
      const remember = decoded.remember || false;
      const expiresIn = remember ? "7d" : "1h";
      const maxAge = remember ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role, remember },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      res.cookie("authToken", newToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === "true",
        sameSite: process.env.COOKIE_SAMESITE || "lax",
        maxAge,
      });
    }

    next();
  } catch (err) {
    console.log("JWT verify error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token. Please login again." });
  }
};