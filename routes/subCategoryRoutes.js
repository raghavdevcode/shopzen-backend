const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategoryController");

// Public routes
router.get("/", getSubCategories);
router.get("/:id", getSubCategory);

// Admin-only routes
router.post("/", verifyToken, verifyAdmin, upload.single("image"), createSubCategory);
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"), updateSubCategory);
router.delete("/:id", verifyToken, verifyAdmin, deleteSubCategory);

module.exports = router;