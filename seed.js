import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";
import User from "./models/user.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const sampleProducts = [
  {
    name: "Meja Makan Kayu Jati - Ukuran besar 100m²",
    category: "Meja",
    description: "Hadirkan nuansa mewah dan elegan di ruang makan Anda dengan Meja Makan Kayu Jati - Ukuran Besar 100m². Terbuat dari kayu jati pilihan yang terkenal kokoh, tahan lama, dan memiliki serat alami yang indah, meja ini tidak hanya berfungsi sebagai tempat makan tetapi juga sebagai investasi furnitur jangka panjang.",
    price: 3400000,
    stock: 12,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=60",
    rating: 4.9,
    sold: 121
  },
  {
    name: "Sofa Minimalis - 3 Dudukan",
    category: "Kursi",
    description: "Desain ekstra besar 100m², meja ini sangat ideal untuk ruang makan keluarga besar, acara gathering, atau restoran yang ingin memberikan kesan eksklusif kepada tamunya. Permukaan meja yang luas dan mudah dibersihkan menjadikannya praktis untuk berbagai acara, dari makan bersama keluarga hingga pesta formal.",
    price: 5000000,
    stock: 4,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=60",
    rating: 4.7,
    sold: 75
  },
  {
    name: "Meja Kopi Kayu Palet - Vintage",
    category: "Meja",
    description: "Dengan ukuran 100m² dan desain eksklusif, meja ini cocok untuk ruang makan luas dan berkarakter. Finishing glossy/matte menambah sentuhan elegan sekaligus mudah dibersihkan.",
    price: 900000,
    stock: 20,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1578898887932-57c54b52e45e?auto=format&fit=crop&w=800&q=60",
    rating: 4.6,
    sold: 50
  },
  {
    name: "Kursi Santai Rotan - Desain ergonomis",
    category: "Kursi",
    description: "Kursi santai berbahan rotan alami dengan desain ergonomis untuk kenyamanan maksimal. Cocok untuk teras, balkon, atau ruang keluarga.",
    price: 1200000,
    stock: 8,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=800&q=60",
    rating: 4.8,
    sold: 89
  },
  {
    name: "Rak Dinding Modern - Minimalis",
    category: "Rak",
    description: "Rak dinding dengan desain minimalis modern, terbuat dari kayu berkualitas tinggi. Ideal untuk menyimpan buku, hiasan, atau koleksi pribadi.",
    price: 750000,
    stock: 29,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=60",
    rating: 4.5,
    sold: 30
  },
  {
    name: "Lemari Pakaian Kayu - 2 Pintu",
    category: "Lemari",
    description: "Lemari pakaian kayu solid dengan 2 pintu besar, kapasitas penyimpanan luas. Finishing natural dengan desain klasik yang timeless.",
    price: 4200000,
    stock: 15,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=60",
    rating: 4.4,
    sold: 64
  },
  {
    name: "Lampu Hias Gantung - Retro",
    category: "Rak",
    description: "Lampu hias gantung dengan desain retro yang unik. Memberikan pencahayaan hangat dan atmosfer nyaman di ruangan Anda.",
    price: 1500000,
    stock: 2,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=60",
    rating: 4.4,
    sold: 25
  },
  {
    name: "Kursi Makan Kayu - Set 4",
    category: "Kursi",
    description: "Set 4 kursi makan dari kayu jati dengan desain ergonomis dan nyaman. Cocok dipasangkan dengan meja makan keluarga.",
    price: 2600000,
    stock: 16,
    unit: "Set",
    imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=60",
    rating: 4.8,
    sold: 45
  },
  {
    name: "Bufet TV Minimalis",
    category: "Bufet",
    description: "Bufet TV dengan desain minimalis modern, dilengkapi laci dan rak terbuka. Cocok untuk ruang keluarga minimalis.",
    price: 2900000,
    stock: 0,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=60",
    rating: 4.2,
    sold: 18
  },
  {
    name: "Tempat Tidur Queen Size",
    category: "Tempat Tidur",
    description: "Tempat tidur ukuran queen dengan rangka kayu solid. Desain elegan dengan headboard yang kokoh dan nyaman.",
    price: 6700000,
    stock: 4,
    unit: "Unit",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=60",
    rating: 4.9,
    sold: 92
  }
];

const sampleUsers = [
  {
    name: "Admin User",
    username: "admin",
    password: "admin123",
    email: "admin@furniture.com",
    phone: "+6281234567890",
    status: "aktif",
    role: "admin"
  },
  {
    name: "John Doe",
    username: "johndoe",
    password: "user123",
    email: "john@example.com",
    phone: "+6281234567891",
    status: "aktif",
    role: "user"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert products
    await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${sampleProducts.length} products`);

    // Insert users with hashed passwords
    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await User.create({
        ...user,
        password: hashedPassword
      });
    }
    console.log(`✅ Inserted ${sampleUsers.length} users`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Admin - username: admin, password: admin123");
    console.log("   User  - username: johndoe, password: user123");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

seedDatabase();