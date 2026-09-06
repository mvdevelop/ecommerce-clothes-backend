import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Protected user routes
router.route("/").get(protect, getOrders);
router.post("/", protect, createOrder);
router.get("/:id", protect, getOrderById);

// Admin-only route for updating order status
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

export default router;