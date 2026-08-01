const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

// Public routes — koi bhi dekh sakta hai
router.get("/", getCategories);
router.get("/:id", getCategory);

// Protected + Admin-only routes
router.post("/", verifyToken, verifyAdmin, upload.single("image"), createCategory);
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"), updateCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

module.exports = router;