import pool from "../config/db.js";

export const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, paymentMethod, subtotal, shippingFee, total } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "بيانات الطلب غير مكتملة", messageEn: "Incomplete order data" });
    }

    const userId = req.user ? req.user.id : null;

    const [result] = await pool.query(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, subtotal, shipping_fee, total, status, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [userId, customerName, customerEmail || null, customerPhone || null, subtotal || 0, shippingFee || 0, total || 0, paymentMethod || null]
    );

    const orderId = result.insertId;

    for (const item of items) {
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, name, size, price, quantity) VALUES (?, ?, ?, ?, ?, ?)",
        [orderId, item.productId || null, item.name, item.size || null, item.price, item.quantity || 1]
      );
    }

    // Clear user's cart after order
    if (userId) {
      await pool.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
    }

    res.status(201).json({
      success: true,
      data: { id: orderId, status: "pending" },
      message: "تم إنشاء الطلب بنجاح",
      messageEn: "Order created successfully",
    });
  } catch (error) {
    console.error("createOrder error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const getOrders = async (req, res) => {
  try {
    let query, values;
    if (req.user.role === "admin") {
      query = "SELECT * FROM orders ORDER BY created_at DESC";
      values = [];
    } else {
      query = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
      values = [req.user.id];
    }

    const [orders] = await pool.query(query, values);

    // Attach items to each order
    for (const order of orders) {
      const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
      order.items = items;
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error("getOrders error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "حالة غير صالحة", messageEn: "Invalid status" });
    }

    const [existing] = await pool.query("SELECT id FROM orders WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود", messageEn: "Order not found" });
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};
