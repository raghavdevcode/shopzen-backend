// middleware/verifyCaptcha.js
import axios from "axios";

export const verifyCaptcha = async (req, res, next) => {
  try {
    const { captchaToken } = req.body;

    if (!captchaToken) {
      return res.status(400).json({ message: "Captcha token missing" });
    }

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
        },
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ message: "Captcha verification failed" });
    }

    next(); // sab theek hai, aage badho
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Captcha verification error" });
  }
};