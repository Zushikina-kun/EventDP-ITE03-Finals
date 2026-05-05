# Laboratory 1 — React JS Landing Page Design (ML Project)
**Subject:** ITE03 + EVENTDP (Finals)
**Group Members:**
- Brix A. Directo
- Cyrille John M. Rubis
- Djaunathan Albert S. Madayag
- Jan Alexis G. Roldan
- Jibreel Quimson

**Course / Section:** BSIT-III

---

## Overview

The landing page (`src/pages/LandingPage.jsx`) is a fully static, design-focused page that presents the Gender Classification AI project. It contains all required sections as specified in the laboratory activity.

---

## Section 1: Hero Section

**Purpose:** First impression

**Contains:**
- Project name as a large heading: **"GenderLens AI"**
- One-line tagline: *"Classify gender from any face image — powered by deep learning."*
- Subject badge: "ITE03 + EVENTDP · Finals Project"
- Two call-to-action buttons: "Try the Classifier →" and "Student Management"

```jsx
{/* Hero Section */}
<section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
  {/* Background glow effect */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px]
      bg-violet-600/15 rounded-full blur-3xl" />
  </div>

  <div className="relative max-w-3xl mx-auto">
    <span className="inline-block text-xs font-semibold tracking-widest text-violet-400
      uppercase mb-5 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
      ITE03 + EVENTDP · Finals Project
    </span>

    {/* Project Name */}
    <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight">
      GenderLens AI
    </h1>

    {/* Tagline */}
    <p className="text-xl text-slate-400 mb-10">
      Classify gender from any face image — powered by deep learning.
    </p>

    {/* CTA Buttons */}
    <div className="flex flex-wrap justify-center gap-3">
      <Link to="/classify"
        className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3
          rounded-xl font-semibold transition-all">
        Try the Classifier →
      </Link>
      <Link to="/register"
        className="bg-slate-800 text-slate-200 border border-slate-700
          px-8 py-3 rounded-xl font-semibold transition-all">
        Student Management
      </Link>
    </div>
  </div>
</section>
```

---

## Section 2: About Section

**Purpose:** Explain the project

**Contains:**
- Short paragraph describing the ML model (MobileNetV2 CNN)
- Type of ML: Classification CNN using Transfer Learning
- Two cards — one for EVENTDP (AI) and one for ITE03 (Student Management)
- Subject badges identifying which part belongs to which subject

```jsx
{/* About Section */}
<section className="max-w-5xl mx-auto px-6 pb-20">
  <h2 className="text-3xl font-bold text-white mb-6">What is this project?</h2>

  <div className="grid md:grid-cols-2 gap-6">
    {/* EVENTDP Card */}
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
      <p className="text-slate-400 text-sm leading-relaxed">
        The Gender Classification AI is a deep learning system that predicts
        the gender of a person from a face image. It uses a Convolutional
        Neural Network (CNN) based on MobileNetV2 transfer learning...
      </p>
    </div>

    {/* ITE03 Card */}
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
      <p className="text-slate-400 text-sm leading-relaxed">
        The Student Management System is a full-stack CRUD web application
        for managing student enrollment records secured with JWT authentication...
      </p>
    </div>
  </div>
</section>
```

---

## Section 3: How It Works Section

**Purpose:** Show the process

**Displays a 5-step flow:**
1. **Input** — User uploads a face image or captures via webcam
2. **Transfer** — Image sent as multipart form to FastAPI server
3. **Preprocessing** — Auto-contrast, resize to 160×160, normalize
4. **Inference** — MobileNetV2 runs forward pass, outputs softmax probabilities
5. **Prediction** — Label (Male/Female) and confidence % returned as JSON

Also includes a simplified text flow summary:
> User Uploads Image → FastAPI Receives File → Preprocessing → MobileNetV2 Inference → JSON Result → React Displays Prediction

