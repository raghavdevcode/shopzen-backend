const SubCategory = require("../models/SubCategory");

// Create Sub Category
const createSubCategory = async (req, res) => {
  try {
    const { category, name } = req.body;

    const subCategory = await SubCategory.create({
      category,
      name,
      image: req.file.path,
    });

    res.status(201).json(subCategory);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Sub Categories (with optional category filter)
const getSubCategories = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const subCategories = await SubCategory.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(subCategories);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get Single Sub Category
const getSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!subCategory) {
      return res.status(404).json({
        message: "Sub Category not found",
      });
    }

    res.json(subCategory);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Sub Category
const updateSubCategory = async (req, res) => {
  try {
    const updateData = {
      category: req.body.category,
      name: req.body.name,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!subCategory) {
      return res.status(404).json({
        message: "Sub Category not found",
      });
    }

    res.json(subCategory);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete Sub Category
const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        message: "Sub Category not found",
      });
    }

    res.json({
      message: "Sub Category deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
};