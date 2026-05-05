-- Run this SQL in your MySQL client to set up the database
-- After running, restart the Express server.

CREATE DATABASE IF NOT EXISTS studentdb;
USE studentdb;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_no    VARCHAR(20)  NOT NULL UNIQUE,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  course        VARCHAR(100) NOT NULL,
  year_level    INT          NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If you already created the table without student_no / email UNIQUE,
-- run these ALTER statements instead of recreating:
-- ALTER TABLE students ADD COLUMN student_no VARCHAR(20) NOT NULL UNIQUE AFTER id;
-- ALTER TABLE students ADD UNIQUE (email);

-- ── Seed: Group members ───────────────────────────────────────────────────────
INSERT IGNORE INTO students (student_no, name, email, course, year_level) VALUES
('2024-BSIT-001', 'Brix A. Directo',              'brix.directo@school.edu',       'BSIT', 3),
('2024-BSIT-002', 'Cyrille John M. Rubis',        'cyrille.rubis@school.edu',      'BSIT', 3),
('2024-BSIT-003', 'Djaunathan Albert S. Madayag', 'djaunathan.madayag@school.edu', 'BSIT', 3),
('2024-BSIT-004', 'Jan Alexis G. Roldan',         'janalexis.roldan@school.edu',   'BSIT', 3),
('2024-BSIT-005', 'Jibreel Quimson',              'jibreel.quimson@school.edu',    'BSIT', 3);

-- ── Seed data: Group members ──────────────────────────────────────────────────
-- Insert group members as sample students (skip if already exists)
INSERT IGNORE INTO students (student_no, name, email, course, year_level) VALUES
  ('2022-00001', 'Brix A. Directo',              'brix.directo@school.edu',       'BSIT', 3),
  ('2022-00002', 'Cyrille John M. Rubis',        'cyrille.rubis@school.edu',      'BSIT', 3),
  ('2022-00003', 'Djaunathan Albert S. Madayag', 'djaunathan.madayag@school.edu', 'BSIT', 3),
  ('2022-00004', 'Jan Alexis G. Roldan',         'jan.roldan@school.edu',         'BSIT', 3),
  ('2022-00005', 'Jibreel Quimson',              'jibreel.quimson@school.edu',    'BSIT', 3);
