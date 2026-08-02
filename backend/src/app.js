import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import productRoutes from "./routes/productRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", brand: "PURE VEIL", time: new Date().toISOString() });
});

// API Routes
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/collections", collectionRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/favorites", favoriteRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/settings", settingsRoutes);

// Error Middleware
app.use(errorHandler);

export default app;
