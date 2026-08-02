import dotenv from "dotenv";
import app from "./src/app.js";
import { testConnection } from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error("❌ Cannot start server without database connection.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✨ PUREVEIL Luxury Backend API running on port ${PORT}`);
  });
};

start();
