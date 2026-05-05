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
