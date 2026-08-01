// controllers/productController.js
const Product = require("../models/Product");

// GET single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "subCategory",
      select: "name category",
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET all products (optionally filtered by subCategory)
exports.getAllProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.subCategory) {
      filter.subCategory = req.query.subCategory;
    }
    const products = await Product.find(filter).populate({
      path: "subCategory",
      select: "name category",
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET all products of a subcategory (path param version)
exports.getProductsBySubCategory = async (req, res) => {
  try {
    const products = await Product.find({
      subCategory: req.params.subCategoryId,
    }).populate({ path: "subCategory", select: "name category" });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST create product
exports.createProduct = async (req, res) => {
  try {
    const { subCategory, name, description, price, stock, featured } = req.body;   // ← featured add kiya

    if (!subCategory || !name || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const image = req.file ? req.file.path : req.body.image;

    const product = await Product.create({
      subCategory,
      name,
      description,
      price,
      stock,                                                              // ← stock add kiya
      image,
      featured: featured === true || featured === "true",                 // ← featured add kiya
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT update product
exports.updateProduct = async (req, res) => {
  try {
    const { subCategory, name, description, price, stock, featured } = req.body;    // ← featured add kiya

    const updateData = { subCategory, name, description, price, stock };  // ← stock add kiya
    if (featured !== undefined) {
      updateData.featured = featured === true || featured === "true";      // ← featured add kiya
    }
    if (req.file) updateData.image = req.file.path;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .populate({
        path: "subCategory",
        populate: {
          path: "category",
        },
      });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET search products
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json([]);
    }

    const products = await Product.find({
      name: { $regex: q, $options: "i" },
    }).populate({ path: "subCategory", select: "name category" });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};