const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

router.get("/", verifyToken, getWishlist);
router.post("/", verifyToken, addToWishlist);
router.delete("/:productId", verifyToken, removeFromWishlist);

module.exports = router;