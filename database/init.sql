-- Run this SQL in your MySQL client to set up the database
-- After running, restart the Express server.

CREATE DATABASE IF NOT EXISTS studentdb;
USE studentdb;

-- ── Users table with role-based access ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'staff', 'viewer') NOT NULL DEFAULT 'staff',
  full_name   VARCHAR(150) DEFAULT NULL,
  email       VARCHAR(150) DEFAULT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Students table with extended fields ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_no    VARCHAR(20)  NOT NULL UNIQUE,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  course        VARCHAR(100) NOT NULL,
  year_level    INT          NOT NULL,
  section       VARCHAR(20)  DEFAULT NULL,
  status        ENUM('active', 'inactive', 'graduated', 'dropped') NOT NULL DEFAULT 'active',
  phone         VARCHAR(20)  DEFAULT NULL,
  address       TEXT         DEFAULT NULL,
  guardian_name VARCHAR(150) DEFAULT NULL,
  guardian_phone VARCHAR(20) DEFAULT NULL,
  date_enrolled DATE         DEFAULT NULL,
  notes         TEXT         DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Audit log table ───────────────────────────────────────────────────────────
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
);

-- ── Migration helpers (run if upgrading from old schema) ──────────────────────
-- ALTER TABLE users ADD COLUMN role ENUM('admin', 'staff', 'viewer') NOT NULL DEFAULT 'staff' AFTER password;
-- ALTER TABLE users ADD COLUMN full_name VARCHAR(150) DEFAULT NULL AFTER role;
-- ALTER TABLE users ADD COLUMN email VARCHAR(150) DEFAULT NULL AFTER full_name;
-- ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER email;
-- ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
-- ALTER TABLE students ADD COLUMN section VARCHAR(20) DEFAULT NULL AFTER year_level;
-- ALTER TABLE students ADD COLUMN status ENUM('active', 'inactive', 'graduated', 'dropped') NOT NULL DEFAULT 'active' AFTER section;
-- ALTER TABLE students ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER status;
-- ALTER TABLE students ADD COLUMN address TEXT DEFAULT NULL AFTER phone;
-- ALTER TABLE students ADD COLUMN guardian_name VARCHAR(150) DEFAULT NULL AFTER address;
-- ALTER TABLE students ADD COLUMN guardian_phone VARCHAR(20) DEFAULT NULL AFTER guardian_name;
-- ALTER TABLE students ADD COLUMN date_enrolled DATE DEFAULT NULL AFTER guardian_phone;
-- ALTER TABLE students ADD COLUMN notes TEXT DEFAULT NULL AFTER date_enrolled;
-- ALTER TABLE students ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ── Seed data: Default admin account (password: admin123) ─────────────────────
-- bcrypt hash for 'admin123' with 10 rounds
INSERT IGNORE INTO users (username, password, role, full_name) VALUES
('admin', '$2a$10$Vwqq8Wq31gjF7iwcFY8OeecVbiAd..Oxzh74SpOkRINaAjBIZSWPC', 'admin', 'System Administrator');

-- ── Seed data: Group members as students ──────────────────────────────────────
INSERT IGNORE INTO students (student_no, name, email, course, year_level, status, date_enrolled) VALUES
('2024-BSIT-001', 'Brix A. Directo',              'brix.directo@school.edu',       'BSIT', 3, 'active', '2024-08-15'),
('2024-BSIT-002', 'Cyrille John M. Rubis',        'cyrille.rubis@school.edu',      'BSIT', 3, 'active', '2024-08-15'),
('2024-BSIT-003', 'Djaunathan Albert S. Madayag', 'djaunathan.madayag@school.edu', 'BSIT', 3, 'active', '2024-08-15'),
('2024-BSIT-004', 'Jan Alexis G. Roldan',         'janalexis.roldan@school.edu',   'BSIT', 3, 'active', '2024-08-15'),
('2024-BSIT-005', 'Jibreel Quimson',              'jibreel.quimson@school.edu',    'BSIT', 3, 'active', '2024-08-15');
