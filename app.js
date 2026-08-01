require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); 
const app = express();
app.use(
  cors({
    origin: `${process.env.CLIENT_URL}`, 
    credentials: true,               
  })
);
app.use(express.json());
app.use(cookieParser()); 

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contact", contactRoutes);
const categoryRoutes=require("./routes/categoryRoutes");
app.use("/api/categories",categoryRoutes);
const subCategoryRoutes = require("./routes/subCategoryRoutes")
app.use("/api/subcategories",subCategoryRoutes)
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
const productRoutes = require("./routes/productRoutes");
app.use("/api", productRoutes);
const wishlistRoutes = require("./routes/wishlistRoutes");
app.use("/api/wishlist", wishlistRoutes);
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);
 const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);

/* HEALTH CHECK (useful for deployment) */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/", (req, res) => {
  res.send("API Running...");
});

module.exports = app;