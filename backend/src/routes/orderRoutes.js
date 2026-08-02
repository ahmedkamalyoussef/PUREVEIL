import express from "express";
import { createOrder, getOrders, updateOrderStatus, updatePaymentStatus } from "../controllers/orderController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrder);
router.get("/", getOrders);
router.put("/:id/status", authorize("admin"), updateOrderStatus);
router.put("/:id/payment-status", authorize("admin"), updatePaymentStatus);

export default router;
