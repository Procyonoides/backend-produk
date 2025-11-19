import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Meja', 'Kursi', 'Lemari', 'Rak', 'Bufet', 'Tempat Tidur'],
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    enum: ['Unit', 'Set', 'Pcs'],
    default: 'Unit'
  },
  status: { 
    type: String, 
    enum: ['Aktif', 'Menipis', 'Nonaktif'], 
    default: 'Aktif' 
  },
  imageUrl: { 
    type: String, 
    default: '' 
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  sold: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// ✅ Middleware: Auto-update status berdasarkan stok
productSchema.pre('save', function(next) {
  if (this.stock === 0) {
    this.status = 'Nonaktif';
  } else if (this.stock < 5) {
    this.status = 'Menipis';
  } else {
    this.status = 'Aktif';
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Product", productSchema);