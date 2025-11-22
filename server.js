import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";

dotenv.config();

const app = express();

// ✅ Security Middleware - CORS dengan config yang lebih aman
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ✅ Body Parser Middleware
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ✅ Request Logging (untuk development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📩 ${req.method} ${req.path}`);
    next();
  });
}

// ✅ Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ Test Route
app.get('/api/auth/test', (req, res) => {
  console.log('✅ Test endpoint hit');
  res.json({ message: 'Backend connected and token sent successfully!' });
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route tidak ditemukan',
    path: req.path 
  });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ MongoDB Connection dengan better error handling
const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// ✅ Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

// ✅ Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️ Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();