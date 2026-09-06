import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
router.post("/", protect, asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      error: "Product ID is required",
    });
  }

  const user = await User.findById(req.user._id);

  // Initialize cartData if it doesn't exist
  if (!user.cartData) {
    user.cartData = {};
  }

  // Increment quantity if product already in cart
  if (user.cartData[productId]) {
    user.cartData[productId] += quantity;
  } else {
    user.cartData[productId] = quantity;
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user.cartData,
  });
}));

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete("/:productId", protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user.cartData || !user.cartData[productId]) {
    return res.status(404).json({
      success: false,
      error: "Product not found in cart",
    });
  }

  delete user.cartData[productId];
  await user.save();

  res.status(200).json({
    success: true,
    data: user.cartData,
  });
}));

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
router.put("/:productId", protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({
      success: false,
      error: "Quantity must be a positive number",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user.cartData || !user.cartData[productId]) {
    return res.status(404).json({
      success: false,
      error: "Product not found in cart",
    });
  }

  if (quantity === 0) {
    delete user.cartData[productId];
  } else {
    user.cartData[productId] = quantity;
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user.cartData,
  });
}));

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get("/", protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: user.cartData || {},
  });
}));

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
router.delete("/", protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.cartData = {};
  await user.save();

  res.status(200).json({
    success: true,
    data: {},
  });
}));

export default router;