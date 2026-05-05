# Project Summary — Final Project (ITE03 + EVENTDP)

> Paste this file into a new Kiro chat to restore full context.

---

## What this is

A unified React web app combining two school subjects into one final project.
Both subjects are under the same instructor who merged the requirements.

- **EVENTDP** → Gender Classification AI (ML/event-driven)
- **ITE03** → Student Management System (full-stack web CRUD)

---

## Two features in one app

### 1. Gender Classification AI (EVENTDP)
- Upload a face image OR use webcam → FastAPI → MobileNetV2 model → Male/Female + confidence %
- Drag & drop or click to upload, image preview, confidence bar
- Webcam mode: live video, capture frame, classify
- Low-confidence warning (< 60%) with amber styling
- Classification history log (last 5 results with thumbnails)
- FastAPI runs on port 8000, model: `saved_model/gender_classification_model.keras`
- Model: MobileNetV2 transfer learning, 89.97% val accuracy, trained on ~48k CelebA images
- Known limitation: CelebA dataset bias toward Western faces — young Asian males may misclassify

### 2. Student Management System (ITE03)
- Full CRUD for student records with JWT authentication (8h token, auto-logout)
- Fields: Student No., Full Name, Email, Course, Year Level
- Register/Login → protected routes → view/add/edit/delete students
- Real-time search across all fields
- Sortable columns (click header to toggle asc/desc)
- Pagination (10 per page with smart ellipsis)
- Export to CSV (current filtered+sorted view)
- Analytics Dashboard: stat cards + donut chart (by course) + bar chart (by year level)
- Express runs on port 5000, MySQL database: `studentdb`

---

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS + React Router v7 + Recharts
- **ML Backend:** FastAPI + TensorFlow 2.x + MobileNetV2 + Pillow (`ml-server.py`, `classify.py`)
- **SMS Backend:** Express.js + MySQL2 + bcryptjs + JWT (`database/server.js`)
- **Database:** MySQL via XAMPP (tables: `users`, `students`)

---

## Design

- Dark theme: `slate-950` background, `slate-900` cards, `violet-600` accent
- Dark sidebar nav with SVG icons, gradient logo mark, user avatar initial
- Toast notifications (no alert() calls)
- Animated skeleton loading rows for the students table
- Animated 404 page with 5-second countdown auto-redirect
- Responsive layout

---

## Folder Structure

```
src/
  App.jsx                          # routes + ProtectedRoute
  main.jsx                         # entry point + AuthProvider
  config/api.js                    # API URLs + COURSES list
  context/AuthContext.jsx          # JWT auth state + auto-expiry timer
  components/
    Toast.jsx                      # toast notifications + useToast hook
    SkeletonRow.jsx                # animated skeleton for table loading
  layout/NavBar.jsx                # dark sidebar layout
  pages/
    LandingPage.jsx                # hero + about section + feature cards
    ClassifyPage.jsx               # ML classifier (upload + webcam tabs + history)
    NotFound.jsx                   # 404 with bounce animation + countdown
    auth/
      LoginPage.jsx
      RegisterPage.jsx
    students/
      StudentsPage.jsx             # list + search + sort + paginate + CSV export
      AddStudentPage.jsx
      EditStudentPage.jsx
      DashboardPage.jsx            # stat cards + recharts pie + bar

database/
  server.js                        # Express REST API
  mysql.js                         # MySQL pool (reads .env)
  init.sql                         # run once to create DB + tables
  .env                             # DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, PORT

.env                               # VITE_EXPRESS_API, VITE_FASTAPI_URL
.env.example                       # safe template to commit
ml-server.py                       # FastAPI server + /health endpoint + stale upload cleanup
classify.py                        # loads model, autocontrast preprocessing, classify_image()
fine_tune_model.py                 # MobileNetV2 two-phase training script
evaluate_model.py                  # runs against test/ for true accuracy
requirements.txt                   # Python deps
saved_model/
  gender_classification_model.keras
  class_names.json                 # {"Female": 0, "Male": 1}
  best_checkpoint.keras
train/female/, train/male/         # ~48k training images
validation/female/, validation/male/ # ~11k validation images
test/female/, test/male/           # 150 held-out test images
```

---

## How to Run

1. **XAMPP** → Start MySQL only (Apache not needed)
2. **Database:** `mysql -u root -e "source database/init.sql"` (or run in phpMyAdmin)
3. **Express:** `cd database` → `node server.js` (port 5000)
4. **FastAPI:** `python -m uvicorn ml-server:app --reload --port 8000`
5. **React:** `npm run dev` (port 5173)

---

## Key Decisions Made

- `database/.env` holds all secrets — `JWT_SECRET` is required or server won't start
- `.env` at root holds Vite API URLs (`VITE_EXPRESS_API`, `VITE_FASTAPI_URL`)
- Both `.env` files are in `.gitignore`
- `student_no` is UNIQUE, `email` is UNIQUE in the students table
- JWT tokens auto-expire and auto-logout on the frontend
- `evaluate_model.py` runs against `test/` (true accuracy), not `validation/`
- ESLint scoped to `src/**` only — ignores node_modules, tf_env, venv
- Toast notifications replace all `alert()` calls
- `classify.py` loads the model once at startup, not per request
- `classify.py` applies `ImageOps.autocontrast` before inference to reduce webcam vs training data gap
- `ml-server.py` has 5MB file size limit, validates file extensions, cleans stale uploads on startup
- `ml-server.py` has `/health` endpoint returning model metadata
- `fine_tune_model.py` uses MobileNetV2 transfer learning (Phase 1: head only, Phase 2: unfreeze top layers)
- Class labels loaded from `saved_model/class_names.json` (generated by training script)
- IMG_SIZE derived dynamically from model input shape (works for both 150 and 160)

---

## Express API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Register new user |
| POST | /auth/login | No | Login, returns JWT |
| GET | /students | JWT | Get all students |
| GET | /students/:id | JWT | Get one student |
| POST | /students | JWT | Add student |
| PUT | /students/:id | JWT | Update student |
| DELETE | /students/:id | JWT | Delete student |

## FastAPI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| GET | /health | Model info + input size + class labels |
| POST | /upload | Upload image → returns label + confidence |

---

## ML Model Details

- Architecture: MobileNetV2 (ImageNet pretrained) + GlobalAveragePooling + Dense head
- Input: 160×160 RGB, normalized to [0,1]
- Phase 1: Train head only (base frozen), LR=1e-3, EarlyStopping patience=5
- Phase 2: Unfreeze top 54 layers, LR=1e-4, ReduceLROnPlateau, EarlyStopping patience=7
- Best val_accuracy: 89.97% (val_loss: 0.2813)
- Saved to: `saved_model/gender_classification_model.keras`
