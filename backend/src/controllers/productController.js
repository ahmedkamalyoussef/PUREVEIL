import pool from "../config/db.js";
import { deleteFileIfUnused } from "../services/fileStorageService.js";

// Helper: Format raw database product row into clean object
const formatProduct = (p, volumeOptions = [], notes = { top: [], topEn: [], heart: [], heartEn: [], base: [], baseEn: [] }) => {
  let highlights = [];
  let highlightsEn = [];
  try {
    highlights = typeof p.highlights === 'string' ? JSON.parse(p.highlights) : (p.highlights || []);
  } catch (e) {
    highlights = p.highlights ? p.highlights.split(',') : [];
  }
  try {
    highlightsEn = typeof p.highlights_en === 'string' ? JSON.parse(p.highlights_en) : (p.highlights_en || []);
  } catch (e) {
    highlightsEn = p.highlights_en ? p.highlights_en.split(',') : [];
  }

  const formattedVolumes = volumeOptions.map(v => ({
    id: v.id,
    size: v.size,
    price: parseFloat(v.price),
    stock: v.stock || 0,
    sku: v.sku || '',
    displayOrder: v.display_order || 0
  }));

  // Determine starting price from size variants
  const startingPrice = formattedVolumes.length > 0
    ? Math.min(...formattedVolumes.map(v => v.price))
    : (parseFloat(p.price) || 0);

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    nameEn: p.name_en,
    shortDescription: p.short_description,
    shortDescriptionEn: p.short_description_en,
    description: p.description,
    descriptionEn: p.description_en,
    usageInstructions: p.usage_instructions,
    usageInstructionsEn: p.usage_instructions_en,
    highlights,
    highlightsEn,
    tags: p.tags ? p.tags.split(',').map(s => s.trim()) : [],
    tagsEn: p.tags_en ? p.tags_en.split(',').map(s => s.trim()) : [],
    category: p.category_name || '',
    categoryEn: p.category_name_en || '',
    categoryId: p.category_id,
    price: startingPrice,
    rating: parseFloat(p.rating) || 5.0,
    reviewsCount: p.reviews_count || 0,
    stock: p.stock || 0,
    status: p.status,
    image: p.image,
    concentration: p.concentration,
    specs: {
      sillage: p.sillage,
      longevity: p.longevity,
      season: p.season,
      gender: p.gender,
    },
    featured: Boolean(p.featured),
    isNew: Boolean(p.is_new),
    volumeOptions: formattedVolumes,
    notes,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  };
};

