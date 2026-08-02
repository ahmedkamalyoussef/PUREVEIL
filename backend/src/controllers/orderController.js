import pool from "../config/db.js";

// Ensure payment_status column exists in orders table
const ensurePaymentStatusColumn = async () => {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'payment_status'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE orders ADD COLUMN payment_status ENUM('paid', 'unpaid', 'refunded') DEFAULT 'paid'");
    }
  } catch (err) {
    // Ignore error if already exists
  }
};
ensurePaymentStatusColumn();

export const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items, paymentMethod, subtotal, shippingFee, total } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "بيانات الطلب غير مكتملة", messageEn: "Incomplete order data" });
    }

    const userId = req.user ? req.user.id : null;

    const [result] = await pool.query(
      `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, subtotal, shipping_fee, total, status, payment_status, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'paid', ?)`,
      [userId, customerName, customerEmail || null, customerPhone || null, subtotal || 0, shippingFee || 0, total || 0, paymentMethod || null]
    );

    const orderId = result.insertId;

    for (const item of items) {
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, name, size, price, quantity) VALUES (?, ?, ?, ?, ?, ?)",
        [orderId, item.productId || null, item.name, item.size || null, item.price, item.quantity || 1]
      );
    }

    // Clear user's cart after order creation
    if (userId) {
      await pool.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
    }

    res.status(201).json({
      success: true,
      data: { id: orderId, status: "pending", paymentStatus: "paid" },
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
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      paymentStatus = "",
      paymentMethod = "",
      datePreset = "",
      startDate = "",
      endDate = "",
      minPrice = "",
      maxPrice = "",
      sortBy = "newest",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * pageSize;

    let whereConditions = ["1=1"];
    let params = [];

    // User scope (admin sees all orders, regular user sees own orders)
    if (req.user.role !== "admin") {
      whereConditions.push("o.user_id = ?");
      params.push(req.user.id);
    }

    // Status filter
    if (status) {
      whereConditions.push("o.status = ?");
      params.push(status);
    }

    // Payment Status filter
    if (paymentStatus) {
      whereConditions.push("o.payment_status = ?");
      params.push(paymentStatus);
    }

    // Payment Method filter
    if (paymentMethod) {
      whereConditions.push("o.payment_method = ?");
      params.push(paymentMethod);
    }

    // Global Search (Order ID, Customer Name, Email, Phone, Product Name)
    if (search && search.trim() !== "") {
      const term = `%${search.trim()}%`;
      whereConditions.push(
        `(CAST(o.id AS CHAR) LIKE ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ? OR EXISTS (
          SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.name LIKE ?
        ))`
      );
      params.push(term, term, term, term, term);
    }

    // Price Range filter
    if (minPrice !== "" && !isNaN(parseFloat(minPrice))) {
      whereConditions.push("o.total >= ?");
      params.push(parseFloat(minPrice));
    }
    if (maxPrice !== "" && !isNaN(parseFloat(maxPrice))) {
      whereConditions.push("o.total <= ?");
      params.push(parseFloat(maxPrice));
    }

    // Date Range Presets & Custom Dates
    const now = new Date();
    if (datePreset === "today") {
      whereConditions.push("DATE(o.created_at) = CURRENT_DATE()");
    } else if (datePreset === "yesterday") {
      whereConditions.push("DATE(o.created_at) = CURRENT_DATE() - INTERVAL 1 DAY");
    } else if (datePreset === "last7days") {
      whereConditions.push("o.created_at >= NOW() - INTERVAL 7 DAY");
    } else if (datePreset === "last30days") {
      whereConditions.push("o.created_at >= NOW() - INTERVAL 30 DAY");
    } else if (datePreset === "thisMonth") {
      whereConditions.push("MONTH(o.created_at) = MONTH(CURRENT_DATE()) AND YEAR(o.created_at) = YEAR(CURRENT_DATE())");
    } else if (datePreset === "lastMonth") {
      whereConditions.push("o.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)");
    } else if (startDate || endDate) {
      if (startDate) {
        whereConditions.push("o.created_at >= ?");
        params.push(`${startDate} 00:00:00`);
      }
      if (endDate) {
        whereConditions.push("o.created_at <= ?");
        params.push(`${endDate} 23:59:59`);
      }
    }

    const whereSql = whereConditions.join(" AND ");

    // Sorting Logic
    let orderSql = "ORDER BY o.created_at DESC";
    if (sortBy === "oldest") {
      orderSql = "ORDER BY o.created_at ASC";
    } else if (sortBy === "highestTotal") {
      orderSql = "ORDER BY o.total DESC";
    } else if (sortBy === "lowestTotal") {
      orderSql = "ORDER BY o.total ASC";
    } else if (sortBy === "customerName") {
      orderSql = "ORDER BY o.customer_name ASC";
    } else if (sortBy === "orderStatus") {
      orderSql = "ORDER BY o.status ASC";
    }

    // Count Total Matching Records
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS totalRecords FROM orders o WHERE ${whereSql}`,
      params
    );
    const totalRecords = countResult[0].totalRecords;
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Fetch Paginated Orders
    const [orders] = await pool.query(
      `SELECT o.* FROM orders o WHERE ${whereSql} ${orderSql} LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // Attach items with product images to each order
    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.image AS product_image
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      order.items = items.map((i) => ({
        id: i.id,
        productId: i.product_id,
        name: i.name,
        size: i.size,
        price: Number(i.price),
        quantity: i.quantity,
        productImage: i.product_image,
      }));

      order.subtotal = Number(order.subtotal);
      order.shippingFee = Number(order.shipping_fee);
      order.total = Number(order.total);
      order.paymentStatus = order.payment_status || "paid";
    }

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        pageSize,
        totalRecords,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    });
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

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ["paid", "unpaid", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "حالة دفع غير صالحة", messageEn: "Invalid payment status" });
    }

    const [existing] = await pool.query("SELECT id FROM orders WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود", messageEn: "Order not found" });
    }

    await pool.query("UPDATE orders SET payment_status = ? WHERE id = ?", [paymentStatus, req.params.id]);
    const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("updatePaymentStatus error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};
