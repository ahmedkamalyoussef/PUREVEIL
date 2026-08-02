import express from 'express';
import { uploadMiddleware } from '../services/fileStorageService.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/v1/upload/:folder
router.post('/:folder', protect, authorize('admin'), (req, res) => {
  const uploadSingle = uploadMiddleware.single('file');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "حجم الملف كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت",
          messageEn: "File size too large. Maximum allowed size is 5MB"
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "فشل تحميل الملف",
        messageEn: err.message || "File upload failed"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "يرجى تحديد ملف صورة للتحميل",
        messageEn: "Please select an image file to upload"
      });
    }

    const folder = req.params.folder || 'products';
    const relativeUrl = `/uploads/${folder}/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "تم رفع الصورة بنجاح",
      messageEn: "Image uploaded successfully",
      data: {
        url: relativeUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
});

export default router;
