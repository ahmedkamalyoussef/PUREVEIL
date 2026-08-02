import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'user'");
    const [[{ totalProducts }]] = await pool.query("SELECT COUNT(*) AS totalProducts FROM products WHERE status = 'active'");
    const [[{ totalOrders }]] = await pool.query("SELECT COUNT(*) AS totalOrders FROM orders");
    const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders WHERE status != 'cancelled'");

    // Recent orders
    const [recentOrders] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 10");

    // Orders by status
    const [ordersByStatus] = await pool.query(`
      SELECT status, COUNT(*) AS count FROM orders GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue),
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};
