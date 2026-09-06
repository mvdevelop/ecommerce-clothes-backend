import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getNewCollection,
  getPopularInWomen,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/new", getNewCollection);
router.get("/popular-women", getPopularInWomen);
router.get("/:id", getProductById);

router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;