export const getProducts = async (req, res) => {
  try {
    const { category, search, maxPrice, featured, isNew, status, page, limit } = req.query;

    let baseQuery = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      baseQuery += " AND (c.name = ? OR c.name_en = ? OR p.category_id = ?)";
      params.push(category, category, parseInt(category) || 0);
    }
    if (search) {
      baseQuery += " AND (p.name LIKE ? OR p.name_en LIKE ? OR p.sku LIKE ? OR p.tags LIKE ? OR p.tags_en LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }
    if (maxPrice) {
      baseQuery += " AND p.price <= ?";
      params.push(parseFloat(maxPrice));
    }
    if (featured === 'true' || featured === '1') {
      baseQuery += " AND p.featured = 1";
    }
    if (isNew === 'true' || isNew === '1') {
      baseQuery += " AND p.is_new = 1";
    }
    if (status) {
      baseQuery += " AND p.status = ?";
      params.push(status);
    }

    let rows;
    let pagination = null;

    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.max(1, parseInt(limit, 10) || 10);
      const offset = (pageNum - 1) * pageSize;

      const [countRes] = await pool.query(`SELECT COUNT(*) AS totalRecords ${baseQuery}`, params);
      const totalRecords = countRes[0].totalRecords;
      const totalPages = Math.ceil(totalRecords / pageSize);

      const [pRows] = await pool.query(`SELECT p.*, c.name AS category_name, c.name_en AS category_name_en ${baseQuery} ORDER BY p.id DESC LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
      rows = pRows;

      pagination = {
        currentPage: pageNum,
        pageSize,
        totalRecords,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      };
    } else {
      const [allRows] = await pool.query(`SELECT p.*, c.name AS category_name, c.name_en AS category_name_en ${baseQuery} ORDER BY p.id DESC`, params);
      rows = allRows;
    }

    // Fetch volume options & notes for all returned products
    const products = await Promise.all(
      rows.map(async (row) => {
        const [vols] = await pool.query("SELECT * FROM product_volume_options WHERE product_id = ? ORDER BY display_order ASC, id ASC", [row.id]);
        const [notesRows] = await pool.query("SELECT * FROM product_notes WHERE product_id = ?", [row.id]);

        const notes = { top: [], topEn: [], heart: [], heartEn: [], base: [], baseEn: [] };
        notesRows.forEach((n) => {
          if (n.note_type === 'top') {
            notes.top.push(n.note_text);
            if (n.note_text_en) notes.topEn.push(n.note_text_en);
          } else if (n.note_type === 'heart') {
            notes.heart.push(n.note_text);
            if (n.note_text_en) notes.heartEn.push(n.note_text_en);
          } else if (n.note_type === 'base') {
            notes.base.push(n.note_text);
            if (n.note_text_en) notes.baseEn.push(n.note_text_en);
          }
        });

        return formatProduct(row, vols, notes);
      })
    );

    res.json({ success: true, data: products, pagination });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name, c.name_en AS category_name_en
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود", messageEn: "Product not found" });
    }

    const row = rows[0];
    const [vols] = await pool.query("SELECT * FROM product_volume_options WHERE product_id = ? ORDER BY display_order ASC, id ASC", [row.id]);
    const [notesRows] = await pool.query("SELECT * FROM product_notes WHERE product_id = ?", [row.id]);

    const notes = { top: [], topEn: [], heart: [], heartEn: [], base: [], baseEn: [] };
    notesRows.forEach((n) => {
      if (n.note_type === 'top') {
        notes.top.push(n.note_text);
        if (n.note_text_en) notes.topEn.push(n.note_text_en);
      } else if (n.note_type === 'heart') {
        notes.heart.push(n.note_text);
        if (n.note_text_en) notes.heartEn.push(n.note_text_en);
      } else if (n.note_type === 'base') {
        notes.base.push(n.note_text);
        if (n.note_text_en) notes.baseEn.push(n.note_text_en);
      }
    });

    const product = formatProduct(row, vols, notes);
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("getProductById error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      sku, name, nameEn, name_en, shortDescription, short_description, shortDescriptionEn, short_description_en,
      description, descriptionEn, description_en, usageInstructions, usage_instructions, usageInstructionsEn, usage_instructions_en,
      highlights, highlightsEn, highlights_en, tags, tagsEn, tags_en, categoryId, category_id,
      stock, status, image, concentration, specs, featured, isNew, is_new,
      volumeOptions, notes
    } = req.body;

    const finalSku = sku || `PV-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalName = name;
    const finalNameEn = nameEn || name_en;

    if (!finalName || !finalNameEn) {
      return res.status(400).json({ success: false, message: "اسم المنتج بالعربية والإنجليزية مطلوب", messageEn: "Product name in AR and EN is required" });
    }

    // Determine price from first volume option
    const basePrice = (Array.isArray(volumeOptions) && volumeOptions.length > 0 && volumeOptions[0].price !== undefined)
      ? Number(volumeOptions[0].price)
      : 0;

    const [result] = await pool.query(
      `INSERT INTO products (
        sku, name, name_en, short_description, short_description_en, description, description_en,
        usage_instructions, usage_instructions_en, highlights, highlights_en, tags, tags_en,
        category_id, price, old_price, stock, status, image, concentration, sillage, longevity, season, gender,
        featured, is_new
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalSku, finalName, finalNameEn,
        shortDescription || short_description || null,
        shortDescriptionEn || short_description_en || null,
        description || null,
        descriptionEn || description_en || null,
        usageInstructions || usage_instructions || null,
        usageInstructionsEn || usage_instructions_en || null,
        JSON.stringify(highlights || []),
        JSON.stringify(highlightsEn || highlights_en || []),
        Array.isArray(tags) ? tags.join(',') : (tags || null),
        Array.isArray(tagsEn || tags_en) ? (tagsEn || tags_en).join(',') : (tagsEn || tags_en || null),
        categoryId || category_id || null,
        basePrice,
        stock || 0,
        status || 'active',
        image || null,
        concentration || null,
        specs?.sillage || null,
        specs?.longevity || null,
        specs?.season || null,
        specs?.gender || null,
        featured ? 1 : 0,
        isNew || is_new ? 1 : 0
      ]
    );

    const productId = result.insertId;

    // Insert Volume Options / Size Variants
    if (Array.isArray(volumeOptions) && volumeOptions.length > 0) {
      let vOrder = 0;
      for (const vol of volumeOptions) {
        if (vol.size && vol.price !== undefined) {
          await pool.query(
            "INSERT INTO product_volume_options (product_id, size, price, stock, sku, display_order) VALUES (?, ?, ?, ?, ?, ?)",
            [productId, vol.size, vol.price, vol.stock || stock || 10, vol.sku || `${finalSku}-${vol.size}`, vOrder++]
          );
        }
      }
    }

    // Insert Fragrance Notes
    if (notes) {
      const insertNotes = async (list, listEn, type) => {
        if (Array.isArray(list)) {
          for (let i = 0; i < list.length; i++) {
            const txt = list[i];
            const txtEn = (listEn && listEn[i]) ? listEn[i] : '';
            if (txt) {
              await pool.query(
                "INSERT INTO product_notes (product_id, note_type, note_text, note_text_en) VALUES (?, ?, ?, ?)",
                [productId, type, txt, txtEn]
              );
            }
          }
        }
      };
      await insertNotes(notes.top, notes.topEn, 'top');
      await insertNotes(notes.heart, notes.heartEn, 'heart');
      await insertNotes(notes.base, notes.baseEn, 'base');
    }

    res.status(201).json({ success: true, message: "تمت إضافة المنتج بنجاح", messageEn: "Product created successfully", productId });
  } catch (error) {
    console.error("createProduct error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sku, name, nameEn, name_en, shortDescription, short_description, shortDescriptionEn, short_description_en,
      description, descriptionEn, description_en, usageInstructions, usage_instructions, usageInstructionsEn, usage_instructions_en,
      highlights, highlightsEn, highlights_en, tags, tagsEn, tags_en, categoryId, category_id,
      stock, status, image, concentration, specs, featured, isNew, is_new,
      volumeOptions, notes
    } = req.body;

    const [existing] = await pool.query("SELECT id, image FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود", messageEn: "Product not found" });
    }

    const oldImage = existing[0].image;

    // Base price from first size variant
    const basePrice = (Array.isArray(volumeOptions) && volumeOptions.length > 0 && volumeOptions[0].price !== undefined)
      ? Number(volumeOptions[0].price)
      : null;

    await pool.query(
      `UPDATE products SET
        sku = COALESCE(?, sku),
        name = COALESCE(?, name),
        name_en = COALESCE(?, name_en),
        short_description = COALESCE(?, short_description),
        short_description_en = COALESCE(?, short_description_en),
        description = COALESCE(?, description),
        description_en = COALESCE(?, description_en),
        usage_instructions = COALESCE(?, usage_instructions),
        usage_instructions_en = COALESCE(?, usage_instructions_en),
        highlights = COALESCE(?, highlights),
        highlights_en = COALESCE(?, highlights_en),
        tags = COALESCE(?, tags),
        tags_en = COALESCE(?, tags_en),
        category_id = COALESCE(?, category_id),
        price = COALESCE(?, price),
        old_price = NULL,
        stock = COALESCE(?, stock),
        status = COALESCE(?, status),
        image = COALESCE(?, image),
        concentration = COALESCE(?, concentration),
        sillage = COALESCE(?, sillage),
        longevity = COALESCE(?, longevity),
        season = COALESCE(?, season),
        gender = COALESCE(?, gender),
        featured = COALESCE(?, featured),
        is_new = COALESCE(?, is_new)
      WHERE id = ?`,
      [
        sku || null,
        name || null,
        nameEn || name_en || null,
        shortDescription || short_description || null,
        shortDescriptionEn || short_description_en || null,
        description || null,
        descriptionEn || description_en || null,
        usageInstructions || usage_instructions || null,
        usageInstructionsEn || usage_instructions_en || null,
        highlights ? JSON.stringify(highlights) : null,
        (highlightsEn || highlights_en) ? JSON.stringify(highlightsEn || highlights_en) : null,
        Array.isArray(tags) ? tags.join(',') : (tags || null),
        Array.isArray(tagsEn || tags_en) ? (tagsEn || tags_en).join(',') : (tagsEn || tags_en || null),
        categoryId || category_id || null,
        basePrice,
        stock || null,
        status || null,
        image || null,
        concentration || null,
        specs?.sillage || null,
        specs?.longevity || null,
        specs?.season || null,
        specs?.gender || null,
        featured !== undefined ? (featured ? 1 : 0) : null,
        isNew !== undefined ? (isNew ? 1 : 0) : (is_new !== undefined ? (is_new ? 1 : 0) : null),
        id
      ]
    );

    // Update Volume Options
    if (Array.isArray(volumeOptions)) {
      await pool.query("DELETE FROM product_volume_options WHERE product_id = ?", [id]);
      let vOrder = 0;
      for (const vol of volumeOptions) {
        if (vol.size && vol.price !== undefined) {
          await pool.query(
            "INSERT INTO product_volume_options (product_id, size, price, stock, sku, display_order) VALUES (?, ?, ?, ?, ?, ?)",
            [id, vol.size, vol.price, vol.stock || stock || 10, vol.sku || `${sku}-${vol.size}`, vOrder++]
          );
        }
      }
    }

    // Update Fragrance Notes
    if (notes) {
      await pool.query("DELETE FROM product_notes WHERE product_id = ?", [id]);
      const insertNotes = async (list, listEn, type) => {
        if (Array.isArray(list)) {
          for (let i = 0; i < list.length; i++) {
            const txt = list[i];
            const txtEn = (listEn && listEn[i]) ? listEn[i] : '';
            if (txt) {
              await pool.query(
                "INSERT INTO product_notes (product_id, note_type, note_text, note_text_en) VALUES (?, ?, ?, ?)",
                [id, type, txt, txtEn]
              );
            }
          }
        }
      };
      await insertNotes(notes.top, notes.topEn, 'top');
      await insertNotes(notes.heart, notes.heartEn, 'heart');
      await insertNotes(notes.base, notes.baseEn, 'base');
    }

    // Automatic file cleanup
    if (image && oldImage && image !== oldImage) {
      await deleteFileIfUnused(oldImage);
    }

    res.json({ success: true, message: "تم تحديث المنتج بنجاح", messageEn: "Product updated successfully" });
  } catch (error) {
    console.error("updateProduct error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT id, image FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود", messageEn: "Product not found" });
    }

    const imagePath = rows[0].image;

    await pool.query("DELETE FROM product_volume_options WHERE product_id = ?", [id]);
    await pool.query("DELETE FROM product_notes WHERE product_id = ?", [id]);
    await pool.query("DELETE FROM products WHERE id = ?", [id]);

    if (imagePath) {
      await deleteFileIfUnused(imagePath);
    }

    res.json({ success: true, message: "تم حذف المنتج بنجاح", messageEn: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};
