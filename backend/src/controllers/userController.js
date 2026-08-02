import bcrypt from "bcryptjs";
import pool from "../config/db.js";

// Admin: get all users
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("getUsers error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// Admin: get single user
export const getUserById = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "المستخدم غير موجود", messageEn: "User not found" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// Admin: update user role/status
export const updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    const [existing] = await pool.query("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "المستخدم غير موجود", messageEn: "User not found" });
    }

    const updates = [];
    const values = [];
    if (name) { updates.push("name = ?"); values.push(name); }
    if (role && ["admin", "supplier", "user"].includes(role)) { updates.push("role = ?"); values.push(role); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "لا توجد بيانات للتحديث", messageEn: "No data to update" });
    }

    values.push(req.params.id);
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    const [rows] = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// Admin: delete user
export const deleteUser = async (req, res) => {
  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "المستخدم غير موجود", messageEn: "User not found" });
    }
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "تم حذف المستخدم بنجاح", messageEn: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// User: update own profile (name)
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "الاسم مطلوب", messageEn: "Name is required" });
    }
    await pool.query("UPDATE users SET name = ? WHERE id = ?", [name, req.user.id]);
    const [rows] = await pool.query("SELECT id, name, email, role FROM users WHERE id = ?", [req.user.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

// User: update own password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "الرجاء تعبئة جميع الحقول", messageEn: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل", messageEn: "New password must be at least 6 characters" });
    }

    const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "كلمة المرور الحالية غير صحيحة", messageEn: "Current password is incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, req.user.id]);

    res.json({ success: true, message: "تم تحديث كلمة المرور بنجاح", messageEn: "Password updated successfully" });
  } catch (error) {
    console.error("updatePassword error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};
