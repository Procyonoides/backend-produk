import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ngoding_produk');
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
