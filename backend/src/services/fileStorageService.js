import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import pool from '../config/db.js';

// Base uploads directory
const UPLOADS_BASE_DIR = path.join(process.cwd(), 'uploads');

// Ensure required upload subdirectories exist
const subdirs = ['products', 'categories', 'collections', 'avatars', 'banners'];
subdirs.forEach(dir => {
  const dirPath = path.join(UPLOADS_BASE_DIR, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure Multer Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.params.folder || 'products';
    const targetDir = subdirs.includes(folder) ? path.join(UPLOADS_BASE_DIR, folder) : path.join(UPLOADS_BASE_DIR, 'products');
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString('hex');
    const filename = `${Date.now()}-${hash}${ext}`;
    cb(null, filename);
  }
});

// File filter validation (MIME types + file extensions)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE: مسموح فقط بتحميل الصور (JPG, PNG, WEBP, GIF, SVG)'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Check if relative image path is referenced anywhere in MySQL database
 */
export const isImageReferenced = async (relativePath) => {
  if (!relativePath || typeof relativePath !== 'string' || relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return true; // Don't attempt to delete external URLs or invalid paths
  }

  try {
    // Check products main image or JSON highlights
    const [prods] = await pool.query(
      "SELECT id FROM products WHERE image = ?",
      [relativePath]
    );
    if (prods.length > 0) return true;

    // Check categories / collections image
    const [cats] = await pool.query(
      "SELECT id FROM categories WHERE image = ?",
      [relativePath]
    );
    if (cats.length > 0) return true;

    // Check users avatar if exists
    const [users] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND role = 'admin'",
      [relativePath]
    );
    if (users.length > 0) return true;

    return false;
  } catch (err) {
    console.error("isImageReferenced check error:", err);
    return true; // Default to safe (don't delete if DB check fails)
  }
};

/**
 * Safely delete file from disk if it is not referenced in database
 */
export const deleteFileIfUnused = async (relativePath) => {
  if (!relativePath || typeof relativePath !== 'string') return;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return;

  try {
    const isReferenced = await isImageReferenced(relativePath);
    if (!isReferenced) {
      const fullPath = path.join(process.cwd(), relativePath.startsWith('/') ? relativePath.substring(1) : relativePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        console.log(`🗑️ Deleted orphaned file: ${relativePath}`);
      }
    }
  } catch (err) {
    console.error(`Failed to cleanup file ${relativePath}:`, err);
  }
};
