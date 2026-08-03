-- PURE VEIL Database Schema
-- MySQL 8.x compatible

CREATE DATABASE IF NOT EXISTS PUREVEIL CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PUREVEIL;

-- ============================================================
-- Users (Admin & User roles only)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Categories / Collections (Admin Managed)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  description_en TEXT DEFAULT NULL,
  image VARCHAR(500) DEFAULT NULL,
  display_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_title_en VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  seo_description_en TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Products (Full Bilingual Data Support)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  short_description TEXT,
  short_description_en TEXT,
  description TEXT,
  description_en TEXT,
  usage_instructions TEXT,
  usage_instructions_en TEXT,
  highlights TEXT,
  highlights_en TEXT,
  tags VARCHAR(500) DEFAULT NULL,
  tags_en VARCHAR(500) DEFAULT NULL,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_title_en VARCHAR(255) DEFAULT NULL,
  seo_description TEXT,
  seo_description_en TEXT,
  category_id INT DEFAULT NULL,
  price DECIMAL(10, 3) NOT NULL DEFAULT 0.000, -- KWD Fil precision
  old_price DECIMAL(10, 3) DEFAULT NULL,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  reviews_count INT DEFAULT 0,
  stock INT DEFAULT 0,
  status ENUM('active', 'out_of_stock', 'draft') DEFAULT 'active',
  image VARCHAR(500) DEFAULT NULL,
  concentration VARCHAR(100) DEFAULT NULL,
  sillage VARCHAR(100) DEFAULT NULL,
  longevity VARCHAR(100) DEFAULT NULL,
  season VARCHAR(100) DEFAULT NULL,
  gender VARCHAR(100) DEFAULT NULL,
  featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- Product Volume Options / Size Variants
-- ============================================================
CREATE TABLE IF NOT EXISTS product_volume_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size VARCHAR(50) NOT NULL,
  price DECIMAL(10, 3) NOT NULL,
  stock INT DEFAULT 10,
  sku VARCHAR(100) DEFAULT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Product Notes (Bilingual top, heart, base notes)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  note_type ENUM('top', 'heart', 'base') NOT NULL,
  note_text VARCHAR(255) NOT NULL,
  note_text_en VARCHAR(255) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Cart Items
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  size VARCHAR(50) NOT NULL DEFAULT '100ml',
  unit_price DECIMAL(10, 3) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product_size (user_id, product_id, size),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) DEFAULT NULL,
  customer_phone VARCHAR(50) DEFAULT NULL,
  subtotal DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  shipping_fee DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  total DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- Order Items
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  size VARCHAR(50) DEFAULT NULL,
  price DECIMAL(10, 3) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- Order Status History Timeline
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  note TEXT DEFAULT NULL,
  note_en TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

