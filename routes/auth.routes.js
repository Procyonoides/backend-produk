import express from "express";
import { login, getAllUsers, addUser } from "../controllers/auth.controller.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/login", login);
// router.post("/register", register);
router.get("/users", getAllUsers);
router.post("/add-user", addUser);


export default router;
