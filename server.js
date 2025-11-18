import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TEST ROUTE - harus muncul log kalau sukses
app.get('/api/auth/test', (req, res) => {
  console.log('✅ Request dari frontend diterima');
  res.json({ message: 'Backend connected and token sent successfully!' });
});

// 🔹 Routes
app.use("/api/auth", authRoutes);

// 🔹 Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// 🔹 Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
