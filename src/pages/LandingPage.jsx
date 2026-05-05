import { Link } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: "🧠",
    title: "MobileNetV2 Transfer Learning",
    desc: "Built on Google's MobileNetV2 architecture pre-trained on ImageNet, fine-tuned on 48,000+ face images for gender classification with 90.13% validation accuracy.",
  },
  {
    icon: "⚡",
    title: "Real-Time Classification",
    desc: "Upload any face image and receive an instant Male or Female prediction with a confidence percentage — all processed server-side through a FastAPI endpoint.",
  },
  {
    icon: "📷",
    title: "Webcam Capture Mode",
    desc: "No image file? No problem. Use your device's webcam to capture a live photo directly in the browser and classify it on the spot.",
  },
  {
    icon: "🔒",
    title: "JWT Authentication",
    desc: "The Student Management System is secured with JSON Web Tokens. Users must register and log in before accessing any student records.",
  },
  {
    icon: "🎓",
    title: "Full Student CRUD",
    desc: "Create, read, update, and delete student records with fields for Student No., Full Name, Email, Course, and Year Level — all stored in a MySQL database.",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Visualize enrollment data with an interactive dashboard featuring stat cards, a donut chart by course, and a bar chart by year level powered by Recharts.",
  },
];

const TECH = [
  "React 19", "Vite", "Tailwind CSS", "React Router",
  "FastAPI", "TensorFlow", "MobileNetV2",
  "Express.js", "MySQL", "JWT Auth", "Recharts", "Python",
];

