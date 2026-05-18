# Finals Laboratory 3 & 4 — Documentation Report
**Subject:** ITE03 + EVENTDP (Finals)
**Group Members:**
- Brix A. Directo
- Cyrille John M. Rubis
- Djaunathan Albert S. Madayag
- Jan Alexis G. Roldan
- Jibreel Quimson

**Course / Section:** BSIT-III

---

## Part 1: Project Overview

### Description

This project is a unified full-stack web application that combines the final requirements of two subjects — **ITE03 (Web Systems & Technologies)** and **EVENTDP (Event-Driven Programming)** — into a single cohesive system, as both subjects share the same instructor.

The project is named **GenderLens AI** and consists of two integrated systems:

### Purpose

**1. Gender Classification AI (EVENTDP)**
The website allows users to upload a face image or capture one using their webcam. The image is sent to a FastAPI backend server, processed by a trained MobileNetV2 deep learning model, and the result — Male or Female with a confidence percentage — is returned and displayed in the React application in real time.

**2. Student Management System (ITE03)**
A full CRUD (Create, Read, Update, Delete) web application for managing student enrollment records. Users must register and log in using JWT authentication before accessing the student management features. Once authenticated, they can add, view, edit, and delete student records stored in a MySQL database.

### Problem It Solves

- The AI component demonstrates how machine learning models can be integrated into web applications to automate image-based classification tasks without requiring the user to have any technical knowledge.
- The student management component solves the problem of manually tracking student enrollment data by providing a structured, searchable, and secure digital system.

---

## Part 2: Technologies Used

### Frontend Technologies

| Technology | Version | Role |
|-----------|---------|------|
| **React** | 19 | JavaScript library for building the user interface using reusable components. Handles all UI rendering, state management, and user interactions. |
| **Vite** | 7.x | Build tool and development server. Provides extremely fast hot module replacement (HMR) during development and optimized production builds. |
| **Tailwind CSS** | 3.x | Utility-first CSS framework used for all styling, layout, and responsive design. Eliminates the need for custom CSS files. |
| **React Router** | v7 | Client-side routing library. Manages navigation between pages without full page reloads, enabling a Single Page Application (SPA) experience. |
| **Recharts** | 2.x | React chart library used in the Dashboard page to render the donut chart (students by course) and bar chart (students by year level). |

### Backend Technologies

| Technology | Role |
|-----------|------|
| **FastAPI (Python)** | REST API server that receives uploaded images via HTTP POST, passes them to the ML model for inference, and returns the classification result as JSON. |
| **Express.js (Node.js)** | REST API server that handles all student CRUD operations and user authentication (register, login). |
| **MySQL** | Relational database that stores user accounts (`users` table) and student records (`students` table), accessed via XAMPP. |
| **bcryptjs** | Node.js library used to hash user passwords with salt before storing them in the database, ensuring passwords are never stored in plain text. |
| **jsonwebtoken (JWT)** | Used to generate signed authentication tokens on login and verify them on protected API routes. Tokens expire after 8 hours. Payload includes user ID, username, and role for RBAC enforcement. |
| **express-rate-limit** | Middleware that limits repeated requests to auth endpoints (20 per 15 minutes per IP), preventing brute-force attacks without requiring CAPTCHA. |

### Machine Learning Framework

| Technology | Role |
|-----------|------|
| **TensorFlow / Keras** | Deep learning framework used to build, train, save, and load the gender classification model. |
| **MobileNetV2** | Pre-trained CNN architecture (trained on ImageNet) used as the base model for transfer learning. Provides powerful feature extraction without training from scratch. |
| **Pillow (PIL)** | Python image processing library used to open, convert, apply auto-contrast, and resize images before passing them to the model. |
| **NumPy** | Used for numerical array operations — converting PIL images to float32 arrays and adding the batch dimension for model inference. |
| **scikit-learn** | Used in `evaluate_model.py` to generate the confusion matrix and classification report for model evaluation. |

### Guide Questions

**Why did you choose these technologies?**

- **React** was chosen because it enables building a dynamic, component-based UI that updates in real time without page reloads — essential for showing classification results instantly after upload.
- **FastAPI** was chosen for the ML backend because it is a modern, high-performance Python framework that integrates naturally with TensorFlow, supports async file uploads, and automatically generates API documentation.
- **Express.js** was chosen for the student API because it is lightweight, fast, and pairs well with MySQL for simple CRUD operations in a Node.js environment.
- **MobileNetV2** was chosen because it is a lightweight but powerful CNN architecture pre-trained on 1.2 million images (ImageNet), making it ideal for transfer learning on a relatively small dataset without requiring a GPU for training.
- **Tailwind CSS** was chosen because it enables rapid UI development with consistent design tokens and responsive utilities without writing custom CSS files.
- **MySQL** was chosen because it is a reliable, widely-used relational database that integrates well with both Express.js (via mysql2) and XAMPP for local development.

