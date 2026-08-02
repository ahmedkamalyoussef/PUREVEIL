import pool from "../config/db.js";

// Ensure store_settings table & all columns exist
const ensureSettingsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        logo VARCHAR(500) DEFAULT '/logo.png',
        favicon VARCHAR(500) DEFAULT '/favicon.png',
        store_name VARCHAR(255) NOT NULL DEFAULT 'PURE VEIL - بيور فيل',
        store_name_en VARCHAR(255) NOT NULL DEFAULT 'PURE VEIL Luxury Perfumes',
        support_email VARCHAR(255) NOT NULL DEFAULT 'support@pureveil.com',
        support_phone VARCHAR(50) NOT NULL DEFAULT '+965 2200 8800',
        whatsapp VARCHAR(50) NOT NULL DEFAULT '+965 2200 8800',
        store_address VARCHAR(255) NOT NULL DEFAULT 'مدينة الكويت - برج العطور الفاخرة',
        store_address_en VARCHAR(255) NOT NULL DEFAULT 'Kuwait City - Luxury Fragrance Tower',
        instagram_url VARCHAR(500) DEFAULT '#',
        twitter_url VARCHAR(500) DEFAULT '#',
        facebook_url VARCHAR(500) DEFAULT '#',
        shipping_fee DECIMAL(10, 3) NOT NULL DEFAULT 2.000,
        free_shipping_threshold DECIMAL(10, 3) NOT NULL DEFAULT 30.000,
        copyright_text VARCHAR(255) DEFAULT 'جميع الحقوق محفوظة.',
        copyright_text_en VARCHAR(255) DEFAULT 'All rights reserved.',
        currency VARCHAR(10) NOT NULL DEFAULT 'KWD',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Safely ensure missing columns in existing table
    const safeAddColumn = async (colName, colDef) => {
      try {
        const [cols] = await pool.query(`SHOW COLUMNS FROM store_settings LIKE ?`, [colName]);
        if (cols.length === 0) {
          await pool.query(`ALTER TABLE store_settings ADD COLUMN ${colName} ${colDef}`);
        }
      } catch (err) {}
    };

    await safeAddColumn('logo', "VARCHAR(500) DEFAULT '/logo.png'");
    await safeAddColumn('favicon', "VARCHAR(500) DEFAULT '/favicon.png'");
    await safeAddColumn('whatsapp', "VARCHAR(50) NOT NULL DEFAULT '+965 2200 8800'");
    await safeAddColumn('store_address_en', "VARCHAR(255) NOT NULL DEFAULT 'Kuwait City - Luxury Fragrance Tower'");
    await safeAddColumn('instagram_url', "VARCHAR(500) DEFAULT '#'");
    await safeAddColumn('twitter_url', "VARCHAR(500) DEFAULT '#'");
    await safeAddColumn('facebook_url', "VARCHAR(500) DEFAULT '#'");
    await safeAddColumn('copyright_text', "VARCHAR(255) DEFAULT 'جميع الحقوق محفوظة.'");
    await safeAddColumn('copyright_text_en', "VARCHAR(255) DEFAULT 'All rights reserved.'");

    const [rows] = await pool.query("SELECT id FROM store_settings LIMIT 1");
    if (rows.length === 0) {
      await pool.query(`
        INSERT INTO store_settings (
          logo, favicon, store_name, store_name_en, support_email, support_phone, whatsapp,
          store_address, store_address_en, instagram_url, twitter_url, facebook_url,
          shipping_fee, free_shipping_threshold, copyright_text, copyright_text_en, currency
        ) VALUES (
          '/logo.png', '/favicon.png', 'PURE VEIL - بيور فيل', 'PURE VEIL Luxury Perfumes',
          'support@pureveil.com', '+965 2200 8800', '+965 2200 8800',
          'مدينة الكويت - برج العطور الفاخرة', 'Kuwait City - Luxury Fragrance Tower',
          '#', '#', '#', 2.000, 30.000, 'جميع الحقوق محفوظة.', 'All rights reserved.', 'KWD'
        )
      `);
    }
  } catch (err) {
    console.error("ensureSettingsTable error:", err);
  }
};
ensureSettingsTable();

