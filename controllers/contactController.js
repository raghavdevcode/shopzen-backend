const Contact = require("../models/contactModel");
const sendEmail = require("../utils/sendEmail");

const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    console.log("REQ BODY:", req.body);

    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    // Send Email to Admin
    await sendEmail({
      to: process.env.BREVO_FROM,
      subject: "New Contact Message - ShopZen",
      html: `
        <h2>New Contact Message</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>

        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
 

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createContact,
};