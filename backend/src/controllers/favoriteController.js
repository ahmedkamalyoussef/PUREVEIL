import pool from "../config/db.js";

// Helper: Attach volume options to products list
const attachProductDetails = async (products) => {
  if (!products || products.length === 0) return [];
  const productIds = products.map((p) => p.id);

  const [vRows] = await pool.query(
    "SELECT * FROM product_volume_options WHERE product_id IN (?) ORDER BY display_order ASC",
    [productIds]
  );

  return products.map((p) => {
    const volumeOptions = vRows
      .filter((v) => v.product_id === p.id)
      .map((v) => ({
        id: v.id,
        size: v.size,
        price: Number(v.price),
        stock: v.stock,
        sku: v.sku,
        displayOrder: v.display_order,
      }));

    return {
      ...p,
      volumeOptions: volumeOptions.length ? volumeOptions : [{ size: "100ml", price: p.price, stock: p.stock }],
    };
  });
};

export const getFavorites = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT f.id AS favorite_id, f.created_at AS favorited_at,
        p.id, p.sku, p.name, p.name_en, p.short_description, p.short_description_en,
        p.description, p.description_en, p.usage_instructions, p.usage_instructions_en,
        p.highlights, p.highlights_en, p.tags, p.tags_en, p.seo_title, p.seo_title_en,
        p.seo_description, p.seo_description_en, p.price, p.old_price, p.rating,
        p.reviews_count, p.stock, p.status, p.image, p.concentration, p.sillage,
        p.longevity, p.season, p.gender, p.featured, p.is_new,
        c.name AS category_name, c.name_en AS category_name_en, c.id AS category_id
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `,
      [req.user.id]
    );

    const baseProducts = rows.map((r) => {
      let highlights = [];
      let highlightsEn = [];
      try {
        highlights = typeof r.highlights === "string" ? JSON.parse(r.highlights) : r.highlights || [];
      } catch (e) {
        highlights = r.highlights ? r.highlights.split(",") : [];
      }
      try {
        highlightsEn = typeof r.highlights_en === "string" ? JSON.parse(r.highlights_en) : r.highlights_en || [];
      } catch (e) {
        highlightsEn = r.highlights_en ? r.highlights_en.split(",") : [];
      }

      return {
        favoriteId: r.favorite_id,
        favoritedAt: r.favorited_at,
        id: r.id,
        sku: r.sku,
        name: r.name,
        nameEn: r.name_en,
        shortDescription: r.short_description,
        shortDescriptionEn: r.short_description_en,
        description: r.description,
        descriptionEn: r.description_en,
        usageInstructions: r.usage_instructions,
        usageInstructionsEn: r.usage_instructions_en,
        highlights,
        highlightsEn,
        tags: r.tags ? r.tags.split(",").map((s) => s.trim()) : [],
        tagsEn: r.tags_en ? r.tags_en.split(",").map((s) => s.trim()) : [],
        category: r.category_name || "",
        categoryEn: r.category_name_en || "",
        categoryId: r.category_id,
        price: Number(r.price),
        oldPrice: r.old_price ? Number(r.old_price) : null,
        rating: Number(r.rating),
        reviewsCount: r.reviews_count,
        stock: r.stock,
        status: r.status,
        image: r.image,
        concentration: r.concentration,
        sillage: r.sillage,
        longevity: r.longevity,
        season: r.season,
        gender: r.gender,
        featured: Boolean(r.featured),
        isNew: Boolean(r.is_new),
      };
    });

    const fullProducts = await attachProductDetails(baseProducts);

    res.json({ success: true, count: fullProducts.length, data: fullProducts });
  } catch (error) {
    console.error("getFavorites error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "معرف المنتج مطلوب", messageEn: "Product ID is required" });
    }

    const [product] = await pool.query("SELECT id FROM products WHERE id = ?", [productId]);
    if (product.length === 0) {
      return res.status(404).json({ success: false, message: "المنتج غير موجود", messageEn: "Product not found" });
    }

    // Insert ignore to handle unique constraint gracefully
    await pool.query(
      "INSERT INTO favorites (user_id, product_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id",
      [req.user.id, productId]
    );

    res.status(201).json({ success: true, message: "تمت الإضافة للمفضلة", messageEn: "Added to favorites" });
  } catch (error) {
    console.error("addFavorite error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    await pool.query("DELETE FROM favorites WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
    res.json({ success: true, message: "تمت الإزالة من المفضلة", messageEn: "Removed from favorites" });
  } catch (error) {
    console.error("removeFavorite error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id FROM favorites WHERE user_id = ? AND product_id = ?", [req.user.id, req.params.productId]);
    res.json({ success: true, data: { isFavorited: rows.length > 0 } });
  } catch (error) {
    console.error("checkFavorite error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const getFavoriteIds = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT product_id FROM favorites WHERE user_id = ?", [req.user.id]);
    res.json({ success: true, data: rows.map(r => r.product_id) });
  } catch (error) {
    console.error("getFavoriteIds error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};
