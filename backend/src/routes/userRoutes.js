import express from "express";
import { getUsers, getUserById, updateUser, deleteUser, updateProfile, updatePassword } from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// User self-service
router.put("/profile", updateProfile);
router.put("/password", updatePassword);

// Admin only
router.get("/", authorize("admin"), getUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
