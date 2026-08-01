const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

const {
  getProductById,
  getAllProducts,
  getProductsBySubCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  searchProducts,
} = require("../controllers/productController");

// Public routes — koi bhi dekh sakta hai
router.get("/products", getAllProducts);
router.get("/products/featured", getFeaturedProducts);
router.get("/products/search", searchProducts);
router.get("/products/:id", getProductById);
router.get("/subcategories/:subCategoryId/products", getProductsBySubCategory);

// Admin-only routes
router.post("/products", verifyToken, verifyAdmin, upload.single("image"), createProduct);
router.put("/products/:id", verifyToken, verifyAdmin, upload.single("image"), updateProduct);
router.delete("/products/:id", verifyToken, verifyAdmin, deleteProduct);

module.exports = router;