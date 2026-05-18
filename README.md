# GenderLens AI — Final Project (ITE03 + EVENTDP)

> A unified full-stack web application combining two subjects into one project, submitted for the finals of **ITE03** (Information Technology 3 — Web Systems & Technologies) and **EVENTDP** (Event-Driven Programming), under the same instructor.

---

## What This Is

This project fuses two separate subject requirements into a single cohesive web application:

| Subject | Feature | Description |
|---------|---------|-------------|
| **EVENTDP** | Gender Classification AI | Upload a face image or use your webcam → MobileNetV2 CNN model → returns Male/Female prediction with confidence % |
| **ITE03** | Student Management System | Full CRUD web app for managing student records, secured with JWT authentication |

---

## Features

### 🤖 Gender Classification AI (EVENTDP)
- MobileNetV2 transfer learning model trained on ~48,000 face images (CelebA dataset)
- **89.97% validation accuracy** after two-phase training (head training + fine-tuning)
- Upload image via drag-and-drop or file picker
- Live webcam capture mode — take a photo directly from your browser
- Confidence score with progress bar; low-confidence warning (< 60%)
- Classification history log (last 5 results with thumbnails)
- FastAPI backend serving the model on port 8000

### 🎓 Student Management System (ITE03)
- Register and login with JWT authentication (8-hour token, auto-logout on expiry)
- Session expiry toast notification — users are informed when their session ends
- Full CRUD: Add, view, edit, and delete student records
- Fields: Student No., Full Name, Email Address, Course, Year Level
- Server-side input validation (email format, course whitelist, year level range)
- Search across all fields in real time
- Sortable columns (click any header to sort asc/desc)
- Pagination (10 records per page)
- Export to CSV (with success confirmation toast)
- Analytics Dashboard with:
  - Total students, course count, most enrolled course, average per course
  - Donut chart — students by course
  - Bar chart — students by year level
- Express.js REST API on port 5000, MySQL database via XAMPP

### 🔒 Security
- Rate limiting on authentication endpoints (20 requests per 15 minutes per IP)
- Username validation (alphanumeric + underscore, minimum 3 characters)
- Server-side student field validation (email regex, course whitelist, year range 1–4)
- Parameterized SQL queries (SQL injection protection)
- JWT token auto-expiry with frontend notification
- Global error handler to prevent stack trace leaks

### 🎨 Design & UX
- Dark UI with violet accent color (slate-950 background, slate-900 cards, violet-600 accent)
- Toast notifications for all user actions (no alert() calls)
- Animated skeleton loading states
- Animated 404 page with auto-redirect countdown
- Fully responsive layout
- Collapsible sidebar navigation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 3, React Router v7, Recharts |
| ML Backend | Python, FastAPI, TensorFlow 2.15, MobileNetV2, Pillow |
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
│   ├── config/api.js           # API base URLs + COURSES list
│   ├── context/AuthContext.jsx # JWT auth state + auto-expiry + event dispatch
│   ├── components/
│   │   ├── Toast.jsx           # Toast notification system + useToast hook
│   │   └── SkeletonRow.jsx     # Loading skeleton for table
│   ├── layout/NavBar.jsx       # Dark sidebar layout
│   └── pages/
│       ├── LandingPage.jsx     # Hero + About + How It Works + Features + Visual + Developer
│       ├── ClassifyPage.jsx    # AI classifier (upload + webcam + history)
│       ├── NotFound.jsx        # 404 with countdown
│       ├── auth/
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       └── students/
│           ├── StudentsPage.jsx       # List, search, sort, paginate, CSV export
│           ├── AddStudentPage.jsx
│           ├── EditStudentPage.jsx
│           ├── StudentProfilePage.jsx # Individual student view
│           └── DashboardPage.jsx      # Charts & stats
│
├── database/                   # Express backend
│   ├── server.js               # REST API + rate limiting + validation + error handler
│   ├── mysql.js                # MySQL connection pool
│   ├── init.sql                # Database setup script + seed data
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
Start MySQL in XAMPP, then run `database/init.sql` in phpMyAdmin (or via CLI):
```bash
mysql -u root -e "source database/init.sql"
```

### 2. Express Backend (port 5000)
```bash
cd database
cp .env.example .env        # then edit JWT_SECRET
npm install
npm run dev                  # uses nodemon for auto-restart
# or: npm start             # for production (no auto-restart)
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

---

## API Reference

### Express API (port 5000)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Server health check + uptime |
| POST | `/auth/register` | — | Register new user (rate limited) |
| POST | `/auth/login` | — | Login, returns JWT (rate limited) |
| GET | `/students` | JWT | Get all students |
| GET | `/students/:id` | JWT | Get one student |
| POST | `/students` | JWT | Add student (validated) |
| PUT | `/students/:id` | JWT | Update student (validated) |
| DELETE | `/students/:id` | JWT | Delete student |

### FastAPI (port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Model info + input size + class labels |
| POST | `/upload` | Upload image → returns label + confidence |
| POST | `/predict` | Alias for /upload |

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

## Design Decisions

- **Dark theme only** — chosen for a modern developer aesthetic that reduces eye strain and looks professional in presentations.
- **No external auth providers** — JWT with bcrypt keeps the project self-contained and easy to demo without third-party accounts.
- **Rate limiting** — prevents brute-force attacks on login without adding complexity like CAPTCHA.
- **Server-side validation mirrors frontend** — defense in depth; the COURSES whitelist and email regex are enforced on both sides.
- **Toast notifications over alert()** — non-blocking, auto-dismissing, and visually consistent with the dark UI.
- **Object URL cleanup** — blob URLs are revoked on component reset/re-pick to prevent memory leaks.
- **Session expiry event** — uses a custom DOM event so the toast system works regardless of which page the user is on.

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
