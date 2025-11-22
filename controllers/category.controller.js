import Category from "../models/category.model.js";
import Product from "../models/product.model.js"; // ✅ Import Product

// ✅ GET ALL CATEGORIES
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    
    console.log("✅ Categories retrieved:", categories.length);
    res.status(200).json(categories);
  } catch (err) {
    console.error("🔥 ERROR GET CATEGORIES:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET CATEGORY BY ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.status(200).json(category);
  } catch (err) {
    console.error("🔥 ERROR GET CATEGORY:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;

    // Validasi
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nama kategori wajib diisi" });
    }

    // Cek duplikat
    const existingCategory = await Category.findOne({
      name: name.trim().toLowerCase()
    });

    if (existingCategory) {
      return res.status(409).json({ message: "Kategori sudah ada" });
    }

    const newCategory = new Category({
      name: name.trim().toLowerCase(),
      description: description?.trim() || "",
      icon: icon || "bi-box-seam",
      color: color || "#ff7b00",
      isActive: true
    });

    await newCategory.save();

    console.log("✅ Category created:", newCategory.name);
    res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      data: newCategory
    });
  } catch (err) {
    console.error("🔥 ERROR CREATE CATEGORY:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    // Cek duplikat nama (exclude diri sendiri)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim().toLowerCase(),
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(409).json({ message: "Nama kategori sudah digunakan" });
      }

      category.name = name.trim().toLowerCase();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (icon) {
      category.icon = icon;
    }

    if (color) {
      category.color = color;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    console.log("✅ Category updated:", category.name);
    res.status(200).json({
      message: "Kategori berhasil diupdate",
      data: category
    });
  } catch (err) {
    console.error("🔥 ERROR UPDATE CATEGORY:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    // ✅ Check if category has products (Fixed Import)
    const productCount = await Product.countDocuments({ category: category.name });

    if (productCount > 0) {
      return res.status(400).json({
        message: `Tidak bisa menghapus kategori dengan ${productCount} produk. Pindahkan produk terlebih dahulu.`
      });
    }

    await Category.findByIdAndDelete(id);

    console.log("✅ Category deleted:", category.name);
    res.status(200).json({
      message: "Kategori berhasil dihapus"
    });
  } catch (err) {
    console.error("🔥 ERROR DELETE CATEGORY:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET CATEGORY STATISTICS
export const getCategoryStatistics = async (req, res) => {
  try {
    // ✅ Fixed: Direct import instead of require
    const categories = await Category.find().select("name productCount");
    
    // Calculate statistics
    const stats = {
      totalCategories: categories.length,
      totalProducts: await Product.countDocuments(),
      categories: categories
    };

    console.log("✅ Category statistics retrieved");
    res.status(200).json(stats);
  } catch (err) {
    console.error("🔥 ERROR GET STATISTICS:", err);
    res.status(500).json({ message: "Server error" });
  }
};