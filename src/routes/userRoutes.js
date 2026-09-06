import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

// Protected routes
router.post("/logout", protect, logoutUser);

export default router;