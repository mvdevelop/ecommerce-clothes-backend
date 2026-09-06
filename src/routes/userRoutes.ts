import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);

export default router;