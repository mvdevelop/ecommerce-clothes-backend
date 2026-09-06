import { Request, Response, NextFunction } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { validateOrder } from "../validation/orderValidation.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import { AuthRequest } from "../middleware/auth.js";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { error, value } = validateOrder(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
      return;
    }

    const userId = req.user?._id;
    if (!userId) {
      next(new ErrorResponse("User not found", 404));
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      next(new ErrorResponse("User not found", 404));
      return;
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of value.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        next(new ErrorResponse(`Product ${item.product} not found`, 404));
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          error: `Not enough stock for ${product.name}. Available: ${product.stock}`,
        });
        return;
      }

      const price = product.new_price;
      totalAmount += price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price,
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress: value.shippingAddress,
      paymentMethod: value.paymentMethod,
      totalAmount,
      discount: value.discount || 0,
      shippingPrice: value.shippingPrice || 0,
    });

    user.cartData = {};
    await user.save();

    res.status(201).json({
      success: true,
      data: order,
    });
  }
);

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const orders = await Order.find({ user: req.user?._id })
      .populate("items.product", "name image new_price")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  }
);

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name image new_price");

    if (!order) {
      next(new ErrorResponse("Order not found", 404));
      return;
    }

    const orderUserId = (order.user as any)._id ?? order.user;
    const isOwner = String(orderUserId) === String(req.user?._id);
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: "Not authorized to access this order",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      next(new ErrorResponse("Order not found", 404));
      return;
    }

    if (orderStatus) (order as any).orderStatus = orderStatus;
    if (paymentStatus) (order as any).paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  }
);

export default { createOrder, getOrders, getOrderById, updateOrderStatus };