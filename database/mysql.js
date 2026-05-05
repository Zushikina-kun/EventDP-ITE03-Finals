import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "studentdb",
  waitForConnections: true,
  connectionLimit: 10,
});

// Verify connection on startup
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ MySQL connected to database:", process.env.DB_NAME || "studentdb");
  connection.release();
});

export default db;
