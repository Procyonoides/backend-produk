import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStatistics
} from "../controllers/category.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ PUBLIC ROUTES (tidak perlu auth untuk view)
router.get("/", getAllCategories);
router.get("/stats", getCategoryStatistics);
router.get("/:id", getCategoryById);

// ✅ ADMIN ONLY ROUTES
router.post("/", verifyToken, isAdmin, createCategory);
router.put("/:id", verifyToken, isAdmin, updateCategory);
router.delete("/:id", verifyToken, isAdmin, deleteCategory);

export default router;