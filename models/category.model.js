import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  icon: {
    type: String,
    default: "bi-box-seam"
  },
  color: {
    type: String,
    default: "#ff7b00"
  },
  productCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

// ✅ Middleware: Auto-update productCount
categorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const Product = mongoose.model('Product');
    this.productCount = await Product.countDocuments({ category: this.name });
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Category", categorySchema);