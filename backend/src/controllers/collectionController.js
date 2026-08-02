import pool from "../config/db.js";
import { deleteFileIfUnused } from "../services/fileStorageService.js";

// Public: Get all active collections with product count
export const getCollections = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.id, c.name, c.name_en AS nameEn, c.description, c.description_en AS descriptionEn,
             c.image, c.display_order AS displayOrder, c.status,
             c.seo_title AS seoTitle, c.seo_title_en AS seoTitleEn,
             c.seo_description AS seoDescription, c.seo_description_en AS seoDescriptionEn,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') AS count
      FROM categories c
      WHERE c.status = 'active'
      ORDER BY c.display_order ASC, c.id DESC
    `);

    res.json({ success: true, data: { categories } });
  } catch (error) {
    console.error("getCollections error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// Admin: Get all categories/collections (including inactive)
export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.name, c.name_en AS nameEn, c.description, c.description_en AS descriptionEn,
             c.image, c.display_order AS displayOrder, c.status,
             c.seo_title AS seoTitle, c.seo_title_en AS seoTitleEn,
             c.seo_description AS seoDescription, c.seo_description_en AS seoDescriptionEn,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
      FROM categories c
      ORDER BY c.display_order ASC, c.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// Admin: Create new Collection
export const createCategory = async (req, res) => {
  try {
    const {
      name, name_en, nameEn, description, description_en, descriptionEn,
      image, display_order, displayOrder, status,
      seo_title, seoTitle, seo_title_en, seoTitleEn,
      seo_description, seoDescription, seo_description_en, seoDescriptionEn
    } = req.body;

    const finalName = name;
    const finalNameEn = name_en || nameEn;
    if (!finalName || !finalNameEn) {
      return res.status(400).json({ success: false, message: "الاسم بالعربية والإنجليزية مطلوب", messageEn: "Arabic and English names are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO categories (
        name, name_en, description, description_en, image, display_order, status,
        seo_title, seo_title_en, seo_description, seo_description_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalName,
        finalNameEn,
        description || description_en || descriptionEn || null,
        description_en || descriptionEn || null,
        image || null,
        display_order || displayOrder || 0,
        status || 'active',
        seo_title || seoTitle || null,
        seo_title_en || seoTitleEn || null,
        seo_description || seoDescription || null,
        seo_description_en || seoDescriptionEn || null
      ]
    );

    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("createCategory error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// Admin: Update Collection
export const updateCategory = async (req, res) => {
  try {
    const {
      name, name_en, nameEn, description, description_en, descriptionEn,
      image, display_order, displayOrder, status,
      seo_title, seoTitle, seo_title_en, seoTitleEn,
      seo_description, seoDescription, seo_description_en, seoDescriptionEn
    } = req.body;

    const [existing] = await pool.query("SELECT id, image FROM categories WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "المجموعة غير موجودة", messageEn: "Collection not found" });
    }

    const oldImage = existing[0].image;

    await pool.query(
      `UPDATE categories SET
        name = COALESCE(?, name),
        name_en = COALESCE(?, name_en),
        description = COALESCE(?, description),
        description_en = COALESCE(?, description_en),
        image = COALESCE(?, image),
        display_order = COALESCE(?, display_order),
        status = COALESCE(?, status),
        seo_title = COALESCE(?, seo_title),
        seo_title_en = COALESCE(?, seo_title_en),
        seo_description = COALESCE(?, seo_description),
        seo_description_en = COALESCE(?, seo_description_en)
      WHERE id = ?`,
      [
        name || null,
        name_en || nameEn || null,
        description || description_en || descriptionEn || null,
        description_en || descriptionEn || null,
        image || null,
        display_order !== undefined ? display_order : displayOrder,
        status || null,
        seo_title || seoTitle || null,
        seo_title_en || seoTitleEn || null,
        seo_description || seoDescription || null,
        seo_description_en || seoDescriptionEn || null,
        req.params.id
      ]
    );

    if (image && image !== oldImage) {
      await deleteFileIfUnused(oldImage);
    }

    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// Admin: Delete Collection
export const deleteCategory = async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT id, image FROM categories WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "المجموعة غير موجودة", messageEn: "Collection not found" });
    }

    const catImage = existing[0].image;

    await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);

    if (catImage) {
      await deleteFileIfUnused(catImage);
    }

    res.json({ success: true, message: "تم حذف المجموعة", messageEn: "Collection deleted" });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};