```jsx
{/* How It Works Section */}
<section className="border-t border-slate-800/60 py-20 px-6">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-3xl font-bold text-white mb-10">How It Works</h2>

    <div className="grid md:grid-cols-5 gap-4">
      {FLOW_STEPS.map((s, i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700
            flex flex-col items-center justify-center mb-4">
            <span className="text-xs font-black text-violet-500">{s.step}</span>
            <span className="text-xs font-bold text-white">{s.label}</span>
          </div>
          <p className="text-xs text-slate-500">{s.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## Section 4: Features Section

**Purpose:** Highlight key features

**Contains 6 feature cards:**

| # | Icon | Feature Title |
|---|------|--------------|
| 1 | 🧠 | MobileNetV2 Transfer Learning |
| 2 | ⚡ | Real-Time Classification |
| 3 | 📷 | Webcam Capture Mode |
| 4 | 🔒 | JWT Authentication |
| 5 | 🎓 | Full Student CRUD |
| 6 | 📊 | Analytics Dashboard |

Each card contains: icon, feature title, and short description.

```jsx
{/* Features Section */}
<section className="border-t border-slate-800/60 py-20 px-6">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-3xl font-bold text-white mb-10">Key Features</h2>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FEATURES.map((f, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-2xl mb-3">{f.icon}</div>
          <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## Section 5: Visual Section

**Purpose:** Provide visual emphasis

**Contains:**
- **AI Classifier mockup** — A browser-frame mockup showing the upload interface with a sample prediction result (👨 Male, 92.45% confidence)
- **Student Management mockup** — A browser-frame mockup showing the student table with sample data
- **Model Workflow Visualization** — A horizontal flow diagram showing: Face Image → Preprocessing → MobileNetV2 → Classification Head → Prediction

Caption: *"AI Classifier — Upload & Predict Interface"* and *"Student Management — CRUD Table Interface"*

---

## Section 6: Developer Section

**Purpose:** Attribution

**Contains:**
- Group Members:
  - **Brix A. Directo**
  - **Cyrille John M. Rubis**
  - **Djaunathan Albert S. Madayag**
  - **Jan Alexis G. Roldan**
  - **Jibreel Quimson**
- Course / Section: **BSIT-III**
- Each member displayed as a card with gradient avatar initial and role
- Short description of the project context

```jsx
{/* Developer Section */}
<section className="border-t border-slate-800/60 py-20 px-6">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-3xl font-bold text-white mb-10">About the Developer</h2>

    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
      <p className="text-slate-400 text-sm leading-relaxed mb-8">
        This project was developed as the final requirement for ITE03 and EVENTDP...
      </p>

      {/* Group member cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { initial: "B", name: "Brix A. Directo",              role: "Lead Developer" },
          { initial: "C", name: "Cyrille John M. Rubis",        role: "Developer" },
          { initial: "D", name: "Djaunathan Albert S. Madayag", role: "Developer" },
        ].map((member) => (
          <div key={member.name}
            className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600
              flex items-center justify-center text-sm font-black text-white">
              {member.initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{member.name}</p>
              <p className="text-xs text-slate-500">{member.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course badge */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
        <span className="text-xs text-slate-500">Course / Section:</span>
        <span className="text-xs font-semibold text-violet-400 bg-violet-500/10
          border border-violet-500/20 px-3 py-1 rounded-full">BSIT-III</span>
      </div>
    </div>
  </div>
</section>
```

---

## Section 7: Footer

**Purpose:** End of page

**Contains:**
- Brand logo ("FP" gradient badge) + project name "GenderLens AI"
- Tech stack pills
- Copyright line: *"© 2026 GenderLens AI — ITE03 + EVENTDP Final Project"*
- Developer credit: *"Brix A. Directo · BSIT-III"*

```jsx
{/* Footer */}
<footer className="border-t border-slate-800 py-10 px-6">
  <div className="max-w-5xl mx-auto">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600
          flex items-center justify-center text-xs font-black">FP</div>
        <span className="font-semibold text-sm text-slate-400">GenderLens AI</span>
      </div>
      {/* Tech stack pills */}
    </div>

    <div className="border-t border-slate-800 mt-6 pt-6 flex items-center justify-between text-xs text-slate-600">
      <p>© 2026 GenderLens AI — ITE03 + EVENTDP Final Project</p>
      <p>Brix A. Directo · BSIT-III</p>
    </div>
  </div>
</footer>
```

---

## Screenshot Instructions

To capture screenshots for submission:
1. Make sure the dev server is running: `npm run dev`
2. Open `http://localhost:5174` in your browser
3. Scroll through the full page and take screenshots of each section:
   - Hero section (top of page)
   - About section
   - How It Works section
   - Features section (6 cards)
   - Visual section (mockups + workflow diagram)
   - Developer section
   - Footer
4. Also take a screenshot of `src/pages/LandingPage.jsx` in the code editor
