import express from "express";
import { getFavorites, addFavorite, removeFavorite, checkFavorite, getFavoriteIds } from "../controllers/favoriteController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getFavorites);
router.get("/ids", getFavoriteIds);
router.get("/check/:productId", checkFavorite);
router.post("/", addFavorite);
router.delete("/:productId", removeFavorite);

export default router;