const formatSettings = (s) => ({
  logo: s.logo || '/logo.png',
  favicon: s.favicon || '/favicon.png',
  storeName: s.store_name || 'PURE VEIL - بيور فيل',
  storeNameEn: s.store_name_en || 'PURE VEIL Luxury Perfumes',
  supportEmail: s.support_email || 'support@pureveil.com',
  supportPhone: s.support_phone || '+965 2200 8800',
  whatsapp: s.whatsapp || '+965 2200 8800',
  storeAddress: s.store_address || 'مدينة الكويت - برج العطور الفاخرة',
  storeAddressEn: s.store_address_en || 'Kuwait City - Luxury Fragrance Tower',
  instagramUrl: s.instagram_url || '#',
  twitterUrl: s.twitter_url || '#',
  facebookUrl: s.facebook_url || '#',
  shippingFee: Number(s.shipping_fee !== undefined ? s.shipping_fee : 2.000),
  freeShippingThreshold: Number(s.free_shipping_threshold !== undefined ? s.free_shipping_threshold : 30.000),
  copyrightText: s.copyright_text || 'جميع الحقوق محفوظة.',
  copyrightTextEn: s.copyright_text_en || 'All rights reserved.',
  currency: s.currency || 'KWD',
});

export const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM store_settings LIMIT 1");
    const s = rows[0] || {};
    res.json({
      success: true,
      data: formatSettings(s),
    });
  } catch (error) {
    console.error("getSettings error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      logo,
      favicon,
      storeName,
      storeNameEn,
      supportEmail,
      supportPhone,
      whatsapp,
      storeAddress,
      storeAddressEn,
      instagramUrl,
      twitterUrl,
      facebookUrl,
      shippingFee,
      freeShippingThreshold,
      copyrightText,
      copyrightTextEn,
    } = req.body;

    const [rows] = await pool.query("SELECT id FROM store_settings LIMIT 1");
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO store_settings (
          logo, favicon, store_name, store_name_en, support_email, support_phone, whatsapp,
          store_address, store_address_en, instagram_url, twitter_url, facebook_url,
          shipping_fee, free_shipping_threshold, copyright_text, copyright_text_en, currency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'KWD')`,
        [
          logo || '/logo.png', favicon || '/favicon.png', storeName, storeNameEn,
          supportEmail, supportPhone, whatsapp, storeAddress, storeAddressEn,
          instagramUrl, twitterUrl, facebookUrl, shippingFee || 2, freeShippingThreshold || 30,
          copyrightText, copyrightTextEn
        ]
      );
    } else {
      await pool.query(
        `UPDATE store_settings
         SET logo = COALESCE(?, logo),
             favicon = COALESCE(?, favicon),
             store_name = COALESCE(?, store_name),
             store_name_en = COALESCE(?, store_name_en),
             support_email = COALESCE(?, support_email),
             support_phone = COALESCE(?, support_phone),
             whatsapp = COALESCE(?, whatsapp),
             store_address = COALESCE(?, store_address),
             store_address_en = COALESCE(?, store_address_en),
             instagram_url = COALESCE(?, instagram_url),
             twitter_url = COALESCE(?, twitter_url),
             facebook_url = COALESCE(?, facebook_url),
             shipping_fee = COALESCE(?, shipping_fee),
             free_shipping_threshold = COALESCE(?, free_shipping_threshold),
             copyright_text = COALESCE(?, copyright_text),
             copyright_text_en = COALESCE(?, copyright_text_en)
         WHERE id = ?`,
        [
          logo || null, favicon || null, storeName || null, storeNameEn || null,
          supportEmail || null, supportPhone || null, whatsapp || null,
          storeAddress || null, storeAddressEn || null, instagramUrl || null,
          twitterUrl || null, facebookUrl || null,
          shippingFee !== undefined ? Number(shippingFee) : null,
          freeShippingThreshold !== undefined ? Number(freeShippingThreshold) : null,
          copyrightText || null, copyrightTextEn || null,
          rows[0].id
        ]
      );
    }

    const [updatedRows] = await pool.query("SELECT * FROM store_settings LIMIT 1");
    const updatedData = formatSettings(updatedRows[0] || {});

    res.json({
      success: true,
      message: "تم حفظ إعدادات المتجر بنجاح",
      messageEn: "Store settings saved successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("updateSettings error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم", messageEn: "Server error" });
  }
};
