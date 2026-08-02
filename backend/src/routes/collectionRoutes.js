import express from "express";
import { getCollections, getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/collectionController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getCollections);

// Admin category management
router.get("/categories", protect, authorize("admin"), getCategories);
router.post("/categories", protect, authorize("admin"), createCategory);
router.put("/categories/:id", protect, authorize("admin"), updateCategory);
router.delete("/categories/:id", protect, authorize("admin"), deleteCategory);

export default router;
