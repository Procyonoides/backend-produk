import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

// ✅ Helper: Validasi email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ Helper: Validasi phone format (Indonesia)
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone);
};

// ✅ Helper: Validasi password strength
const isStrongPassword = (password) => {
  // Minimal 6 karakter, 1 huruf besar, 1 huruf kecil, 1 angka
  return password.length >= 6;
};

// ✅ Admin menambah user baru
export const addUser = async (req, res) => {
  try {
    console.log("📩 ADD USER BODY:", req.body);
    const { name, username, password, email, phone, status, role, imageUrl } = req.body;

    // Validasi input
    if (!name || !username || !password || !email || !phone) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    // ✅ Validasi format email
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    // ✅ Validasi format phone
    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Format nomor telepon tidak valid" });
    }

    // ✅ Validasi password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        message: "Password minimal 6 karakter" 
      });
    }

    // Cek username sudah ada?
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }

    // ✅ Cek email sudah ada?
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Simpan user baru
    const newUser = new User({
      name: name.trim(),
      username: username.trim().toLowerCase(), // lowercase untuk consistency
      password: hashedPassword,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      status: status || "nonaktif",
      role: role || "user",
      imageUrl: imageUrl || "",
    });

    await newUser.save();
    console.log("✅ User registered:", newUser.username);

    // ✅ Jangan kirim password hash ke frontend
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      status: newUser.status,
      role: newUser.role,
      imageUrl: newUser.imageUrl,
      createdAt: newUser.createdAt
    };

    res.status(201).json({ 
      message: "User berhasil ditambahkan", 
      user: userResponse 
    });
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

    // ✅ Cari user (case-insensitive)
    const user = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    if (!user) {
      console.log("❌ User tidak ditemukan");
      return res.status(401).json({ message: "Username atau password salah" });
    }

    // ✅ Cek status user
    if (user.status === "nonaktif") {
      return res.status(403).json({ message: "Akun Anda sedang nonaktif. Hubungi admin." });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password tidak cocok");
      return res.status(401).json({ message: "Username atau password salah" });
    }

    // ✅ Buat token dengan expiry 1 hari
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login berhasil:", user.username);

    // ✅ Kirim response tanpa password
    res.status(200).json({
      message: "Login berhasil",
      token,
      userId: user._id.toString(),
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
    console.error("🔥 ERROR GET USERS:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE USER STATUS
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["aktif", "nonaktif"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({ 
      message: "Status user berhasil diupdate", 
      user 
    });
  } catch (err) {
    console.error("🔥 ERROR UPDATE STATUS:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE USER (Edit Profile)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, name, username, email, phone, role, status } = req.body;

    console.log("📩 UPDATE USER BODY:", req.body);
    console.log("👤 Current User ID:", req.user.id);
    console.log("👤 Current User Role:", req.user.role);
    console.log("🎯 Target User ID:", userId);

    // ✅ Validasi: User hanya bisa update profile sendiri, kecuali admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      console.warn(`⚠️ Access denied: User ${req.user.id} tried to update user ${userId}`);
      return res.status(403).json({ 
        message: "Anda tidak memiliki akses untuk mengubah data user lain" 
      });
    }

    // ✅ Cari user berdasarkan ID
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`⚠️ User ${userId} not found`);
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // ✅ Update nama (support both full_name dan name)
    const newName = full_name || name;
    if (newName && newName.trim()) {
      user.name = newName.trim();
      console.log(`✏️ Name updated: ${user.name}`);
    }

    // ✅ Update username (dengan validasi duplikat)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        username: username.trim().toLowerCase(),
        _id: { $ne: userId } // Exclude current user
      });
      if (existingUser) {
        console.warn(`⚠️ Username ${username} already exists`);
        return res.status(409).json({ message: "Username sudah digunakan" });
      }
      user.username = username.trim().toLowerCase();
      console.log(`✏️ Username updated: ${user.username}`);
    }

    // ✅ Update email (dengan validasi format & duplikat)
    if (email && email !== user.email) {
      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.warn(`⚠️ Invalid email format: ${email}`);
        return res.status(400).json({ message: "Format email tidak valid" });
      }

      const existingEmail = await User.findOne({ 
        email: email.trim().toLowerCase(),
        _id: { $ne: userId } // Exclude current user
      });
      if (existingEmail) {
        console.warn(`⚠️ Email ${email} already exists`);
        return res.status(409).json({ message: "Email sudah digunakan" });
      }
      user.email = email.trim().toLowerCase();
      console.log(`✏️ Email updated: ${user.email}`);
    }

    // ✅ Update phone (dengan validasi format)
    if (phone && phone !== user.phone) {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
      if (!phoneRegex.test(phone)) {
        console.warn(`⚠️ Invalid phone format: ${phone}`);
        return res.status(400).json({ message: "Format nomor telepon tidak valid" });
      }
      user.phone = phone.trim();
      console.log(`✏️ Phone updated: ${user.phone}`);
    }

    // ✅ Update role (hanya admin yang bisa mengubah role)
    if (role && req.user.role === 'admin' && role !== user.role) {
      if (!["admin", "user"].includes(role)) {
        console.warn(`⚠️ Invalid role: ${role}`);
        return res.status(400).json({ message: "Role tidak valid" });
      }
      user.role = role;
      console.log(`✏️ Role updated: ${user.role}`);
    }

    // ✅ UPDATE STATUS - PENTING! (hanya admin yang bisa mengubah status)
    if (status && req.user.role === 'admin' && status !== user.status) {
      if (!["aktif", "nonaktif"].includes(status)) {
        console.warn(`⚠️ Invalid status: ${status}`);
        return res.status(400).json({ message: "Status tidak valid" });
      }
      user.status = status;
      console.log(`✏️ Status updated: ${user.status}`);
    }

    // ✅ Simpan perubahan ke database
    await user.save();
    console.log("✅ User profile successfully updated:", user.username);

    // ✅ Response tanpa password
    const userResponse = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(200).json({
      message: "Profile berhasil diupdate",
      data: userResponse
    });

  } catch (err) {
    console.error("🔥 ERROR UPDATE USER:", err);
    res.status(500).json({ message: "Server error saat update profile" });
  }
};

