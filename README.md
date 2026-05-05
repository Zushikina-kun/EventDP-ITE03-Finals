# Final Project — ITE03 + EVENTDP

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
- Full CRUD: Add, view, edit, and delete student records
- Fields: Student No., Full Name, Email Address, Course, Year Level
- Search across all fields in real time
- Sortable columns (click any header to sort asc/desc)
- Pagination (10 records per page)
- Export to CSV
- Analytics Dashboard with:
  - Total students, course count, most enrolled course, average per course
  - Donut chart — students by course
  - Bar chart — students by year level
- Express.js REST API on port 5000, MySQL database via XAMPP

### General
- Dark UI with violet accent color
- Toast notifications (no alert() calls)
- Animated skeleton loading states
- Animated 404 page with auto-redirect countdown
- Fully responsive layout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7, Recharts |
| ML Backend | Python, FastAPI, TensorFlow 2.x, MobileNetV2, Pillow |
| API Backend | Node.js, Express.js, MySQL2, bcryptjs, jsonwebtoken |
| Database | MySQL (via XAMPP) |
| ML Training | TensorFlow Keras, MobileNetV2 transfer learning |

---

## Project Structure

```
├── src/                        # React frontend
│   ├── App.jsx                 # Routes
│   ├── main.jsx                # Entry point + AuthProvider
│   ├── config/api.js           # API base URLs
│   ├── context/AuthContext.jsx # JWT auth state + auto-expiry
│   ├── components/
│   │   ├── Toast.jsx           # Toast notification system
│   │   └── SkeletonRow.jsx     # Loading skeleton for table
│   ├── layout/NavBar.jsx       # Dark sidebar layout
│   └── pages/
│       ├── LandingPage.jsx
│       ├── ClassifyPage.jsx    # AI classifier (upload + webcam)
│       ├── NotFound.jsx        # 404 with countdown
│       ├── auth/
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       └── students/
│           ├── StudentsPage.jsx    # List, search, sort, paginate
│           ├── AddStudentPage.jsx
│           ├── EditStudentPage.jsx
│           └── DashboardPage.jsx   # Charts & stats
│
├── database/                   # Express backend
│   ├── server.js               # REST API routes
│   ├── mysql.js                # MySQL connection pool
│   ├── init.sql                # Database setup script
│   └── .env                    # DB credentials + JWT secret
│
├── ml-server.py                # FastAPI server
├── classify.py                 # Model inference + preprocessing
├── fine_tune_model.py          # Model training script
├── evaluate_model.py           # Test-set evaluation script
├── saved_model/                # Trained .keras model + class labels
├── train/                      # Training images (female/ male/)
├── validation/                 # Validation images (female/ male/)
└── test/                       # Test images (female/ male/)
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
npm install
node server.js
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
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/students` | JWT | Get all students |
| GET | `/students/:id` | JWT | Get one student |
| POST | `/students` | JWT | Add student |
| PUT | `/students/:id` | JWT | Update student |
| DELETE | `/students/:id` | JWT | Delete student |

### FastAPI (port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Model info + class labels |
| POST | `/upload` | Upload image → returns label + confidence |

---

## ML Model Details

- **Architecture:** MobileNetV2 (pretrained on ImageNet) + custom classification head
- **Training data:** ~48,000 images from the CelebA dataset (train/validation split)
- **Input size:** 160×160 RGB
- **Training:** Two-phase — Phase 1 trains head only (base frozen), Phase 2 unfreezes top layers for fine-tuning
- **Validation accuracy:** 89.97%
- **Known limitation:** The CelebA dataset is predominantly Western celebrity faces. The model may misclassify young Asian male faces due to dataset bias — a known issue in gender classification research.

---

## Environment Variables

**Root `.env`** (Vite frontend):
```
VITE_EXPRESS_API=http://localhost:5000
VITE_FASTAPI_URL=http://127.0.0.1:8000
```

**`database/.env`** (Express backend):
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=studentdb
JWT_SECRET=your_secret_here
```
