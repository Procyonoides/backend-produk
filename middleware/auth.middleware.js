import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Verify JWT Token
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // ✅ Cek apakah header ada dan format benar
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⚠️ No token provided or invalid format');
    return res.status(401).json({ 
      message: 'Token tidak ditemukan. Silakan login terlebih dahulu.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // simpan data user di request
    console.log('✅ Token verified for user:', decoded.username);
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    
    // ✅ Beda error message berdasarkan jenis error
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token sudah expired. Silakan login kembali.' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Token tidak valid.' 
      });
    }
    
    return res.status(403).json({ 
      message: 'Autentikasi gagal.' 
    });
  }
};

// ✅ Check Admin Role
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    console.warn('⚠️ User data not found in request');
    return res.status(401).json({ 
      message: 'Autentikasi diperlukan' 
    });
  }

  if (req.user.role !== 'admin') {
    console.warn(`⚠️ Access denied for user ${req.user.username} (role: ${req.user.role})`);
    return res.status(403).json({ 
      message: 'Akses ditolak. Hanya admin yang dapat mengakses.' 
    });
  }

  console.log(`✅ Admin access granted for ${req.user.username}`);
  next();
};

// ✅ Check User or Admin Role (opsional)
export const isUserOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Autentikasi diperlukan' 
    });
  }

  if (!['admin', 'user'].includes(req.user.role)) {
    return res.status(403).json({ 
      message: 'Role tidak valid' 
    });
  }

  next();
};

// ✅ Check if user owns the resource (opsional untuk future use)
export const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Autentikasi diperlukan' 
    });
  }

  const resourceUserId = req.params.userId || req.body.userId;
  
  // Admin bisa akses semua, atau user hanya bisa akses data sendiri
  if (req.user.role === 'admin' || req.user.id === resourceUserId) {
    next();
  } else {
    return res.status(403).json({ 
      message: 'Anda tidak memiliki akses ke resource ini' 
    });
  }
};