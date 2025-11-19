import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  hardDeleteProduct
} from "../controllers/product.controller.js";
import { verifyToken, isAdmin, isUserOrAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ PUBLIC ROUTES (bisa diakses user & admin)
router.get("/", verifyToken, isUserOrAdmin, getAllProducts);
router.get("/:id", verifyToken, isUserOrAdmin, getProductById);

// ✅ ADMIN ONLY ROUTES
router.post("/", verifyToken, isAdmin, createProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.patch("/:id/stock", verifyToken, isAdmin, updateStock);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);
router.delete("/:id/hard", verifyToken, isAdmin, hardDeleteProduct);

export default router;