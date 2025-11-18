import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();


// ✅ Admin menambah user baru
export const addUser = async (req, res) => {
  try {
    console.log("📩 REGISTER BODY:", req.body);
    const { name, username, password, email, phone, status, role, imageUrl } = req.body;

    // Validasi input
    if (!name || !username || !password || !email || !phone) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    // Cek username sudah ada?
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      email,
      phone,
      status: status || "nonaktif",
      role: role || "user",
      imageUrl,
    });

    await newUser.save();
    console.log("✅ User registered:", newUser.username);
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("🔥 ERROR REGISTER:", err);
    res.status(500).json({ message: "Server error saat register" });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    console.log("📩 LOGIN BODY:", req.body);
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi" });
    }

    // Cari user
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User tidak ditemukan");
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password tidak cocok");
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Buat token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login berhasil:", user.username);
    res.status(200).json({
      message: "Login successful",
      token,
      username: user.username,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error("🔥 ERROR LOGIN:", err);
    res.status(500).json({ message: "Server error saat login" });
  }
};

// ✅ GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
