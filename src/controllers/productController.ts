import { Request, Response, NextFunction } from "express";
import Product from "../models/Product.js";
import { validateProduct, validateUpdateProduct } from "../validation/productValidation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import { AuthRequest } from "../middleware/auth.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 12;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === "true";
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    const sort = (req.query.sort as string) || "-dateAdded";

    const total = await Product.countDocuments(filter);

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
  }
);

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      next(new ErrorResponse("Product not found", 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { error, value } = validateProduct(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const product = await Product.create(value);

    res.status(201).json({
      success: true,
      data: product,
    });
  }
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { error, value } = validateUpdateProduct(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      next(new ErrorResponse("Product not found", 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      next(new ErrorResponse("Product not found", 404));
      return;
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

// @desc    Get new collection (latest products)
// @route   GET /api/products/new
// @access  Public
export const getNewCollection = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const products = await Product.find({})
      .sort("-dateAdded")
      .limit(8);

    res.status(200).json({
      success: true,
      data: products,
    });
  }
);

// @desc    Get popular in women
// @route   GET /api/products/popular-women
// @access  Public
export const getPopularInWomen = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const products = await Product.find({ category: "women" })
      .sort("-ratings.count")
      .limit(4);

    res.status(200).json({
      success: true,
      data: products,
    });
  }
);

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getNewCollection,
  getPopularInWomen,
};