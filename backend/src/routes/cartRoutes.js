import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// Cart endpoints (supports both / and /items paths for backwards compatibility)
router.get("/", getCart);

router.post("/", addToCart);
router.post("/items", addToCart);

router.put("/", updateCartItem);
router.put("/items", updateCartItem);

router.delete("/clear", clearCart);
router.delete("/", clearCart);

router.delete("/:productId/:size", removeFromCart);
router.delete("/items/:productId/:size", removeFromCart);

export default router;
