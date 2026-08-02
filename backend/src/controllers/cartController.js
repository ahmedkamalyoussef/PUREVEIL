import pool from "../config/db.js";

// Helper: Fetch user's cart from MySQL and calculate standard totals
export const getCart = async (req, res) => {
  try {
    const [items] = await pool.query(
      `
      SELECT ci.id, ci.product_id, ci.size, ci.unit_price, ci.quantity, ci.created_at,
        p.name, p.name_en, p.image, p.sku, p.stock, p.status
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `,
      [req.user.id]
    );

    const formattedItems = items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.name,
      productNameEn: i.name_en,
      productImage: i.image,
      size: i.size,
      unitPrice: Number(i.unit_price),
      quantity: Number(i.quantity),
      stock: i.stock,
      status: i.status,
    }));

    const subtotal = formattedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // Fetch dynamic store settings
    const [settingsRows] = await pool.query("SELECT shipping_fee, free_shipping_threshold FROM store_settings LIMIT 1");
    const s = settingsRows[0] || {};
    const baseShip = s.shipping_fee !== undefined ? Number(s.shipping_fee) : 2.0;
    const threshold = s.free_shipping_threshold !== undefined ? Number(s.free_shipping_threshold) : 30.0;

    const shippingFee = subtotal >= threshold || formattedItems.length === 0 ? 0 : baseShip;
    const total = subtotal + shippingFee;

    res.json({
      success: true,
      data: {
        items: formattedItems,
        subtotal: Number(subtotal.toFixed(3)),
        shippingFee: Number(shippingFee.toFixed(3)),
        total: Number(total.toFixed(3)),
      },
    });
  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب السلة",
      messageEn: "Failed to fetch shopping cart",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, size = "100ml", quantity = 1, unitPrice: customUnitPrice } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "معرف المنتج مطلوب",
        messageEn: "Product ID is required",
      });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const [products] = await pool.query(
      "SELECT id, price, status, stock FROM products WHERE id = ?",
      [productId]
    );
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "المنتج غير موجود",
        messageEn: "Product not found",
      });
    }

    const product = products[0];

    // Determine unit price: custom passed price -> size variant price -> base product price
    let unitPrice = customUnitPrice !== undefined ? Number(customUnitPrice) : null;
    if (unitPrice === null || isNaN(unitPrice)) {
      const [volumes] = await pool.query(
        "SELECT price FROM product_volume_options WHERE product_id = ? AND size = ?",
        [productId, size]
      );
      if (volumes.length > 0) {
        unitPrice = Number(volumes[0].price);
      } else {
        unitPrice = Number(product.price);
      }
    }

    // Upsert logic (unique key on user_id, product_id, size)
    const [existing] = await pool.query(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?",
      [req.user.id, productId, size]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + ?, unit_price = ? WHERE id = ?",
        [qty, unitPrice, existing[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO cart_items (user_id, product_id, size, unit_price, quantity) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, productId, size, unitPrice, qty]
      );
    }

    return getCart(req, res);
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إضافة العطر إلى السلة",
      messageEn: "Failed to add fragrance to shopping cart",
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId, size = "100ml", quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || qty <= 0) {
      await pool.query(
        "DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?",
        [req.user.id, productId, size]
      );
    } else {
      await pool.query(
        "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?",
        [qty, req.user.id, productId, size]
      );
    }

    return getCart(req, res);
  } catch (error) {
    console.error("updateCartItem error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث كمية المنتج",
      messageEn: "Failed to update item quantity",
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId, size } = req.params;
    await pool.query(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?",
      [req.user.id, productId, size]
    );
    return getCart(req, res);
  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إزالة المنتج من السلة",
      messageEn: "Failed to remove item from cart",
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    await pool.query("DELETE FROM cart_items WHERE user_id = ?", [req.user.id]);
    return getCart(req, res);
  } catch (error) {
    console.error("clearCart error:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تفريغ السلة",
      messageEn: "Failed to clear shopping cart",
    });
  }
};
