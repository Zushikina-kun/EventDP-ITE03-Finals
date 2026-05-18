# Project Summary — GenderLens AI (ITE03 + EVENTDP Finals)

> Paste this file into a new Kiro chat to restore full context.

---

## What this is

A production-grade React web app combining two school subjects into one final project.
Both subjects are under the same instructor who merged the requirements.

- **EVENTDP** → Gender Classification AI (ML/event-driven)
- **ITE03** → Student Management System (full-stack web CRUD with RBAC)

---

## Two features in one app

### 1. Gender Classification AI (EVENTDP)
- Upload a face image OR use webcam → FastAPI → MobileNetV2 model → Male/Female + confidence %
- Drag & drop or click to upload, image preview, confidence bar
- Webcam mode: live video, capture frame, classify
- Low-confidence warning (< 60%) with amber styling
- Classification history log (last 5 results with thumbnails)
- Object URL memory management (revoked on reset/re-pick)
- FastAPI runs on port 8000, model: `saved_model/gender_classification_model.keras`
- Model: MobileNetV2 transfer learning, 89.97% val accuracy, trained on ~48k CelebA images

### 2. Student Management System (ITE03)
- **RBAC:** Admin (full access), Staff (add/edit), Viewer (read-only)
- Full CRUD with extended fields: student_no, name, email, course, year_level, section, status, phone, address, guardian_name, guardian_phone, date_enrolled, notes
- Student statuses: active, inactive, graduated, dropped (with color-coded badges)
- JWT authentication (8h token, auto-logout with toast notification)
- Real-time search, sortable columns, pagination (10/page)
- Export to timestamped CSV with all fields
- Bulk import up to 500 students (admin only)
- Analytics Dashboard: stat cards + donut chart (by course) + bar chart (by year level)
- Server-side query filters (?status, ?course, ?year_level)
- Express runs on port 5000, MySQL database: `studentdb`

### 3. Security & Compliance
- Rate limiting on auth endpoints (20 req / 15 min per IP)
- Username validation (alphanumeric + underscore, min 3 chars)
- Server-side student field validation (email, course whitelist, year, phone format)
- Parameterized SQL queries (injection protection)
- Global error handler (prevents stack trace leaks)
- Password change endpoint (verifies current password)
- **Full audit trail** — every action logged with user, timestamp, IP, details

### 4. User Management (Admin only)
- List all users with roles and status
- Change user roles (admin/staff/viewer)
- Activate/deactivate user accounts
- Cannot self-demote or self-deactivate

---

## Tech Stack

- **Frontend:** React 19 + Vite 7 + Tailwind CSS 3 + React Router v7 + Recharts
- **ML Backend:** FastAPI + TensorFlow 2.21 + MobileNetV2 + Pillow
- **SMS Backend:** Express.js 5 + MySQL2 + bcryptjs + JWT + express-rate-limit
- **Database:** MySQL via XAMPP (tables: `users`, `students`, `audit_log`)
- **Dev Tools:** ESLint, Nodemon, PostCSS, Autoprefixer

---

## Folder Structure

```
src/
  App.jsx                          # routes + ProtectedRoute + session expiry listener
  main.jsx                         # entry point + AuthProvider
  config/api.js                    # API URLs + COURSES + STUDENT_STATUSES + USER_ROLES
  context/AuthContext.jsx          # JWT auth + role state + hasRole() helper
  components/
    Toast.jsx                      # toast notifications + useToast hook
    SkeletonRow.jsx                # animated skeleton (7 columns)
  layout/NavBar.jsx                # dark sidebar + role badge in header
  pages/
    LandingPage.jsx                # hero + about + how it works + 8 features + visual + developer
    ClassifyPage.jsx               # ML classifier (upload + webcam tabs + history)
    NotFound.jsx                   # 404 with bounce animation + countdown
    auth/
      LoginPage.jsx                # passes role to AuthContext
      RegisterPage.jsx
    students/
      StudentsPage.jsx             # list + search + sort + paginate + CSV + status badges + RBAC buttons
      AddStudentPage.jsx           # full form with required + optional sections
      EditStudentPage.jsx          # pre-filled form with all fields
      StudentProfilePage.jsx       # extended profile + RBAC action buttons
      DashboardPage.jsx            # stat cards + recharts pie + bar

database/
  server.js                        # Express REST API + RBAC + audit + validation + bulk import
  mysql.js                         # MySQL pool
  init.sql                         # full schema + seed data (fresh installs)
  migrate.js                       # safe schema migration (existing databases)
  .env                             # secrets (not committed)
  .env.example                     # template

.env / .env.example                # Vite API URLs
ml-server.py                       # FastAPI server
classify.py                        # model inference
fine_tune_model.py                 # training script
evaluate_model.py                  # test evaluation
prepare_selfies.py                 # selfie preprocessing
requirements.txt                   # Python deps
saved_model/                       # model + class_names.json
```

---

## How to Run

1. **XAMPP** → Start MySQL only
2. **Database (fresh):** run `database/init.sql` in phpMyAdmin
3. **Database (upgrade):** `cd database && npm run migrate`
4. **Express:** `cd database` → `cp .env.example .env` → edit JWT_SECRET → `npm run dev`
5. **FastAPI:** `python -m uvicorn ml-server:app --reload --port 8000`
6. **React:** `npm run dev` (port 5173)
7. **Default admin:** username `admin`, password `admin123` (change after first login)

---

## Key Decisions

- RBAC with 3 roles: admin, staff, viewer — enforced on both backend (middleware) and frontend (hasRole)
- Audit trail logs every action to `audit_log` table with JSON details
- Extended student schema: section, status, phone, address, guardian, date_enrolled, notes
- Migration script (`migrate.js`) safely upgrades existing databases — idempotent
- First registered user auto-promoted to admin during migration
- Delete restricted to admin only (both frontend hidden + backend 403)
- Bulk import validates each row individually, reports per-row errors
- CSV export includes all fields + timestamp in filename
- Session expiry dispatches custom DOM event for toast notification
- Object URLs revoked to prevent memory leaks
- Rate limiting on auth (20 req/15min)
- Server-side validation mirrors frontend COURSES/STATUSES lists

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Server health + uptime |
| POST | /auth/register | No | Register (rate limited, default: staff) |
| POST | /auth/login | No | Login → JWT + role (rate limited) |
| POST | /auth/change-password | JWT | Change own password |
| GET | /auth/me | JWT | Get current user profile |

### Students (role-gated)
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /students | Any | List all (supports filters) |
| GET | /students/:id | Any | Get one |
| POST | /students | Admin, Staff | Create (validated) |
| POST | /students/bulk | Admin | Bulk import ≤500 |
| PUT | /students/:id | Admin, Staff | Update (validated) |
| DELETE | /students/:id | Admin | Delete |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /audit-log | View audit trail (filterable) |
| GET | /users | List all users |
| PUT | /users/:id/role | Change role |
| PUT | /users/:id/status | Activate/deactivate |

### FastAPI (port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| GET | /health | Model metadata |
| POST | /upload | Classify image |
| POST | /predict | Alias for /upload |
