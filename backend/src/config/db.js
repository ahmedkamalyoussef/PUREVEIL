import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "PUREVEIL",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 5000,
  charset: "utf8mb4",
});


export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error.message);
    return false;
  }
};

export default pool;
