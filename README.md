# GenderLens AI — Final Project (ITE03 + EVENTDP)

> A production-grade full-stack web application combining two subjects into one project, submitted for the finals of **ITE03** (Information Technology 3 — Web Systems & Technologies) and **EVENTDP** (Event-Driven Programming), under the same instructor.

---

## What This Is

This project fuses two separate subject requirements into a single cohesive web application suitable for academic institutional use:

| Subject | Feature | Description |
|---------|---------|-------------|
| **EVENTDP** | Gender Classification AI | Upload a face image or use your webcam → MobileNetV2 CNN model → returns Male/Female prediction with confidence % |
| **ITE03** | Student Management System | Full CRUD web app for managing student records with RBAC, audit trail, and JWT authentication |

---

## Features

### 🤖 Gender Classification AI (EVENTDP)
- MobileNetV2 transfer learning model trained on ~48,000 face images (CelebA dataset)
- **89.97% validation accuracy** after two-phase training (head training + fine-tuning)
- Upload image via drag-and-drop or file picker
- Live webcam capture mode — take a photo directly from your browser
- Confidence score with progress bar; low-confidence warning (< 60%)
- **Both class probabilities displayed** (e.g. Female: 92.3% | Male: 7.7%)
- **Inference time shown** (e.g. ⚡ 145ms)
- Classification history log (last 5 results with thumbnails)
- FastAPI backend serving the model on port 8000

### 🎓 Student Management System (ITE03)
- **Role-Based Access Control (RBAC):**
  - **Admin** — full CRUD, delete students, manage users, view audit log, bulk import
  - **Staff** — add and edit students, view all records
  - **Viewer** — read-only access to student records
- Register and login with JWT authentication (8-hour token, auto-logout on expiry)
- Session expiry toast notification
- Full CRUD: Add, view, edit, and delete student records
- **Extended student fields:** Student No., Full Name, Email, Gender, Birthdate, Course, Year Level, Section, Status (Active/Inactive/Graduated/Dropped), Phone, Address, Nationality, Religion, Civil Status, Guardian Name, Guardian Phone, Date Enrolled, Notes
- Search across all fields in real time
- Sortable columns (click any header to sort asc/desc)
- Pagination (10 records per page)
- Export to timestamped CSV (includes all fields)
- Bulk import up to 500 students at once (admin only)
- Analytics Dashboard with:
  - Total students, course count, most enrolled course, average per course
  - Donut chart — students by course
  - Bar chart — students by year level
- Express.js REST API on port 5000, MySQL database via XAMPP

### 🔒 Security & Compliance
- Role-based access control (3 tiers: admin, staff, viewer)
- Rate limiting on authentication endpoints (20 requests per 15 minutes per IP)
- Username validation (alphanumeric + underscore, minimum 3 characters)
- Server-side student field validation (email regex, course whitelist, year range 1–4, phone format)
- Parameterized SQL queries (SQL injection protection)
- JWT token auto-expiry with frontend notification
- Password change endpoint (verify current password first)
- Global error handler to prevent stack trace leaks
- **Full audit trail** — every action logged with user, timestamp, IP, and details

### 📋 Audit Trail
Every significant action is recorded in the `audit_log` table:
- Login, register, create, update, delete, import, export
- Who did it (user ID + username)
- What was affected (entity + entity ID)
- Details (JSON — what changed)
- When (timestamp)
- From where (IP address)

### 🎨 Design & UX
- Dark UI with violet accent color (slate-950 background, slate-900 cards, violet-600 accent)
- Toast notifications for all user actions (no alert() calls)
- Animated skeleton loading states
- Animated 404 page with auto-redirect countdown
- Fully responsive layout
- Collapsible sidebar navigation
- Role badge displayed next to username

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 3, React Router v7, Recharts |
| ML Backend | Python, FastAPI, TensorFlow 2.21, MobileNetV2, Pillow |
| API Backend | Node.js, Express.js 5, MySQL2, bcryptjs, jsonwebtoken, express-rate-limit |
| Database | MySQL (via XAMPP) |
| ML Training | TensorFlow Keras, MobileNetV2 transfer learning |
| Dev Tools | ESLint, Nodemon, PostCSS, Autoprefixer |

