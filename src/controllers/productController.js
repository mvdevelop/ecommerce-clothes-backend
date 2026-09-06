import Product from "../models/Product.js";
import { validateProduct, validateUpdateProduct } from "../validation/productValidation.js";
import asyncHandler from "express-async-handler";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = asyncHandler(async (req, res) => {
  // Extract pagination parameters with default values
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  // Filter options
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === "true";
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Sort options
  const sort = req.query.sort || "-dateAdded";

  // Get total count for pagination metadata
  const total = await Product.countDocuments(filter);

  // Get products with pagination, filtering, and sorting
  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: products,
  });
});

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = validateProduct(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  const product = await Product.create(value);

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res, next) => {
  // Validate request body
  const { error, value } = validateUpdateProduct(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, value, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new ErrorResponse("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get new collection (latest products)
// @route   GET /api/products/new
// @access  Public
export const getNewCollection = asyncHandler(async (req, res) => {
  const products = await Product.find({})
    .sort("-dateAdded")
    .limit(8);

  res.status(200).json({
    success: true,
    data: products,
  });
});

// @desc    Get popular in women
// @route   GET /api/products/popular-women
// @access  Public
export const getPopularInWomen = asyncHandler(async (req, res) => {
  const products = await Product.find({ category: "women" })
    .sort("-ratings.count")
    .limit(4);

  res.status(200).json({
    success: true,
    data: products,
  });
});

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getNewCollection,
  getPopularInWomen,
};