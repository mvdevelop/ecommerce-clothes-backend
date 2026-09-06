import { Router } from "express";
import { uploadImage, uploadMultipleImages } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, authorize("admin"), ...uploadImage);
router.post("/multiple", protect, authorize("admin"), ...uploadMultipleImages);

export default router;