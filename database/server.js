import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "./mysql.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set in .env — server cannot start safely.");
  process.exit(1);
}

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));

// ─── Auth Middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Register
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (existing.length > 0)
      return res.status(409).json({ error: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    await db.promise().query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashed]
    );
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Student CRUD Routes (Protected) ─────────────────────────────────────────

// GET all students
app.get("/students", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM students ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
app.get("/students/:id", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM students WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create student
app.post("/students", authMiddleware, async (req, res) => {
  const { student_no, name, email, course, year_level } = req.body;
  if (!student_no || !name || !email || !course || !year_level)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const [result] = await db.promise().query(
      "INSERT INTO students (student_no, name, email, course, year_level) VALUES (?, ?, ?, ?, ?)",
      [student_no, name, email, course, year_level]
    );
    res.status(201).json({ id: result.insertId, student_no, name, email, course, year_level });
  } catch (err) {
    // MySQL duplicate entry error code
    if (err.code === "ER_DUP_ENTRY") {
      if (err.message.includes("student_no"))
        return res.status(409).json({ error: "Student number already exists" });
      if (err.message.includes("email"))
        return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
app.put("/students/:id", authMiddleware, async (req, res) => {
  const { student_no, name, email, course, year_level } = req.body;
  if (!student_no || !name || !email || !course || !year_level)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const [result] = await db.promise().query(
      "UPDATE students SET student_no=?, name=?, email=?, course=?, year_level=? WHERE id=?",
      [student_no, name, email, course, year_level, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      if (err.message.includes("student_no"))
        return res.status(409).json({ error: "Student number already exists" });
      if (err.message.includes("email"))
        return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
app.delete("/students/:id", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      "DELETE FROM students WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Express server running at http://localhost:${PORT}`);
});
