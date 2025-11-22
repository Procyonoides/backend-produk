import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/category.model.js";

dotenv.config();

// ✅ Sample categories data
const categoriesData = [
  {
    name: "meja",
    description: "Berbagai jenis meja dengan desain modern dan klasik",
    icon: "bi-table",
    color: "#FF6B6B",
    productCount: 0,
    isActive: true
  },
  {
    name: "kursi",
    description: "Koleksi kursi nyaman untuk berbagai ruangan",
    icon: "bi-chair",
    color: "#4ECDC4",
    productCount: 0,
    isActive: true
  },
  {
    name: "lemari",
    description: "Lemari penyimpanan berkualitas tinggi",
    icon: "bi-cabinet",
    color: "#45B7D1",
    productCount: 0,
    isActive: true
  },
  {
    name: "rak",
    description: "Rak display dan penyimpanan yang fungsional",
    icon: "bi-grid-1x2",
    color: "#FFA502",
    productCount: 0,
    isActive: true
  },
  {
    name: "bufet",
    description: "Bufet modern untuk ruang makan dan keluarga",
    icon: "bi-boxes",
    color: "#96CEB4",
    productCount: 0,
    isActive: true
  },
  {
    name: "tempat tidur",
    description: "Tempat tidur nyaman dan berkualitas premium",
    icon: "bi-bed",
    color: "#FFEAA7",
    productCount: 0,
    isActive: true
  },
  {
    name: "sofa",
    description: "Sofa empuk untuk ruang keluarga yang sempurna",
    icon: "bi-couch",
    color: "#DFE6E9",
    productCount: 0,
    isActive: true
  },
  {
    name: "lainnya",
    description: "Produk furniture lainnya",
    icon: "bi-box",
    color: "#95A5A6",
    productCount: 0,
    isActive: true
  },
  {
    name: "meja konsol",
    description: "Meja konsol elegan untuk dekorasi ruangan",
    icon: "bi-table",
    color: "#A29BFE",
    productCount: 0,
    isActive: true
  }
];

// ✅ Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ngoding_produk');
    console.log("✅ MongoDB connected for seeding");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

// ✅ Seed categories
async function seedCategories() {
  try {
    console.log("\n📚 Starting category seeding...\n");

    // Get existing categories
    const existingCount = await Category.countDocuments();
    console.log(`📊 Existing categories: ${existingCount}`);

    // ✅ Option: Clear existing categories (uncomment if you want fresh start)
    // await Category.deleteMany({});
    // console.log("🗑️  Cleared existing categories");

    let createdCount = 0;
    let updatedCount = 0;

    for (const catData of categoriesData) {
      const existingCategory = await Category.findOne({ name: catData.name });

      if (existingCategory) {
        // ✅ Update existing category using updateOne (skip middleware)
        await Category.updateOne(
          { name: catData.name },
          { 
            $set: {
              ...catData,
              updatedAt: Date.now()
            }
          }
        );
        console.log(`✏️  Updated category: ${catData.name}`);
        updatedCount++;
      } else {
        // ✅ Create new category using insertOne (skip middleware)
        await Category.collection.insertOne({
          ...catData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Created category: ${catData.name}`);
        createdCount++;
      }
    }

    // Final statistics
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });

    console.log("\n📊 ===== SEEDING SUMMARY =====");
    console.log(`✅ Created: ${createdCount} categories`);
    console.log(`✏️  Updated: ${updatedCount} categories`);
    console.log(`📦 Total: ${totalCategories} categories`);
    console.log(`🟢 Active: ${activeCategories} categories`);
    console.log("✅ ===== SEEDING COMPLETE =====\n");

    // Display all categories
    const allCategories = await Category.find();
    console.log("📋 All Categories:");
    console.log("==================");
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name.toUpperCase()}`);
      console.log(`   Icon: ${cat.icon}`);
      console.log(`   Color: ${cat.color}`);
      console.log(`   Status: ${cat.isActive ? '🟢 Aktif' : '🔴 Nonaktif'}`);
      console.log("");
    });

  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  }
}

// ✅ Run seeding
async function main() {
  console.log("🚀 Starting category seeding script...\n");
  await connectDB();
  await seedCategories();
}

// Execute
main().catch(err => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});