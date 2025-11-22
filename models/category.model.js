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
  // ✅ Update updatedAt
  this.updatedAt = Date.now();
  
  // ✅ Only update productCount if name is modified
  if (this.isModified('name')) {
    try {
      // ✅ Check if Product model exists before using it
      if (mongoose.models.Product) {
        const Product = mongoose.model('Product');
        this.productCount = await Product.countDocuments({ category: this.name });
      } else {
        // ✅ If Product model doesn't exist (like during seeding), skip count
        console.log('⚠️  Product model not loaded, skipping productCount update');
        this.productCount = 0;
      }
    } catch (err) {
      console.error('❌ Error updating productCount:', err);
      this.productCount = 0;
    }
  }
  
  next();
});

export default mongoose.model("Category", categorySchema);