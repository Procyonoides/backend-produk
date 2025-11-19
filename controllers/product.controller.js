import Product from "../models/product.model.js";

// ✅ GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {
  try {
    const { category, status, search, sort = 'name', order = 'asc' } = req.query;
    
    let query = {};
    
    // Filter by category
    if (category && category !== 'Semua Kategori') {
      query.category = category;
    }
    
    // Filter by status
    if (status && status !== 'Semua Status') {
      query.status = status;
    }
    
    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sort]: sortOrder };
    
    const products = await Product.find(query).sort(sortObj);
    
    res.status(200).json(products);
  } catch (err) {
    console.error("🔥 ERROR GET PRODUCTS:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    
    res.status(200).json(product);
  } catch (err) {
    console.error("🔥 ERROR GET PRODUCT:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock, unit, imageUrl } = req.body;
    
    // Validasi
    if (!name || !category || !description || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }
    
    if (price < 0 || stock < 0) {
      return res.status(400).json({ message: "Harga dan stok tidak boleh negatif" });
    }
    
    // Cek duplikat nama produk
    const existingProduct = await Product.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' } 
    });
    
    if (existingProduct) {
      return res.status(400).json({ message: "Produk dengan nama ini sudah ada" });
    }
    
    const newProduct = new Product({
      name: name.trim(),
      category,
      description: description.trim(),
      price,
      stock,
      unit: unit || 'Unit',
      imageUrl: imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'
    });
    
    await newProduct.save();
    
    console.log("✅ Product created:", newProduct.name);
    res.status(201).json({ 
      message: "Produk berhasil ditambahkan", 
      product: newProduct 
    });
  } catch (err) {
    console.error("🔥 ERROR CREATE PRODUCT:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validasi
    if (updateData.price !== undefined && updateData.price < 0) {
      return res.status(400).json({ message: "Harga tidak boleh negatif" });
    }
    
    if (updateData.stock !== undefined && updateData.stock < 0) {
      return res.status(400).json({ message: "Stok tidak boleh negatif" });
    }
    
    updateData.updatedAt = Date.now();
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    
    console.log("✅ Product updated:", product.name);
    res.status(200).json({ 
      message: "Produk berhasil diupdate", 
      product 
    });
  } catch (err) {
    console.error("🔥 ERROR UPDATE PRODUCT:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE STOCK ONLY
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation } = req.body; // operation: 'add' atau 'set'
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ message: "Stok tidak valid" });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    
    if (operation === 'add') {
      product.stock += stock;
    } else {
      product.stock = stock;
    }
    
    await product.save(); // Trigger middleware untuk auto-update status
    
    console.log("✅ Stock updated:", product.name);
    res.status(200).json({ 
      message: "Stok berhasil diperbarui", 
      product 
    });
  } catch (err) {
    console.error("🔥 ERROR UPDATE STOCK:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE PRODUCT (soft delete - ubah status jadi Nonaktif)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { status: 'Nonaktif', stock: 0 },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    
    console.log("✅ Product deleted (soft):", product.name);
    res.status(200).json({ 
      message: "Produk berhasil dihapus", 
      product 
    });
  } catch (err) {
    console.error("🔥 ERROR DELETE PRODUCT:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ HARD DELETE PRODUCT (permanent delete)
export const hardDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    
    console.log("✅ Product hard deleted:", product.name);
    res.status(200).json({ 
      message: "Produk berhasil dihapus permanen" 
    });
  } catch (err) {
    console.error("🔥 ERROR HARD DELETE PRODUCT:", err);
    res.status(500).json({ message: "Server error" });
  }
};