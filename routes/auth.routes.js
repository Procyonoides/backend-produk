import express from "express";
import { login, getAllUsers, addUser, updateUserStatus, deleteUser, changePassword, updateUser } from "../controllers/auth.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ PUBLIC ROUTES (tidak perlu token)
router.post("/login", login);

// ✅ PROTECTED ROUTES (perlu token + admin role)
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.post("/add-user", verifyToken, isAdmin, addUser);
router.patch("/users/:userId/status", verifyToken, isAdmin, updateUserStatus);
router.delete("/users/:userId", verifyToken, isAdmin, deleteUser);

// ✅ CHANGE PASSWORD (User bisa ganti password sendiri)
router.post("/change-password", verifyToken, changePassword);

// ✅ Update user (user bisa update profile sendiri, admin bisa update semua)
router.put("/users/:userId", verifyToken, updateUser);

// ✅ TEST ROUTE (untuk development)
router.get("/test", (req, res) => {
  res.json({ message: "Backend connected successfully!" });
});

export default router;
