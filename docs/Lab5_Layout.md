# Laboratory 5 — Layout
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

The three components — Header, Main, and Footer — are combined into a single unified layout in `src/layout/NavBar.jsx`. This `Layout` component wraps the entire application and is used as the root route element in `src/App.jsx`.

---

## Layout File

**File:** `src/layout/NavBar.jsx`

---

## How the Layout is Structured

```
┌─────────────────────────────────────────────────────┐
│  HEADER (h-14, fixed top)                           │
│  [☰] FinalProject              [Sign in] [Register] │
└─────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────┐
│          │                                          │
│ SIDEBAR  │  MAIN CONTENT AREA                       │
│ (w-56,   │  <Outlet /> renders active page          │
│ slides   │                                          │
│ in/out)  │  ┌────────────────────────────────────┐  │
│          │  │  Landing Page (Lab 1)              │  │
│ • Home   │  │  ─ Hero Section                    │  │
│ • AI     │  │  ─ About Section                   │  │
│   Classi-│  │  ─ How It Works                    │  │
│   fier   │  │  ─ Features Section                │  │
│ ─────    │  │  ─ Visual Section                  │  │
│ Students │  │  ─ Developer Section               │  │
│ • All    │  │  ─ Footer (Lab 4)                  │  │
│ • Dash-  │  └────────────────────────────────────┘  │
│   board  │                                          │
│ • Add    │                                          │
└──────────┴──────────────────────────────────────────┘
```

---

## Full Layout Code

```jsx
// src/layout/NavBar.jsx — Full Layout combining Header + Sidebar + Main

import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const [openNav, setOpenNav] = useState(false);
  const { token, username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950">

      {/* ── COMPONENT 1: HEADER (Lab 2) ── */}
      <header className="w-full bg-slate-900 border-b border-slate-800 text-white
        h-14 flex items-center justify-between px-4 flex-shrink-0 z-20">

        <div className="flex items-center gap-3">
          {/* Hamburger toggle */}
          <button onClick={() => setOpenNav((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500
              to-indigo-600 flex items-center justify-center text-xs font-black">
              FP
            </div>
            <span className="font-semibold text-sm text-slate-100">FinalProject</span>
          </NavLink>
        </div>

        {/* Auth controls */}
        <div className="flex items-center gap-3 text-sm">
          {token ? (
            <>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500
                to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                {username?.[0]?.toUpperCase() ?? "U"}
              </div>
              <button onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-slate-400 hover:text-white text-xs">
                Sign in
              </NavLink>
              <NavLink to="/register"
                className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                Register
              </NavLink>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── SIDEBAR NAVIGATION ── */}
        <aside className={`absolute left-0 top-0 h-full bg-slate-900 border-r
          border-slate-800 z-10 transition-all duration-300 overflow-y-auto
          ${openNav ? "w-56 translate-x-0" : "w-56 -translate-x-full"}`}>
          <nav className="flex flex-col p-3 gap-0.5 pt-4">
            {/* Navigation links */}
            <NavLink to="/" end onClick={() => setOpenNav(false)}
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2
                rounded-lg text-sm transition-all ${isActive
                  ? "bg-violet-600/20 text-violet-400 font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>
              Home
            </NavLink>
            <NavLink to="/classify" onClick={() => setOpenNav(false)}
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2
                rounded-lg text-sm transition-all ${isActive
                  ? "bg-violet-600/20 text-violet-400 font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>
              AI Classifier
            </NavLink>
            {/* ... more nav links */}
          </nav>
        </aside>

        {/* Overlay when sidebar open */}
        {openNav && (
          <div className="absolute inset-0 bg-black/50 z-[5]"
            onClick={() => setOpenNav(false)} />
        )}

        {/* ── COMPONENT 2: MAIN CONTENT (Lab 3) ── */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Outlet />
          {/* Footer is rendered inside LandingPage (Lab 4) */}
        </main>

      </div>
    </div>
  );
}
```

---

## How It's Used in App.jsx

```jsx
// src/App.jsx — Layout wraps all routes

import Layout from "./layout/NavBar.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>        {/* ← Layout wraps everything */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/classify" element={<ClassifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
        <Route path="/students/add" element={<ProtectedRoute><AddStudentPage /></ProtectedRoute>} />
        <Route path="/students/edit/:id" element={<ProtectedRoute><EditStudentPage /></ProtectedRoute>} />
        <Route path="/students/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

---

## Design Summary

| Component | File | Design |
|-----------|------|--------|
| Header | `src/layout/NavBar.jsx` | Dark `slate-900` bar, violet gradient logo, auth-aware right section |
| Sidebar | `src/layout/NavBar.jsx` | Slides in from left, dark `slate-900`, violet active states, SVG icons |
| Main | `src/layout/NavBar.jsx` | `slate-950` background, full scrollable content area |
| Footer | `src/pages/LandingPage.jsx` | Bottom of landing page, copyright + tech stack + developer credit |

---

## Screenshot Instructions

**Code screenshot:** Open `src/layout/NavBar.jsx` and screenshot the full file showing all three components combined.

**Output screenshot:** Run `npm run dev`, open `http://localhost:5174`, and take screenshots showing:
1. The full layout with header visible at top
2. Click the hamburger (☰) to open the sidebar — screenshot showing header + sidebar + main content together
3. Scroll to the bottom of the landing page to show the footer
4. The complete combined layout demonstrates all three components working together
