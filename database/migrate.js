/**
 * migrate.js — Run this to upgrade an existing database to the new schema.
 * Safe to run multiple times (uses IF NOT EXISTS / catches duplicate column errors).
 *
 * Usage: node migrate.js
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "studentdb",
};

async function migrate() {
  const db = await mysql.createConnection(config);
  console.log("Connected to", config.database);

  const alterQueries = [
    // Users table upgrades
    `ALTER TABLE users ADD COLUMN role ENUM('admin', 'staff', 'viewer') NOT NULL DEFAULT 'staff' AFTER password`,
    `ALTER TABLE users ADD COLUMN full_name VARCHAR(150) DEFAULT NULL AFTER role`,
    `ALTER TABLE users ADD COLUMN email VARCHAR(150) DEFAULT NULL AFTER full_name`,
    `ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER email`,
    `ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,

    // Students table upgrades
    `ALTER TABLE students ADD COLUMN gender ENUM('Male', 'Female', 'Other') DEFAULT NULL AFTER email`,
    `ALTER TABLE students ADD COLUMN birthdate DATE DEFAULT NULL AFTER gender`,
    `ALTER TABLE students ADD COLUMN section VARCHAR(20) DEFAULT NULL AFTER year_level`,
    `ALTER TABLE students ADD COLUMN status ENUM('active', 'inactive', 'graduated', 'dropped') NOT NULL DEFAULT 'active' AFTER section`,
    `ALTER TABLE students ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER status`,
    `ALTER TABLE students ADD COLUMN address TEXT DEFAULT NULL AFTER phone`,
    `ALTER TABLE students ADD COLUMN nationality VARCHAR(50) DEFAULT 'Filipino' AFTER address`,
    `ALTER TABLE students ADD COLUMN religion VARCHAR(50) DEFAULT NULL AFTER nationality`,
    `ALTER TABLE students ADD COLUMN civil_status ENUM('Single', 'Married', 'Widowed', 'Separated') DEFAULT 'Single' AFTER religion`,
    `ALTER TABLE students ADD COLUMN guardian_name VARCHAR(150) DEFAULT NULL AFTER civil_status`,
    `ALTER TABLE students ADD COLUMN guardian_phone VARCHAR(20) DEFAULT NULL AFTER guardian_name`,
    `ALTER TABLE students ADD COLUMN date_enrolled DATE DEFAULT NULL AFTER guardian_phone`,
    `ALTER TABLE students ADD COLUMN notes TEXT DEFAULT NULL AFTER date_enrolled`,
    `ALTER TABLE students ADD COLUMN profile_image MEDIUMTEXT DEFAULT NULL AFTER notes`,
    `ALTER TABLE students ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
  ];

  for (const sql of alterQueries) {
    try {
      await db.query(sql);
      console.log("✅", sql.substring(0, 70) + "...");
    } catch (err) {
      if (err.message.includes("Duplicate column")) {
        console.log("⏭️  Already exists:", sql.substring(24, 70));
      } else {
        console.log("❌", err.message);
      }
    }
  }

  // Create audit_log table
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     INT NOT NULL,
        username    VARCHAR(100) NOT NULL,
        action      ENUM('create', 'update', 'delete', 'login', 'register', 'export', 'import') NOT NULL,
        entity      VARCHAR(50) NOT NULL,
        entity_id   INT DEFAULT NULL,
        details     JSON DEFAULT NULL,
        ip_address  VARCHAR(45) DEFAULT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_user (user_id),
        INDEX idx_audit_action (action),
        INDEX idx_audit_entity (entity, entity_id),
        INDEX idx_audit_date (created_at)
      )
    `);
    console.log("✅ audit_log table ready");
  } catch (err) {
    console.log("⏭️  audit_log:", err.message);
  }

  // Make the first registered user an admin (if no admin exists)
  const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
  if (admins.length === 0) {
    const [users] = await db.query("SELECT id, username FROM users ORDER BY id ASC LIMIT 1");
    if (users.length > 0) {
      await db.query("UPDATE users SET role = 'admin' WHERE id = ?", [users[0].id]);
      console.log(`\n🔑 Promoted "${users[0].username}" (id=${users[0].id}) to admin`);
    }
  } else {
    console.log(`\n🔑 Admin already exists (${admins.length} admin(s))`);
  }

  console.log("\n✅ Migration complete!");
  await db.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
