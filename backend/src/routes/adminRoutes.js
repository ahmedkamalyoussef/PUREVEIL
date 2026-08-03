import express from "express";
import { registerAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Admin Registration (Backend Only / Manual Postman Testing)
router.post("/register", registerAdmin);

export default router;
