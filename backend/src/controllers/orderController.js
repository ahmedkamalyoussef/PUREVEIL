import pool from "../config/db.js";

// Ensure payment_status column & order_status_history table exist in database
const ensureSchemaUpdates = async () => {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'payment_status'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE orders ADD COLUMN payment_status ENUM('paid', 'unpaid', 'refunded') DEFAULT 'paid'");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        note TEXT DEFAULT NULL,
        note_en TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  } catch (err) {
    console.error("ensureSchemaUpdates error:", err);
  }
};
ensureSchemaUpdates();

// Helper to get bilingual default notes for order status changes
const getDefaultNotesForStatus = (status) => {
  switch (status) {
    case "pending":
      return {
        ar: "تم استقبال الطلب بنجاح وهو قيد الانتظار والمراجعة.",
        en: "Order has been placed successfully and is pending review.",
      };
    case "confirmed":
    case "processing":
    case "preparing":
    case "packed":
      return {
        ar: "جاري تحضير وتغليف عطورك الفاخرة بعناية.",
        en: "Your order is being processed and packaged.",
      };
    case "shipped":
    case "out_for_delivery":
      return {
        ar: "تم تسليم الشحنة لشركة التوصيل وهو في الطريق إليك.",
        en: "Your package has been shipped and is on its way.",
      };
    case "delivered":
      return {
        ar: "تم تسليم الطلب بنجاح. شكراً لتسوقك من دار بيور فيل.",
        en: "Order delivered successfully. Thank you for choosing PURE VEIL.",
      };
    case "cancelled":
      return {
        ar: "تم إلغاء الطلب.",
        en: "The order has been cancelled.",
      };
    case "refunded":
      return {
        ar: "تم استرجاع مبلغ الطلب.",
        en: "Order amount has been refunded.",
      };
    case "returned":
      return {
        ar: "تم إرجاع الطلب للمتجر.",
        en: "Order has been returned to store.",
      };
    default:
      return {
        ar: `تم تحديث حالة الطلب إلى ${status}.`,
        en: `Order status updated to ${status}.`,
      };
  }
};

// Map status to 4-stage progress index (1 to 4, or 0 for exceptional states)
const getProgressStageInfo = (status) => {
  switch (status) {
    case "pending":
      return { step: 1, key: "pending" };
    case "processing":
    case "preparing":
    case "confirmed":
    case "packed":
      return { step: 2, key: "processing" };
    case "shipped":
    case "out_for_delivery":
      return { step: 3, key: "shipped" };
    case "delivered":
      return { step: 4, key: "delivered" };
    case "cancelled":
      return { step: 0, key: "cancelled" };
    case "refunded":
      return { step: 0, key: "refunded" };
    case "returned":
      return { step: 0, key: "returned" };
    default:
      return { step: 1, key: "pending" };
  }
};

// Calculate estimated delivery text
const getEstimatedDelivery = (status, createdAtDate) => {
  if (status === "delivered") {
    return { ar: "تم التسليم", en: "Delivered" };
  }
  if (status === "cancelled" || status === "refunded" || status === "returned") {
    return { ar: "طلب غير نشط", en: "Inactive Order" };
  }
  if (status === "shipped" || status === "out_for_delivery") {
    return { ar: "خلال 24 ساعة", en: "Within 24 hours" };
  }
  return { ar: "خلال 1 - 3 أيام عمل", en: "Within 1 - 3 business days" };
};


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

    // Insert initial status history event
    const defaultNotes = getDefaultNotesForStatus("pending");
    await pool.query(
      "INSERT INTO order_status_history (order_id, status, note, note_en) VALUES (?, 'pending', ?, ?)",
      [orderId, defaultNotes.ar, defaultNotes.en]
    );

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

    // Attach items with product images and calculated metadata to each order
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

      order.itemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
      order.previewImages = items.map((i) => i.product_image).filter(Boolean).slice(0, 3);

      order.subtotal = Number(order.subtotal);
      order.shippingFee = Number(order.shipping_fee);
      order.total = Number(order.total);
      order.paymentStatus = order.payment_status || "paid";

      const stageInfo = getProgressStageInfo(order.status);
      order.currentStageStep = stageInfo.step;
      order.currentStageKey = stageInfo.key;
      order.estimatedDelivery = getEstimatedDelivery(order.status, order.created_at);
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

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود", messageEn: "Order not found" });
    }

    const order = orders[0];

    // Access control check (only owner or admin can view)
    if (req.user.role !== "admin" && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "غير مسموح بالوصول لهذا الطلب", messageEn: "Access denied" });
    }

    // Fetch items with product images
    const [items] = await pool.query(
      `SELECT oi.*, p.image AS product_image, p.id AS actual_product_id
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items.map((i) => ({
      id: i.id,
      productId: i.product_id || i.actual_product_id,
      name: i.name,
      size: i.size,
      price: Number(i.price),
      quantity: i.quantity,
      productImage: i.product_image,
    }));

    order.itemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
    order.subtotal = Number(order.subtotal);
    order.shippingFee = Number(order.shipping_fee);
    order.total = Number(order.total);
    order.paymentStatus = order.payment_status || "paid";

    // Fetch status history timeline events (newest first)
    const [historyRows] = await pool.query(
      "SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at DESC",
      [id]
    );

    let timelineEvents = historyRows.map((h) => ({
      id: h.id,
      status: h.status,
      note: h.note,
      noteEn: h.note_en,
      createdAt: h.created_at,
    }));

    // Synthesize fallback events if history was empty for legacy order
    if (timelineEvents.length === 0) {
      const defaultInitial = getDefaultNotesForStatus("pending");
      timelineEvents.push({
        id: 1,
        status: "pending",
        note: defaultInitial.ar,
        noteEn: defaultInitial.en,
        createdAt: order.created_at,
      });

      if (order.status !== "pending") {
        const defaultCurrent = getDefaultNotesForStatus(order.status);
        timelineEvents.unshift({
          id: 2,
          status: order.status,
          note: defaultCurrent.ar,
          noteEn: defaultCurrent.en,
          createdAt: order.updated_at || order.created_at,
        });
      }
    }

    // Calculate progress tracker stages (7 stages)
    const stageInfo = getProgressStageInfo(order.status);
    order.currentStageStep = stageInfo.step;
    order.currentStageKey = stageInfo.key;
    order.estimatedDelivery = getEstimatedDelivery(order.status, order.created_at);
    order.timeline = timelineEvents;

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, noteEn } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded", "returned", "confirmed", "preparing", "packed", "out_for_delivery"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "حالة غير صالحة", messageEn: "Invalid status" });
    }

    const [existing] = await pool.query("SELECT id FROM orders WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود", messageEn: "Order not found" });
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);

    // Record timeline entry in order_status_history
    const defaultNotes = getDefaultNotesForStatus(status);
    const finalNoteAr = note || defaultNotes.ar;
    const finalNoteEn = noteEn || defaultNotes.en;

    await pool.query(
      "INSERT INTO order_status_history (order_id, status, note, note_en) VALUES (?, ?, ?, ?)",
      [req.params.id, status, finalNoteAr, finalNoteEn]
    );

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

