import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { validateOrder } from "../validation/orderValidation.js";
import asyncHandler from "express-async-handler";
import ErrorResponse from "../utils/errorResponse.js";

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  // Validate request body
  const { error, value } = validateOrder(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }

  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Validate and compute total from cart items
  let totalAmount = 0;
  const orderItems = [];

  for (const item of value.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ErrorResponse(`Product ${item.product} not found`, 404));
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        error: `Not enough stock for ${product.name}. Available: ${product.stock}`,
      });
    }

    const price = product.new_price;
    totalAmount += price * item.quantity;
    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price,
    });
  }

  // Create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: value.shippingAddress,
    paymentMethod: value.paymentMethod,
    totalAmount,
    discount: value.discount || 0,
    shippingPrice: value.shippingPrice || 0,
  });

  // Clear the user's cart
  user.cartData = {};
  await user.save();

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "name image new_price")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "name image new_price");

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  // Only allow order owner or admin to view
  if (!order.user._id.equals(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Not authorized to access this order",
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse("Order not found", 404));
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};