import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/**
 * Admin Registration Controller (Backend Only)
 * Allows creating administrator accounts during initial setup/development.
 */
export const registerAdmin = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password } = req.body;

    // Combine firstName & lastName if provided separately
    const fullName = (name || `${firstName || ''} ${lastName || ''}`).trim();

    // Validation: Required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "الرجاء تعبئة جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، وكلمة المرور)",
        messageEn: "All required fields must be provided (name, email, and password)",
      });
    }

    // Validation: Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "عنوان البريد الإلكتروني غير صحيح",
        messageEn: "Invalid email format",
      });
    }

    // Validation: Password Strength (min 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        messageEn: "Password must be at least 6 characters",
      });
    }

    // Validation: Check for Duplicate Email
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني مسجل مسبقاً",
        messageEn: "Email is already registered",
      });
    }

    // Hash Password using bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert Admin User into Database with ADMIN role
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
      [fullName, email, passwordHash]
    );

    // Generate JWT Token with ADMIN role
    const token = jwt.sign(
      { id: result.insertId, role: "admin", email },
      process.env.JWT_SECRET || "pureveil_luxury_secret_key_2026",
      { expiresIn: "7d" }
    );

    // Return 201 Created Response
    res.status(201).json({
      success: true,
      message: "تم إنشاء حساب المسؤول بنجاح",
      messageEn: "Admin account created successfully",
      data: {
        user: {
          id: result.insertId,
          name: fullName,
          email,
          role: "admin",
        },
        token,
      },
    });
  } catch (error) {
    console.error("registerAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "خطأ في الخادم أثناء إنشاء حساب المسؤول",
      messageEn: "Server error during admin registration",
      error: error.message,
    });
  }
};

