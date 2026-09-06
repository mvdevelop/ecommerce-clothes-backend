import { Router, Response } from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.js";

const router = Router();

const getParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
router.post(
  "/",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { productId, quantity = 1 } = req.body as { productId: string; quantity?: number };

    if (!productId) {
      res.status(400).json({ success: false, error: "Product ID is required" });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    if (!user.cartData) user.cartData = {};

    if (user.cartData[productId]) {
      user.cartData[productId] += quantity;
    } else {
      user.cartData[productId] = quantity;
    }

    await user.save();

    res.status(200).json({ success: true, data: user.cartData });
  })
);

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete(
  "/:productId",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const productId = getParam(req.params.productId);

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    if (!user.cartData || !user.cartData[productId]) {
      res.status(404).json({ success: false, error: "Product not found in cart" });
      return;
    }

    delete user.cartData[productId];
    await user.save();

    res.status(200).json({ success: true, data: user.cartData });
  })
);

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
router.put(
  "/:productId",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const productId = getParam(req.params.productId);
    const { quantity } = req.body as { quantity: number };

    if (typeof quantity !== "number" || quantity < 0) {
      res.status(400).json({ success: false, error: "Quantity must be a positive number" });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    if (!user.cartData || !user.cartData[productId]) {
      res.status(404).json({ success: false, error: "Product not found in cart" });
      return;
    }

    if (quantity === 0) {
      delete user.cartData[productId];
    } else {
      user.cartData[productId] = quantity;
    }

    await user.save();

    res.status(200).json({ success: true, data: user.cartData });
  })
);

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get(
  "/",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?._id);
    res.status(200).json({ success: true, data: user?.cartData || {} });
  })
);

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
router.delete(
  "/",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await User.findById(req.user?._id);
    if (user) {
      user.cartData = {};
      await user.save();
    }
    res.status(200).json({ success: true, data: {} });
  })
);

export default router;