import bcrypt from "bcryptjs";
import pool from "./db.js";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting PURE VEIL Database Seeding...");

    // Disable Foreign Key checks for clean reset
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await pool.query("DROP TABLE IF EXISTS order_items");
    await pool.query("DROP TABLE IF EXISTS orders");
    await pool.query("DROP TABLE IF EXISTS cart_items");
    await pool.query("DROP TABLE IF EXISTS favorites");
    await pool.query("DROP TABLE IF EXISTS product_notes");
    await pool.query("DROP TABLE IF EXISTS product_volume_options");
    await pool.query("DROP TABLE IF EXISTS products");
    await pool.query("DROP TABLE IF EXISTS brands");
    await pool.query("DROP TABLE IF EXISTS categories");
    await pool.query("DROP TABLE IF EXISTS users");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");

    // Re-create schema tables
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

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
      price DECIMAL(10, 3) NOT NULL DEFAULT 0.000,
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

    CREATE TABLE IF NOT EXISTS product_notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      note_type ENUM('top', 'heart', 'base') NOT NULL,
      note_text VARCHAR(255) NOT NULL,
      note_text_en VARCHAR(255) NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      product_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_product (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

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
    `;

    for (const sql of schemaSql.split(";")) {
      if (sql.trim()) await pool.query(sql);
    }

    // 1. Seed Users (1 Admin & 2 Users)
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const userPassword = await bcrypt.hash("User@123", 10);

    const [userRes] = await pool.query(`
      INSERT INTO users (name, email, password_hash, role) VALUES
      ('المدير العام (PURE VEIL)', 'admin@pureveil.com', '${adminPassword}', 'admin'),
      ('محمد المنصور', 'mohammed@example.com', '${userPassword}', 'user'),
      ('سارة الكويتية', 'sarah@example.com', '${userPassword}', 'user')
    `);
    console.log("✅ Seeded Users (1 Admin, 2 Users)");

    // 2. Seed Admin-Managed Collections
    const collectionsData = [
      {
        name: "العطور الشرقية الملكية",
        name_en: "Royal Oriental Perfumes",
        description: "مجموعة فاخرة تجمع أنقى قطرات دهن العود المعتق والعنبر النادر ومسك الغزال.",
        description_en: "An extraordinary collection of vintage agarwood oil, rare amber, and royal musk.",
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200",
        display_order: 1,
        status: "active",
        seo_title: "العطور الشرقية الملكية - بيور فيل",
        seo_title_en: "Royal Oriental Perfumes - PURE VEIL",
        seo_description: "استكشف أفخم العطور الشرقية المعتقة بالدينار الكويتي.",
        seo_description_en: "Explore finest vintage oriental perfumes in KWD."
      },
      {
        name: "العطور الفرنسية الفاخرة",
        name_en: "French Niche Collections",
        description: "نفحات فرنسية حصرية مصممة بأيدي كبار صانعي العطور في غراس بفرنسا.",
        description_en: "Exclusive French olfactory compositions crafted by master perfumers in Grasse, France.",
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200",
        display_order: 2,
        status: "active",
        seo_title: "العطور الفرنسية الفاخرة - بيور فيل",
        seo_title_en: "French Niche Collections - PURE VEIL",
        seo_description: "تشكيلة حصرية من العطور الفرنسية الفواحة.",
        seo_description_en: "Exclusive selection of high longevity French fragrances."
      },
      {
        name: "البخور والعود الفاخر",
        name_en: "Oud & Incense Reserve",
        description: "رقائق العود الكمبودي والسطنطي الفاخر وبخور الشيوخ المعطر.",
        description_en: "Royal Cambodian oud chips, silani agarwood, and scented incense bakhoor.",
        image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1200",
        display_order: 3,
        status: "active",
        seo_title: "البخور والعود الفاخر - بيور فيل",
        seo_title_en: "Oud & Incense Reserve - PURE VEIL",
        seo_description: "أرقى خشب العود والبخور المعطر للكويت والخليج.",
        seo_description_en: "Finest agarwood chips and royal incense in Kuwait."
      },
      {
        name: "المجموعات الحصرية الخاصة",
        name_en: "Private Exclusive Drops",
        description: "إصدارات خاصة ومحدودة للغاية لعشاق العطور النادرة.",
        description_en: "Strictly limited private editions crafted for rare fragrance collectors.",
        image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200",
        display_order: 4,
        status: "active",
        seo_title: "المجموعات الحصرية - بيور فيل",
        seo_title_en: "Private Exclusive Drops - PURE VEIL",
        seo_description: "إصدارات خاصة ومحدودة للغاية.",
        seo_description_en: "Strictly limited private drops."
      }
    ];

    const categoryIds = [];
    for (const cat of collectionsData) {
      const [r] = await pool.query(
        `INSERT INTO categories (name, name_en, description, description_en, image, display_order, status, seo_title, seo_title_en, seo_description, seo_description_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cat.name, cat.name_en, cat.description, cat.description_en, cat.image, cat.display_order, cat.status, cat.seo_title, cat.seo_title_en, cat.seo_description, cat.seo_description_en]
      );
      categoryIds.push(r.insertId);
    }
    console.log("✅ Seeded 4 Admin Collections");

    // 3. Seed Products with Multiple Size Variants
    const productsData = [
      {
        sku: "PV-OUD-001",
        name: "دهن العود الملكي المعتق",
        name_en: "Royal Vintage Oud Essence",
        short_description: "إكسير العود الكمبودي المعتق لمدة 25 سنة مع نفحات العنبر الأسود.",
        short_description_en: "A 25-year aged vintage Cambodian oud elixir infused with dark amber.",
        description: "عطر ملوكي ساحر ينبض بالفخامة والأصالة الشرقية. تم استخلاص هذا العطر النادر من أجود أنواع خشب العود الكمبودي المعتّق مع إضافة لمسات خفيفة من الزعفران الإيراني والمسك الملكي.",
        description_en: "A majestic fragrance pulsating with royal oriental luxury. Extracted from finest aged Cambodian agarwood enriched with Iranian saffron and velvet musk.",
        usage_instructions: "يرش على نقاط النبض (المعصمين، الرقبة، وخلف الأذنين) من مسافة 15 سم لثبات يدوم طوال اليوم.",
        usage_instructions_en: "Spray on pulse points (wrists, neck, behind ears) from 15cm distance for all-day sillage.",
        highlights: JSON.stringify(["ثبات ممتاز 24+ ساعة", "عود كمبودي معتق أصلي 100%", "زجاجة كريستال ملكية معتقة", "صنع بحرفية عالية"]),
        highlights_en: JSON.stringify(["24+ Hours Longevity", "100% Authentic Cambodian Oud", "Royal Handcut Crystal Bottle", "Artisanal Craftsmanship"]),
        tags: "عود, عطور شرقية, بيور فيل, عطر ملكي",
        tags_en: "oud, oriental perfume, pure veil, royal scent",
        seo_title: "دهن العود الملكي المعتق - بيور فيل الكويت",
        seo_title_en: "Royal Vintage Oud Essence - PURE VEIL Kuwait",
        seo_description: "اشترِ دهن العود الملكي المعتق الأصلي بالدينار الكويتي من متجر بيور فيل.",
        seo_description_en: "Buy authentic Royal Vintage Oud Essence in KWD from PURE VEIL.",
        category_id: categoryIds[0],
        price: 85.000,
        old_price: 110.000,
        rating: 4.95,
        reviews_count: 48,
        stock: 25,
        status: "active",
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
        concentration: "Extrait de Parfum",
        sillage: "فواح جداً (Huge)",
        longevity: "24+ ساعة",
        season: "جميع الفصول",
        gender: "للجنسين",
        featured: true,
        is_new: true,
        volumes: [
          { size: "30ml", price: 45.000, stock: 10, sku: "PV-OUD-001-30" },
          { size: "50ml", price: 65.000, stock: 10, sku: "PV-OUD-001-50" },
          { size: "100ml", price: 85.000, stock: 5, sku: "PV-OUD-001-100" }
        ],
        notes: [
          { note_type: "top", note_text: "الزعفران الإيراني, البرغموت الصقلي", note_text_en: "Iranian Saffron, Sicilian Bergamot" },
          { note_type: "heart", note_text: "الورد الجوري, الياسمين الهندي", note_text_en: "Damask Rose, Indian Jasmine" },
          { note_type: "base", note_text: "العود الكمبودي المعتق, العنبر الأسود, مسك الغزال", note_text_en: "Aged Cambodian Oud, Black Amber, Deer Musk" }
        ]
      },
      {
        sku: "PV-ROSE-002",
        name: "ورد الفانيلا الملكي",
        name_en: "Imperial Vanilla Rose",
        short_description: "باكورة العطور الفرنسية الناعمة التي تمزج الورد البلغاري بعبق الفانيلا الملكية.",
        short_description_en: "A soft French masterpiece blending Bulgarian Damask Rose with Bourbon Vanilla.",
        description: "تركيبة عطرية ساحرة تأخذك في رحلة إلى حدائق غراس الفرنسية. يمتزج عبق الورد البلغاري مع لمسات بوربون الفانيلا والكاكاو الأنيق في تناغم عطري فريد.",
        description_en: "An enchanting perfume taking you to Grasse gardens. Blending Bulgarian Rose with Bourbon Vanilla and subtle cocoa notes.",
        usage_instructions: "يناسب الاستخدام اليومي والمناسبات الراقية.",
        usage_instructions_en: "Ideal for daily elegance and gala dinners.",
        highlights: JSON.stringify(["فوحان أنيق وجذاب", "مكونات فرنسية نادرة", "ثبات تدريجي ساحر"]),
        highlights_en: JSON.stringify(["Intoxicating Sillage", "Rare French Ingredients", "Enchanting Drydown"]),
        tags: "ورد, فانيلا, عطور فرنسية, نسائي",
        tags_en: "rose, vanilla, french perfumes, women",
        seo_title: "ورد الفانيلا الملكي - بيور فيل",
        seo_title_en: "Imperial Vanilla Rose - PURE VEIL",
        seo_description: "عطر ورد الفانيلا الملكي الفاخر بالدينار الكويتي.",
        seo_description_en: "Imperial Vanilla Rose perfume available in KWD.",
        category_id: categoryIds[1],
        price: 45.000,
        old_price: 55.000,
        rating: 4.88,
        reviews_count: 32,
        stock: 30,
        status: "active",
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800",
        concentration: "Eau de Parfum",
        sillage: "متوسط إلى قوي",
        longevity: "12-16 ساعة",
        season: "الربيع / الشتاء",
        gender: "نسائي / للجنسين",
        featured: true,
        is_new: true,
        volumes: [
          { size: "50ml", price: 32.000, stock: 15, sku: "PV-ROSE-002-50" },
          { size: "100ml", price: 45.000, stock: 15, sku: "PV-ROSE-002-100" }
        ],
        notes: [
          { note_type: "top", note_text: "الزهر الأبيض, الخوخ الذهبي", note_text_en: "White Blossom, Golden Peach" },
          { note_type: "heart", note_text: "الورد البلغاري, الأوركيد", note_text_en: "Bulgarian Rose, Velvet Orchid" },
          { note_type: "base", note_text: "فانيلا البوربون, خشب الصندل, المسك الأبيض", note_text_en: "Bourbon Vanilla, Sandalwood, White Musk" }
        ]
      },
      {
        sku: "PV-BAKHOOR-003",
        name: "بخور الشيوخ الفاخر",
        name_en: "Shuyookh Royal Bakhoor",
        short_description: "رقائق بخور معطرة بالعود والورد الطائفي والمسك الكريستالي.",
        short_description_en: "Incense chips soaked in Taif rose oil, royal agarwood, and crystal musk.",
        description: "بخور الشيوخ هو الخيار الأول للمجالس والمناسبات الكويتية والخليجية الفاخرة. رقائق خشبية منقى بعناية فائقة ومشبعة بالزيوت العطرية الملكية.",
        description_en: "Shuyookh Bakhoor is the ultimate choice for Gulf receptions and luxury Majlis. Premium agarwood chips infused with essential oils.",
        usage_instructions: "توضع قطعة صغيرة على الفحم المشتعل في المبخرة لنشر العبق الملكي.",
        usage_instructions_en: "Place a small chip over burning charcoal in a traditional censer.",
        highlights: JSON.stringify(["دخان كثيف وعطري", "مناسب للمجالس والمنازل", "ثبات يدوم أيام في المكان"]),
        highlights_en: JSON.stringify(["Rich Dense Smoke", "Perfect for Majlis & Homes", "Days-long Ambient Longevity"]),
        tags: "بخور, عود, مجالس, الكويت",
        tags_en: "bakhoor, incense, oud, majlis",
        seo_title: "بخور الشيوخ الفاخر - بيور فيل الكويت",
        seo_title_en: "Shuyookh Royal Bakhoor - PURE VEIL Kuwait",
        seo_description: "بخور الشيوخ المعطر بالعود والورد الطائفي.",
        seo_description_en: "Shuyookh Royal Bakhoor infused with Taif Rose and Oud.",
        category_id: categoryIds[2],
        price: 28.500,
        old_price: 35.000,
        rating: 4.90,
        reviews_count: 56,
        stock: 50,
        status: "active",
        image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800",
        concentration: "Bakhoor Incense",
        sillage: "فواح جداً",
        longevity: "48+ ساعة في المكان",
        season: "جميع الفصول",
        gender: "للجنسين",
        featured: true,
        is_new: false,
        volumes: [
          { size: "50g", price: 18.000, stock: 25, sku: "PV-BAK-003-50G" },
          { size: "100g", price: 28.500, stock: 25, sku: "PV-BAK-003-100G" }
        ],
        notes: [
          { note_type: "top", note_text: "الورد الطائفي, الهيل", note_text_en: "Taif Rose, Cardamom" },
          { note_type: "heart", note_text: "خشب السدر, البخور العربي", note_text_en: "Sidr Wood, Arabian Incense" },
          { note_type: "base", note_text: "دهن العود الصافي, العنبر الخام", note_text_en: "Pure Oud Oil, Raw Amber" }
        ]
      },
      {
        sku: "PV-AMBER-004",
        name: "عنبر التبغ المعتق",
        name_en: "Vintage Tobacco Amber",
        short_description: "عطر دافئ وجذاب يتناغم فيه التبغ المعتق مع العنبر الدافئ والتوابل النادرة.",
        short_description_en: "A warm opulent fragrance harmonizing vintage blond tobacco with golden amber and spices.",
        description: "عطر فاخر صمم لعشاق الفخامة والتميز. يفتتح العطر بنفحات من التبغ الفاخر الممتزج بالقرفة والزنجبيل، مستقراً على قاعدة دافئة من العنبر والباتشولي.",
        description_en: "A luxurious perfume designed for connoisseurs of opulence. Opening with blond tobacco blended with cinnamon and settling into warm amber.",
        usage_instructions: "يرش على الملابس النظيفة ونقاط النبض لثبات ساحر.",
        usage_instructions_en: "Spray on garments and pulse points for intoxicating presence.",
        highlights: JSON.stringify(["فوحان شتوي ساحر", "تركيز عالي جداً", "تصميم زجاجة فرنسي فاخر"]),
        highlights_en: JSON.stringify(["Spellbinding Winter Sillage", "High Concentration", "French Luxury Flacon"]),
        tags: "عنبر, تبغ, عطور شتوية, رجالي",
        tags_en: "amber, tobacco, winter scent, men",
        seo_title: "عنبر التبغ المعتق - بيور فيل",
        seo_title_en: "Vintage Tobacco Amber - PURE VEIL",
        seo_description: "عطر عنبر التبغ المعتق بالدينار الكويتي.",
        seo_description_en: "Vintage Tobacco Amber fragrance in KWD.",
        category_id: categoryIds[3],
        price: 60.000,
        old_price: 75.000,
        rating: 4.92,
        reviews_count: 24,
        stock: 20,
        status: "active",
        image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800",
        concentration: "Extrait de Parfum",
        sillage: "قوي جداً",
        longevity: "18-24 ساعة",
        season: "الشتاء / الخريف",
        gender: "رجالي / للجنسين",
        featured: true,
        is_new: true,
        volumes: [
          { size: "50ml", price: 42.000, stock: 10, sku: "PV-AMB-004-50" },
          { size: "100ml", price: 60.000, stock: 10, sku: "PV-AMB-004-100" }
        ],
        notes: [
          { note_type: "top", note_text: "أوراق التبغ الفاخرة, القرفة الإندونيسية", note_text_en: "Blond Tobacco Leaves, Indonesian Cinnamon" },
          { note_type: "heart", note_text: "العنبر الذهبي, الباتشولي المعتق", note_text_en: "Golden Amber, Vintage Patchouli" },
          { note_type: "base", note_text: "فانيلا الأوركيد, الكاكاو الداكن", note_text_en: "Orchid Vanilla, Dark Cocoa" }
        ]
      }
    ];

    for (const p of productsData) {
      const [prodRes] = await pool.query(
        `INSERT INTO products (
          sku, name, name_en, short_description, short_description_en,
          description, description_en, usage_instructions, usage_instructions_en,
          highlights, highlights_en, tags, tags_en, seo_title, seo_title_en,
          seo_description, seo_description_en, category_id, price, old_price,
          rating, reviews_count, stock, status, image, concentration, sillage,
          longevity, season, gender, featured, is_new
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.sku, p.name, p.name_en, p.short_description, p.short_description_en,
          p.description, p.description_en, p.usage_instructions, p.usage_instructions_en,
          p.highlights, p.highlights_en, p.tags, p.tags_en, p.seo_title, p.seo_title_en,
          p.seo_description, p.seo_description_en, p.category_id, p.price, p.old_price,
          p.rating, p.reviews_count, p.stock, p.status, p.image, p.concentration, p.sillage,
          p.longevity, p.season, p.gender, p.featured, p.is_new
        ]
      );
      const productId = prodRes.insertId;

      // Seed Multiple Size Variants
      let volOrder = 0;
      for (const vol of p.volumes) {
        await pool.query(
          `INSERT INTO product_volume_options (product_id, size, price, stock, sku, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
          [productId, vol.size, vol.price, vol.stock || 10, vol.sku || `${p.sku}-${vol.size}`, volOrder++]
        );
      }

      // Seed Fragrance Notes
      for (const note of p.notes) {
        await pool.query(
          `INSERT INTO product_notes (product_id, note_type, note_text, note_text_en) VALUES (?, ?, ?, ?)`,
          [productId, note.note_type, note.note_text, note.note_text_en]
        );
      }
    }

    console.log("✅ Seeded Products with Multiple Size Variants & Fragrance Notes");
    console.log("🎉 PURE VEIL Database Seeding Complete!");

  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
}

// Execute seed script directly if called from command line
if (process.argv[1].endsWith("seed.js")) {
  seedDatabase().then(() => process.exit(0));
}