const FLOW_STEPS = [
  { step: "01", label: "Input", desc: "User uploads a face image or captures one via webcam in the React app" },
  { step: "02", label: "Transfer", desc: "The image is sent as a multipart form request to the FastAPI server on port 8000" },
  { step: "03", label: "Preprocessing", desc: "The server applies auto-contrast normalization and resizes the image to 160×160 px" },
  { step: "04", label: "Inference", desc: "MobileNetV2 model runs a forward pass and outputs a softmax probability for each class" },
  { step: "05", label: "Prediction", desc: "The predicted label (Male / Female) and confidence % are returned as JSON to the React app" },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-full bg-slate-950 text-white">

      {/* ── 1. HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-violet-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-widest text-violet-400 uppercase mb-5 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
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

          {/* CTA buttons — design only per Lab 1 rules, but functional here */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/classify"
              className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-violet-900/40 hover:-translate-y-0.5"
            >
              Try the Classifier →
            </Link>
            <Link
              to="/register"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-8 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
            >
              Student Management
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. ABOUT SECTION ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <SectionLabel>About</SectionLabel>
        <h2 className="text-3xl font-bold text-white mb-6">What is this project?</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-base">🤖</div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">EVENTDP Component</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              The <span className="text-white font-medium">Gender Classification AI</span> is a deep learning system
              that predicts the gender of a person from a face image. It uses a
              <span className="text-violet-400 font-medium"> Convolutional Neural Network (CNN)</span> based on
              MobileNetV2 transfer learning — a technique where a model pre-trained on 1.2 million images
              (ImageNet) is adapted for a new classification task.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              The model was trained on approximately <span className="text-white font-medium">48,000 face images</span> from
              the CelebA dataset using two-phase training, achieving
              <span className="text-violet-400 font-medium"> 90.13% validation accuracy</span>.
              It is served through a FastAPI Python backend and integrated into the React frontend.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-base">🎓</div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">ITE03 Component</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              The <span className="text-white font-medium">Student Management System</span> is a full-stack CRUD
              web application for managing student enrollment records. It is secured with
              <span className="text-indigo-400 font-medium"> JWT (JSON Web Token) authentication</span> —
              users must register and log in before accessing any student data.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Built with React on the frontend, Express.js on the backend, and MySQL as the database.
              Features include real-time search, sortable columns, pagination, CSV export, and an
              analytics dashboard with enrollment charts.
            </p>
          </div>
        </div>

        {/* Subject badges */}
        <div className="flex flex-wrap gap-3 mt-5">
          <div className="flex items-center gap-2 bg-violet-600/10 border border-violet-500/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-xs font-semibold text-violet-400">EVENTDP — Event-Driven Programming</span>
            <span className="text-xs text-slate-600">· CNN Image Classification</span>
          </div>
          <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-xs font-semibold text-indigo-400">ITE03 — Web Systems &amp; Technologies</span>
            <span className="text-xs text-slate-600">· Full-Stack CRUD App</span>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS SECTION ─────────────────────────────────────────── */}
      <section className="border-t border-slate-800/60 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Process</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-slate-500 text-sm mb-10 max-w-xl">
            From image upload to prediction — here is the full flow of the classification system.
          </p>

          {/* Flow steps */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            <div className="grid md:grid-cols-5 gap-4">
              {FLOW_STEPS.map((s, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  {/* Step circle */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center mb-4 relative z-10">
                    <span className="text-xs font-black text-violet-500">{s.step}</span>
                    <span className="text-xs font-bold text-white mt-0.5">{s.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simple text flow for mobile / clarity */}
          <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs text-slate-500 text-center uppercase tracking-widest mb-3">Summary Flow</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold">
              {["User Uploads Image", "→", "FastAPI Receives File", "→", "Preprocessing", "→", "MobileNetV2 Inference", "→", "JSON Result", "→", "React Displays Prediction"].map((item, i) => (
                <span key={i} className={item === "→" ? "text-slate-700" : "text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700"}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURES SECTION ─────────────────────────────────────────────── */}
      <section className="border-t border-slate-800/60 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-3">Key Features</h2>
          <p className="text-slate-500 text-sm mb-10 max-w-xl">
            Everything built into this project — from the AI classifier to the student management system.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. VISUAL SECTION ───────────────────────────────────────────────── */}
      <section className="border-t border-slate-800/60 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Visual</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-3">System Interface Preview</h2>
          <p className="text-slate-500 text-sm mb-10 max-w-xl">
            A visual overview of the two main interfaces in the application.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {/* AI Classifier mockup */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Fake browser bar */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-slate-700 rounded-md h-5 mx-2 flex items-center px-2">
                  <span className="text-xs text-slate-500">localhost:5174/classify</span>
                </div>
              </div>
              {/* Mockup content */}
              <div className="p-6">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Gender Classifier AI</p>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center mb-4">
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-xs text-slate-500">Click or drag &amp; drop an image here</p>
                  <p className="text-xs text-slate-700 mt-1">JPG, PNG, WEBP up to 5MB</p>
                </div>
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">Prediction</p>
                  <p className="text-2xl font-black text-white">👨 Male</p>
                  <div className="mt-2 bg-slate-800 rounded-full h-2">
                    <div className="bg-violet-500 h-2 rounded-full w-[92%]" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">92.45% confidence</p>
                </div>
              </div>
              <p className="text-center text-xs text-slate-600 pb-4">AI Classifier — Upload &amp; Predict Interface</p>
            </div>

            {/* Student Management mockup */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Fake browser bar */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-slate-700 rounded-md h-5 mx-2 flex items-center px-2">
                  <span className="text-xs text-slate-500">localhost:5174/students</span>
                </div>
              </div>
              {/* Mockup content */}
              <div className="p-6">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Student Management System</p>
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                  <div className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-slate-700">
                    {["Student No.", "Name", "Course", "Actions"].map((h) => (
                      <span key={h} className="text-xs font-semibold text-slate-500">{h}</span>
                    ))}
                  </div>
                  {[
                    ["2024-0001", "Juan Dela Cruz", "BSIT", ""],
                    ["2024-0002", "Maria Santos", "BSCS", ""],
                    ["2024-0003", "Pedro Reyes", "BSIT", ""],
                  ].map(([no, name, course], i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-slate-700/50">
                      <span className="text-xs font-mono text-slate-500">{no}</span>
                      <span className="text-xs text-slate-300">{name}</span>
                      <span className="text-xs">
                        <span className="bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full text-xs">{course}</span>
                      </span>
                      <div className="flex gap-1">
                        <span className="text-xs text-violet-400">Edit</span>
                        <span className="text-xs text-red-400 ml-1">Del</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="flex-1 bg-slate-800 border border-slate-700 rounded-lg h-8 flex items-center px-3">
                    <span className="text-xs text-slate-600">Search students…</span>
                  </div>
                  <div className="bg-violet-600 rounded-lg px-3 h-8 flex items-center">
                    <span className="text-xs text-white font-semibold">+ Add</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-600 pb-4">Student Management — CRUD Table Interface</p>
            </div>
          </div>

          {/* Model workflow visualization */}
          <div className="mt-5 bg-slate-900 border border-slate-800 rounded-2xl p-7">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-5 text-center">Model Workflow Visualization</p>
            <div className="flex flex-wrap items-stretch justify-center gap-3">
              {[
                { label: "Face Image", sub: "JPG / PNG / WEBP", color: "border-slate-700 bg-slate-800" },
                { label: "→", sub: "", color: "border-transparent bg-transparent text-slate-700" },
                { label: "Preprocessing", sub: "Resize 160×160\nAutocontrast\nNormalize [0,1]", color: "border-blue-500/30 bg-blue-500/10" },
                { label: "→", sub: "", color: "border-transparent bg-transparent text-slate-700" },
                { label: "MobileNetV2", sub: "CNN Feature\nExtraction\n(ImageNet weights)", color: "border-violet-500/30 bg-violet-500/10" },
                { label: "→", sub: "", color: "border-transparent bg-transparent text-slate-700" },
                { label: "Classification Head", sub: "Dense layers\nSoftmax output\n2 classes", color: "border-indigo-500/30 bg-indigo-500/10" },
                { label: "→", sub: "", color: "border-transparent bg-transparent text-slate-700" },
                { label: "Prediction", sub: "Male / Female\n+ Confidence %", color: "border-emerald-500/30 bg-emerald-500/10" },
              ].map((item, i) => (
                item.label === "→" ? (
                  <div key={i} className="flex items-center text-slate-700 text-xl font-bold self-center">→</div>
                ) : (
                  <div key={i} className={`border rounded-xl px-4 py-3 text-center min-w-[100px] ${item.color}`}>
                    <p className="text-xs font-bold text-white mb-1">{item.label}</p>
                    <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{item.sub}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. DEVELOPER SECTION ────────────────────────────────────────────── */}
      <section className="border-t border-slate-800/60 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Developer</SectionLabel>
          <h2 className="text-3xl font-bold text-white mb-10">About the Developer</h2>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-2xl">
              This project was developed as the final requirement for{" "}
              <span className="text-white font-medium">ITE03 (Web Systems &amp; Technologies)</span> and{" "}
              <span className="text-white font-medium">EVENTDP (Event-Driven Programming)</span>.
              It combines a machine learning image classification system with a full-stack student management
              web application into a single unified platform.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {[
                { initial: "B", name: "Brix A. Directo",              role: "Lead Developer" },
                { initial: "C", name: "Cyrille John M. Rubis",        role: "Developer" },
                { initial: "D", name: "Djaunathan Albert S. Madayag", role: "Developer" },
                { initial: "J", name: "Jan Alexis G. Roldan",         role: "Developer" },
                { initial: "J", name: "Jibreel Quimson",              role: "Developer" },
              ].map((member) => (
                <div key={member.name} className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                    {member.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">Course / Section:</span>
              <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">BSIT-III</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black">
                FP
              </div>
              <span className="font-semibold text-sm text-slate-400">GenderLens AI</span>
            </div>

            {/* Tech stack pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {TECH.map((t) => (
                <span key={t} className="bg-slate-900 border border-slate-800 text-slate-600 px-2.5 py-0.5 rounded-full text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
            <p>© 2026 GenderLens AI — ITE03 + EVENTDP Final Project</p>
            <p>Directo · Rubis · Madayag · Roldan · Quimson · BSIT-III</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ─── Reusable section label ───────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest text-violet-400 uppercase mb-3 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
      {children}
    </span>
  );
}