// ✅ DELETE USER (soft delete - ubah status jadi nonaktif)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "nonaktif" },
      { new: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({ 
      message: "User berhasil dinonaktifkan", 
      user 
    });
  } catch (err) {
    console.error("🔥 ERROR DELETE USER:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Dari JWT token (via middleware)

    // Validasi input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Password lama dan baru wajib diisi" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password baru minimal 8 karakter" });
    }

    // Cari user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // ✅ Verifikasi password lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log("❌ Password lama tidak cocok");
      return res.status(401).json({ message: "Password lama tidak sesuai" });
    }

    // ✅ Cek apakah password baru sama dengan password lama
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res.status(400).json({ message: "Password baru tidak boleh sama dengan password lama" });
    }

    // ✅ Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // ✅ Update password
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password berhasil diubah untuk user:", user.username);

    res.status(200).json({
      message: "Password berhasil diubah. Silakan login kembali."
    });
  } catch (err) {
    console.error("🔥 ERROR CHANGE PASSWORD:", err);
    res.status(500).json({ message: "Server error saat mengubah password" });
  }
};

// ✅ HARD DELETE USER (Permanent Delete - Added to existing auth.controller.js)
export const hardDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("🗑️ Hard deleting user:", userId);

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      console.warn(`⚠️ User ${userId} not found`);
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    console.log("✅ User permanently deleted:", user.username);

    res.status(200).json({
      message: "User berhasil dihapus permanen",
      deletedUser: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("🔥 ERROR HARD DELETE USER:", err);
    res.status(500).json({ message: "Server error saat menghapus user" });
  }
};