---

## Project Structure

```
├── src/                        # React frontend
│   ├── App.jsx                 # Routes + session expiry listener
│   ├── main.jsx                # Entry point + AuthProvider
│   ├── config/api.js           # API URLs + COURSES + STATUSES + ROLES
│   ├── context/AuthContext.jsx # JWT auth + role state + hasRole() helper
│   ├── components/
│   │   ├── Toast.jsx           # Toast notification system + useToast hook
│   │   └── SkeletonRow.jsx     # Loading skeleton for table (7 columns)
│   ├── layout/NavBar.jsx       # Dark sidebar + role badge
│   └── pages/
│       ├── LandingPage.jsx     # Hero + About + How It Works + Features + Visual + Developer
│       ├── ClassifyPage.jsx    # AI classifier (upload + webcam + history)
│       ├── NotFound.jsx        # 404 with countdown
│       ├── auth/
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       └── students/
│           ├── StudentsPage.jsx       # List + search + sort + paginate + CSV + status badges
│           ├── AddStudentPage.jsx     # Full form with all fields
│           ├── EditStudentPage.jsx    # Pre-filled form with all fields
│           ├── StudentProfilePage.jsx # Extended profile view
│           └── DashboardPage.jsx      # Charts & stats
│
├── database/                   # Express backend
│   ├── server.js               # REST API + RBAC + audit + validation
│   ├── mysql.js                # MySQL connection pool
│   ├── init.sql                # Full database setup (new installs)
│   ├── migrate.js              # Schema migration (existing databases)
│   ├── .env                    # DB credentials + JWT secret (not committed)
│   └── .env.example            # Template for teammates
│
├── ml-server.py                # FastAPI server (CORS, file validation, cleanup)
├── classify.py                 # Model inference + autocontrast preprocessing
├── fine_tune_model.py          # MobileNetV2 two-phase training script
├── evaluate_model.py           # Test-set evaluation + confusion matrix
├── prepare_selfies.py          # Face detection + CLAHE for custom training data
├── requirements.txt            # Python dependencies
├── saved_model/                # Trained .keras model + class labels
├── train/                      # Training images (female/ male/) — ~48k
├── validation/                 # Validation images (female/ male/) — ~11k
└── test/                       # Test images (female/ male/) — 150
```

---

## How to Run

### Prerequisites
- Node.js 18+
- Python 3.10+
- XAMPP (MySQL only, Apache not needed)
- Python packages: `pip install -r requirements.txt`

### 1. Database Setup

**New install:**
Start MySQL in XAMPP, then run `database/init.sql` in phpMyAdmin (or via CLI):
```bash
mysql -u root -e "source database/init.sql"
```

**Upgrading existing database:**
```bash
cd database
npm run migrate
```

### 2. Express Backend (port 5000)
```bash
cd database
cp .env.example .env        # then edit JWT_SECRET
npm install
npm run dev                  # uses nodemon for auto-restart
```

### 3. FastAPI ML Server (port 8000)
```bash
python -m uvicorn ml-server:app --reload --port 8000
```

### 4. React Frontend (port 5173)
```bash
npm install
npm run dev
```

### Default Admin Account
After running `init.sql` on a fresh database:
- **Username:** `admin`
- **Password:** `admin123`
- **⚠️ Change this password after first login!**

If migrating an existing database, the first registered user is automatically promoted to admin.

---

## API Reference

### Express API (port 5000)

#### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Server health check + uptime |
| POST | `/auth/register` | — | Register new user (rate limited, default role: staff) |
| POST | `/auth/login` | — | Login, returns JWT + role (rate limited) |
| POST | `/auth/change-password` | JWT | Change own password |
| GET | `/auth/me` | JWT | Get current user profile |

#### Students (role-gated)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/students` | JWT | Any | Get all students (supports ?status, ?course, ?year_level filters) |
| GET | `/students/:id` | JWT | Any | Get one student |
| POST | `/students` | JWT | Admin, Staff | Add student (validated) |
| POST | `/students/bulk` | JWT | Admin | Bulk import up to 500 students |
| PUT | `/students/:id` | JWT | Admin, Staff | Update student (validated) |
| DELETE | `/students/:id` | JWT | Admin | Delete student |

#### Admin Only
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/audit-log` | JWT (Admin) | View audit trail (supports ?action, ?entity, ?user_id filters) |
| GET | `/users` | JWT (Admin) | List all users |
| PUT | `/users/:id/role` | JWT (Admin) | Change user role |
| PUT | `/users/:id/status` | JWT (Admin) | Activate/deactivate user |

### FastAPI (port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Model info + input size + class labels |
| POST | `/upload` | Upload image → returns label + confidence |
| POST | `/predict` | Alias for /upload |

---

## Role-Based Access Control

| Role | View Students | Add/Edit | Delete | Manage Users | Audit Log | Bulk Import |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Staff** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

- New registrations default to **Staff** role
- Admins can promote/demote users and deactivate accounts
- Admins cannot demote themselves or deactivate their own account

---

## ML Model Details

- **Architecture:** MobileNetV2 (pretrained on ImageNet) + custom classification head
- **Training data:** ~48,000 images from the CelebA dataset (train/validation split)
- **Input size:** 160×160 RGB
- **Training:** Two-phase — Phase 1 trains head only (base frozen), Phase 2 unfreezes top layers for fine-tuning
- **Validation accuracy:** 89.97%
- **Preprocessing:** Auto-contrast normalization + resize + [0,1] scaling
- **Known limitation:** The CelebA dataset is predominantly Western celebrity faces. The model may misclassify young Asian male faces due to dataset bias — a known issue in gender classification research.

---

## Environment Variables

**Root `.env`** (Vite frontend) — see `.env.example`:
```
VITE_EXPRESS_API=http://localhost:5000
VITE_FASTAPI_URL=http://127.0.0.1:8000
```

**`database/.env`** (Express backend) — see `database/.env.example`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=studentdb
JWT_SECRET=your_secret_here_change_this
```

---

## Database Migration

If upgrading from an older version of the database:
```bash
cd database
npm run migrate
```

This safely adds new columns and tables without losing existing data. It's idempotent — safe to run multiple times.

---

## Design Decisions

- **Dark theme only** — chosen for a modern developer aesthetic that reduces eye strain and looks professional in presentations.
- **RBAC over simple auth** — real institutions need role separation. Viewers can't accidentally modify data, staff can't delete records.
- **Audit trail** — institutional compliance requires knowing who did what and when. Every action is logged.
- **Extended student schema** — real academic systems track more than just name and email. Guardian info, enrollment date, and status are essential.
- **Rate limiting** — prevents brute-force attacks on login without adding complexity like CAPTCHA.
- **Server-side validation mirrors frontend** — defense in depth; the COURSES whitelist and email regex are enforced on both sides.
- **Toast notifications over alert()** — non-blocking, auto-dismissing, and visually consistent with the dark UI.
- **Migration script** — allows upgrading existing databases without data loss, essential for production deployments.

---

## Group Members

| Name | Role |
|------|------|
| Brix A. Directo | Lead Developer |
| Cyrille John M. Rubis | Developer |
| Djaunathan Albert S. Madayag | Developer |
| Jan Alexis G. Roldan | Developer |
| Jibreel Quimson | Developer |

**Course / Section:** BSIT-III

---

## License

This project is an academic submission and is not licensed for commercial use.
