import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "غير مصرح، لم يتم توفير رمز الدخول", messageEn: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "pureveil_luxury_secret_key_2026");
    const [rows] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [decoded.id]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "المستخدم غير موجود", messageEn: "User not found" });
    }
    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "رمز الدخول غير صالح", messageEn: "Token verification failed" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "غير مصرح لك بالوصول", messageEn: "Access denied" });
    }
    next();
  };
};
