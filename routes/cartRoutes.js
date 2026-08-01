const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cartController");

router.get("/", verifyToken, getCart);
router.post("/", verifyToken, addToCart);
router.put("/:productId", verifyToken, updateCartQuantity);
router.delete("/:productId", verifyToken, removeFromCart);

module.exports = router;