**What is the role of each in your system?**

- **React** renders all pages and handles user interactions (file upload, form submission, navigation)
- **FastAPI** receives the image, runs preprocessing, calls the model, and returns the prediction
- **TensorFlow/MobileNetV2** performs the actual gender classification inference
- **Express.js** handles all student CRUD API requests and JWT authentication
- **MySQL** persists all user and student data
- **JWT** secures the student management routes so only authenticated users can access them

---

## Part 3: Website Structure

### Pages and Features

#### Home / Landing Page (`/`)
The entry point of the application. Contains all 7 required sections from Lab 1:
- **Hero** — Project name "GenderLens AI", tagline, and CTA buttons
- **About** — Description of the ML model and the student management system, with subject badges
- **How It Works** — 5-step flow diagram showing the classification process
- **Features** — 8 feature cards covering AI, CRUD, RBAC, audit trail, and bulk operations
- **Visual** — Browser-frame mockups of both interfaces + model workflow diagram
- **Developer** — Group members and course/section info
- **Footer** — Copyright, tech stack, developer credit

#### AI Classifier Page (`/classify`) — EVENTDP
The main feature page for the machine learning component:
- Tab switcher between **Upload Image** and **Use Webcam** modes
- **Upload mode:** Drag-and-drop or click-to-browse, image preview, classify button
- **Webcam mode:** Live camera feed, capture button, snapshot preview, classify button
- **Result panel:** Predicted label (Male/Female), confidence percentage, progress bar, low-confidence warning (< 60%)
- **Both class probabilities:** Shows Female % and Male % side by side so users can see how close the decision was
- **Inference time:** Displays how many milliseconds the model took to process the image
- **History sidebar:** Last 5 classification results with thumbnails

#### Student Management Pages — ITE03
Protected pages (require JWT login), with role-based action visibility:
- **`/students`** — Student list table with real-time search, sortable columns, pagination (10/page), status badges, Export CSV (timestamped), role-gated Edit/Delete buttons
- **`/students/:id`** — Student profile page with extended info (guardian, phone, address, notes, enrollment date)
- **`/students/add`** — Full form with required fields (Student No., Name, Email, Course, Year Level) and optional fields (Profile Photo, Gender, Birthdate, Nationality, Religion, Civil Status, Section, Status, Phone, Address, Guardian, Notes, Date Enrolled). Only visible to Admin and Staff roles.
- **`/students/edit/:id`** — Pre-filled form with all fields. Only visible to Admin and Staff roles.
- **`/students/dashboard`** — Analytics with 4 stat cards, donut chart (by course), bar chart (by year level)

#### Authentication Pages — ITE03
- **`/login`** — Username and password login form, returns JWT + role on success
- **`/register`** — Registration form with password confirmation (new users get Staff role)

#### 404 Not Found Page
Animated page for invalid routes with a 5-second countdown auto-redirect to home.

---

## Part 4: Machine Learning Model

### Model Type
The model is a **Convolutional Neural Network (CNN)** using **MobileNetV2 Transfer Learning**.

Transfer learning is a technique where a model pre-trained on a large dataset (ImageNet — 1.2 million images, 1,000 classes) is adapted for a new, more specific task. Instead of training from scratch, the pre-trained weights are used as a starting point, which significantly reduces training time and data requirements.

### Architecture

```
Input (160×160×3 RGB image)
    ↓
MobileNetV2 Base (pre-trained on ImageNet, 154 layers)
    ↓
GlobalAveragePooling2D
    ↓
BatchNormalization
    ↓
Dense(256, activation='relu')
    ↓
Dropout(0.4)
    ↓
Dense(64, activation='relu')
    ↓
Dropout(0.2)
    ↓
Dense(2, activation='softmax')  ← Output: [P(Female), P(Male)]
```

### What the Model Predicts
The model classifies a face image as either **Male** or **Female**, and returns:
- **Label:** "Male" or "Female"
- **Confidence:** A percentage (0–100%) indicating how certain the model is

### Training Process

