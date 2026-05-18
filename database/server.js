import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import db from "./mysql.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is not set in .env — server cannot start safely.");
  process.exit(1);
}

app.use(express.json({ limit: "5mb" }));
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"], credentials: true }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ─── Audit Logger ─────────────────────────────────────────────────────────────
async function logAudit(userId, username, action, entity, entityId = null, details = null, ip = null) {
  try {
    await db.promise().query(
      "INSERT INTO audit_log (user_id, username, action, entity, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [userId, username, action, entity, entityId, details ? JSON.stringify(details) : null, ip]
    );
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
}

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

// ─── Role Middleware ──────────────────────────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Register
app.post("/auth/register", authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });
  if (typeof username !== "string" || username.trim().length < 3)
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim()))
    return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    const [existing] = await db.promise().query(
      "SELECT id FROM users WHERE username = ?",
      [username.trim()]
    );
    if (existing.length > 0)
      return res.status(409).json({ error: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, 'staff')",
      [username.trim(), hashed]
    );

    await logAudit(result.insertId, username.trim(), "register", "users", result.insertId, null, req.ip);
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Login
app.post("/auth/login", authLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM users WHERE username = ? AND is_active = TRUE",
      [username]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    await logAudit(user.id, user.username, "login", "users", user.id, null, req.ip);
    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Change Password
app.post("/auth/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "Current and new password required" });
  if (newPassword.length < 6)
    return res.status(400).json({ error: "New password must be at least 6 characters" });

  try {
    const [rows] = await db.promise().query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) return res.status(401).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.promise().query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);

    await logAudit(req.user.id, req.user.username, "update", "users", req.user.id, { field: "password" }, req.ip);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Get current user profile
app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT id, username, role, full_name, email, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ─── Student CRUD Routes (Protected) ─────────────────────────────────────────

const VALID_COURSES = ["BSIT", "BSCS", "BSIS", "BSCE", "BSEE", "BSME", "BSN", "BSBA", "BSED", "Other"];
const VALID_STATUSES = ["active", "inactive", "graduated", "dropped"];
const VALID_GENDERS = ["Male", "Female", "Other"];
const VALID_CIVIL_STATUSES = ["Single", "Married", "Widowed", "Separated"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStudent(body) {
  const { student_no, name, email, course, year_level } = body;
  if (!student_no || !name || !email || !course || !year_level)
    return "Student No., Name, Email, Course, and Year Level are required";
  if (typeof student_no !== "string" || student_no.trim().length === 0)
    return "Student number is required";
  if (typeof name !== "string" || name.trim().length < 2)
    return "Name must be at least 2 characters";
  if (!EMAIL_REGEX.test(email))
    return "Invalid email address";
  if (!VALID_COURSES.includes(course))
    return `Invalid course. Allowed: ${VALID_COURSES.join(", ")}`;
  const yr = Number(year_level);
  if (!Number.isInteger(yr) || yr < 1 || yr > 4)
    return "Year level must be between 1 and 4";
  if (body.status && !VALID_STATUSES.includes(body.status))
    return `Invalid status. Allowed: ${VALID_STATUSES.join(", ")}`;
  if (body.gender && !VALID_GENDERS.includes(body.gender))
    return `Invalid gender. Allowed: ${VALID_GENDERS.join(", ")}`;
  if (body.civil_status && !VALID_CIVIL_STATUSES.includes(body.civil_status))
    return `Invalid civil status. Allowed: ${VALID_CIVIL_STATUSES.join(", ")}`;
  if (body.phone && !/^[0-9+\-() ]{7,20}$/.test(body.phone))
    return "Invalid phone number format";
  if (body.birthdate && isNaN(Date.parse(body.birthdate)))
    return "Invalid birthdate format";
  return null;
}

// POST bulk import students (admin only) — must be before :id routes
app.post("/students/bulk", authMiddleware, requireRole("admin"), async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0)
    return res.status(400).json({ error: "Provide an array of students" });
  if (students.length > 500)
    return res.status(400).json({ error: "Maximum 500 students per import" });

  const results = { success: 0, failed: 0, errors: [] };

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const validationError = validateStudent(s);
    if (validationError) {
      results.failed++;
      results.errors.push({ row: i + 1, student_no: s.student_no || "N/A", error: validationError });
      continue;
    }

    try {
      await db.promise().query(
        `INSERT INTO students (student_no, name, email, course, year_level, section, status, phone, date_enrolled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.student_no, s.name, s.email, s.course, s.year_level, s.section || null, s.status || "active", s.phone || null, s.date_enrolled || null]
      );
      results.success++;
    } catch (err) {
      results.failed++;
      const msg = err.code === "ER_DUP_ENTRY" ? "Duplicate student_no or email" : err.message;
      results.errors.push({ row: i + 1, student_no: s.student_no, error: msg });
    }
  }

  await logAudit(req.user.id, req.user.username, "import", "students", null, { total: students.length, success: results.success, failed: results.failed }, req.ip);
  res.json(results);
});

// GET all students (with optional filters)
app.get("/students", authMiddleware, async (req, res) => {
  try {
    let query = "SELECT * FROM students";
    const params = [];
    const conditions = [];

    if (req.query.status) {
      conditions.push("status = ?");
      params.push(req.query.status);
    }
    if (req.query.course) {
      conditions.push("course = ?");
      params.push(req.query.course);
    }
    if (req.query.year_level) {
      conditions.push("year_level = ?");
      params.push(Number(req.query.year_level));
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC";

    const [rows] = await db.promise().query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
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
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// POST create student (admin + staff only)
app.post("/students", authMiddleware, requireRole("admin", "staff"), async (req, res) => {
  const validationError = validateStudent(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { student_no, name, email, gender, birthdate, course, year_level, section, status, phone, address, nationality, religion, civil_status, guardian_name, guardian_phone, date_enrolled, notes, profile_image } = req.body;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO students (student_no, name, email, gender, birthdate, course, year_level, section, status, phone, address, nationality, religion, civil_status, guardian_name, guardian_phone, date_enrolled, notes, profile_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_no, name, email, gender || null, birthdate || null, course, year_level, section || null, status || "active", phone || null, address || null, nationality || "Filipino", religion || null, civil_status || "Single", guardian_name || null, guardian_phone || null, date_enrolled || null, notes || null, profile_image || null]
    );

    await logAudit(req.user.id, req.user.username, "create", "students", result.insertId, { student_no, name }, req.ip);
    res.status(201).json({ id: result.insertId, student_no, name, email, course, year_level, status: status || "active" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      if (err.message.includes("student_no"))
        return res.status(409).json({ error: "Student number already exists" });
      if (err.message.includes("email"))
        return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Failed to create student" });
  }
});

// PUT update student (admin + staff only)
app.put("/students/:id", authMiddleware, requireRole("admin", "staff"), async (req, res) => {
  const validationError = validateStudent(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { student_no, name, email, gender, birthdate, course, year_level, section, status, phone, address, nationality, religion, civil_status, guardian_name, guardian_phone, date_enrolled, notes, profile_image } = req.body;

  try {
    const [result] = await db.promise().query(
      `UPDATE students SET student_no=?, name=?, email=?, gender=?, birthdate=?, course=?, year_level=?, section=?, status=?, phone=?, address=?, nationality=?, religion=?, civil_status=?, guardian_name=?, guardian_phone=?, date_enrolled=?, notes=?, profile_image=? WHERE id=?`,
      [student_no, name, email, gender || null, birthdate || null, course, year_level, section || null, status || "active", phone || null, address || null, nationality || "Filipino", religion || null, civil_status || "Single", guardian_name || null, guardian_phone || null, date_enrolled || null, notes || null, profile_image || null, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Student not found" });

    await logAudit(req.user.id, req.user.username, "update", "students", Number(req.params.id), { student_no, name }, req.ip);
    res.json({ message: "Student updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      if (err.message.includes("student_no"))
        return res.status(409).json({ error: "Student number already exists" });
      if (err.message.includes("email"))
        return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Failed to update student" });
  }
});

// DELETE student (admin only)
app.delete("/students/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    // Get student info for audit log before deleting
    const [student] = await db.promise().query("SELECT student_no, name FROM students WHERE id = ?", [req.params.id]);

    const [result] = await db.promise().query(
      "DELETE FROM students WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Student not found" });

    await logAudit(req.user.id, req.user.username, "delete", "students", Number(req.params.id), student[0] || null, req.ip);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// ─── Audit Log Routes (admin only) ───────────────────────────────────────────
app.get("/audit-log", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    let query = "SELECT * FROM audit_log";
    const params = [];
    const conditions = [];

    if (req.query.action) {
      conditions.push("action = ?");
      params.push(req.query.action);
    }
    if (req.query.entity) {
      conditions.push("entity = ?");
      params.push(req.query.entity);
    }
    if (req.query.user_id) {
      conditions.push("user_id = ?");
      params.push(Number(req.query.user_id));
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.promise().query(query, params);
    const [[{ total }]] = await db.promise().query(
      `SELECT COUNT(*) as total FROM audit_log${conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : ""}`,
      params.slice(0, -2)
    );

    res.json({ logs: rows, total, limit, offset });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit log" });
  }
});

// ─── User Management Routes (admin only) ─────────────────────────────────────
app.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT id, username, role, full_name, email, is_active, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.put("/users/:id/role", authMiddleware, requireRole("admin"), async (req, res) => {
  const { role } = req.body;
  if (!["admin", "staff", "viewer"].includes(role))
    return res.status(400).json({ error: "Invalid role. Allowed: admin, staff, viewer" });

  // Prevent self-demotion
  if (Number(req.params.id) === req.user.id)
    return res.status(400).json({ error: "Cannot change your own role" });

  try {
    const [result] = await db.promise().query("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });

    await logAudit(req.user.id, req.user.username, "update", "users", Number(req.params.id), { role }, req.ip);
    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

app.put("/users/:id/status", authMiddleware, requireRole("admin"), async (req, res) => {
  const { is_active } = req.body;
  if (typeof is_active !== "boolean")
    return res.status(400).json({ error: "is_active must be true or false" });

  if (Number(req.params.id) === req.user.id)
    return res.status(400).json({ error: "Cannot deactivate your own account" });

  try {
    const [result] = await db.promise().query("UPDATE users SET is_active = ? WHERE id = ?", [is_active, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });

    await logAudit(req.user.id, req.user.username, "update", "users", Number(req.params.id), { is_active }, req.ip);
    res.json({ message: is_active ? "User activated" : "User deactivated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Express server running at http://localhost:${PORT}`);
});