**Phase 1 — Head Training (base frozen):**
The MobileNetV2 base layers are frozen (weights not updated). Only the custom classification head is trained. This allows the head to learn the new task without disrupting the pre-trained ImageNet features.
- Learning rate: 0.001
- Max epochs: 15 (with EarlyStopping, patience=5)
- Optimizer: Adam

**Phase 2 — Fine-Tuning (top layers unfrozen):**
The top 54 layers of MobileNetV2 are unfrozen and trained together with the head at a lower learning rate. This allows the model to fine-tune high-level features for the specific task.
- Learning rate: 0.0001
- Max epochs: 30 (with EarlyStopping, patience=7)
- ReduceLROnPlateau: reduces LR by 50% if val_loss doesn't improve for 3 epochs

### Final Results
- **Validation Accuracy: 89.97%**
- **Validation Loss: 0.2813**
- Best checkpoint saved during Phase 2 fine-tuning

---

## Part 5: Dataset / Images Used

### Source
The dataset used is the **CelebA (Large-scale CelebFaces Attributes) dataset** — a publicly available large-scale face attributes dataset containing over 200,000 celebrity face images with 40 attribute annotations per image. The `Male` attribute was used as the classification label.

### Number of Images / Data Samples

| Split | Female | Male | Total |
|-------|--------|------|-------|
| **Training** | 23,743 | 24,266 | **48,009** |
| **Validation** | 5,841 | 5,808 | **11,649** |
| **Test (held-out)** | 75 | 75 | **150** |
| **Grand Total** | 29,659 | 30,149 | **59,808** |

### Type of Data
JPEG face images of celebrities, organized into subfolders by gender label:
```
train/
  female/   ← 23,743 images
  male/     ← 24,266 images
validation/
  female/   ← 5,841 images
  male/     ← 5,808 images
test/
  female/   ← 75 images
  male/     ← 75 images
```

### Data Preparation and Preprocessing

**Training pipeline (`fine_tune_model.py`):**
1. **Loading** — Images loaded using `tf.keras.utils.image_dataset_from_directory()` which automatically assigns labels based on subfolder names
2. **Resizing** — All images resized to **160×160 pixels** to match MobileNetV2's expected input
3. **Normalization** — Pixel values scaled from [0, 255] to [0.0, 1.0] using `tf.keras.layers.Rescaling(1/255)`
4. **Caching** — Dataset cached in RAM after first epoch for faster subsequent epochs
5. **Prefetching** — `tf.data.AUTOTUNE` prefetches batches in parallel to maximize CPU utilization

**Inference pipeline (`classify.py`):**
1. **Open & convert** — Image opened with Pillow and converted to RGB (handles RGBA/grayscale webcam captures)
2. **Auto-contrast** — `PIL.ImageOps.autocontrast(cutoff=1)` stretches the pixel histogram to fill 0–255, reducing the lighting/color-temperature gap between webcam captures and studio-lit training images
3. **Resize** — Resized to 160×160 using LANCZOS high-quality resampling
4. **Normalize** — Pixel values divided by 255.0
5. **Batch dimension** — `np.expand_dims(arr, axis=0)` adds the batch dimension required by the model

### Data Augmentation

Augmentation was applied **only to the training set** to artificially increase data diversity and reduce overfitting. The following augmentations were applied randomly on-the-fly during training using Keras preprocessing layers:

| Augmentation Layer | Parameter | Purpose |
|-------------------|-----------|---------|
| `RandomFlip("horizontal")` | 50% chance | Simulates left/right face orientation |
| `RandomRotation` | ±12% (≈±43°) | Simulates slight head tilt |
| `RandomZoom` | ±15% | Simulates different distances from camera |
| `RandomTranslation` | ±10% H and V | Simulates off-center face positioning |
| `RandomBrightness` | ±15% | Simulates different lighting conditions |
| `RandomContrast` | ±15% | Simulates different camera exposure settings |

Augmentation was implemented inside the `tf.data` pipeline using `dataset.map()`, so augmented images are generated on-the-fly during training rather than pre-generating and storing augmented copies. This saves disk space and ensures each epoch sees slightly different variations of the training images.

### Known Limitation

The CelebA dataset is predominantly composed of Western celebrity faces. As a result, the model may misclassify faces from underrepresented demographics — particularly young Asian males with softer facial features — due to dataset bias. This is a known issue in gender classification research. A more demographically diverse dataset such as **UTKFace** or **FairFace** would be needed to fully address this limitation.
