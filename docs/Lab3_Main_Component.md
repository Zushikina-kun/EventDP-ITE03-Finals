# Laboratory 3 — Main Component
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

The Main Component is the central content area of the application. It is implemented as the `<main>` element inside `src/layout/NavBar.jsx` and uses React Router's `<Outlet />` to render the currently active page component.

The main component acts as the content host — every page (Landing, Classifier, Students, Dashboard, etc.) is rendered inside it.

---

## Component File

**File:** `src/layout/NavBar.jsx`

The `<main>` element is the third part of the Layout, after the header and sidebar.

---

## Main Component Design

| Property | Value |
|----------|-------|
| Background | `bg-slate-950` (deepest dark) |
| Overflow | `overflow-y-auto` (scrollable content) |
| Flex | `flex-1` (takes all remaining vertical space) |
| Content | Rendered via React Router `<Outlet />` |

---

## Main Component Code

```jsx
{/* ── MAIN COMPONENT ── src/layout/NavBar.jsx ── */}

{/* Main Content Area */}
<main className="flex-1 overflow-y-auto bg-slate-950">
  <Outlet />
</main>
```

The `<Outlet />` is a React Router component that renders whichever child route is currently active. For example:
- When the URL is `/` → renders `<LandingPage />`
- When the URL is `/classify` → renders `<ClassifyPage />`
- When the URL is `/students` → renders `<StudentsPage />`

---

## Pages Rendered Inside Main

The following pages are rendered as content inside the Main Component:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `LandingPage.jsx` | Hero, About, How It Works, Features, Visual, Developer, Footer |
| `/classify` | `ClassifyPage.jsx` | AI gender classifier with upload and webcam modes |
| `/login` | `LoginPage.jsx` | User login form |
| `/register` | `RegisterPage.jsx` | User registration form |
| `/students` | `StudentsPage.jsx` | Student list with search, sort, paginate |
| `/students/add` | `AddStudentPage.jsx` | Add new student form |
| `/students/edit/:id` | `EditStudentPage.jsx` | Edit existing student form |
| `/students/dashboard` | `DashboardPage.jsx` | Analytics charts and stat cards |
| `*` | `NotFound.jsx` | 404 page with countdown redirect |

---

## Landing Page as the Main Content (Lab 1)

The primary content rendered in the Main Component for Lab 1 is the Landing Page (`src/pages/LandingPage.jsx`), which contains all 7 required sections:

```jsx
// src/pages/LandingPage.jsx — rendered inside <main> via <Outlet />

export default function LandingPage() {
  return (
    <div className="min-h-full bg-slate-950 text-white">

      {/* 1. Hero Section */}
      <section className="relative px-6 pt-24 pb-20 text-center overflow-hidden">
        <h1 className="text-5xl sm:text-6xl font-black mb-4">GenderLens AI</h1>
        <p className="text-xl text-slate-400 mb-10">
          Classify gender from any face image — powered by deep learning.
        </p>
        {/* CTA buttons */}
      </section>

      {/* 2. About Section */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        {/* Two cards: EVENTDP + ITE03 */}
      </section>

      {/* 3. How It Works Section */}
      <section className="border-t border-slate-800/60 py-20 px-6">
        {/* 5-step flow diagram */}
      </section>

      {/* 4. Features Section */}
      <section className="border-t border-slate-800/60 py-20 px-6">
        {/* 6 feature cards */}
      </section>

      {/* 5. Visual Section */}
      <section className="border-t border-slate-800/60 py-20 px-6">
        {/* UI mockups + model workflow diagram */}
      </section>

      {/* 6. Developer Section */}
      <section className="border-t border-slate-800/60 py-20 px-6">
        {/* Brix A. Directo — BSIT-III */}
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-800 py-10 px-6">
        {/* © 2026 GenderLens AI */}
      </footer>

    </div>
  );
}
```

---

## Screenshot Instructions

**Code screenshot:** Open `src/layout/NavBar.jsx` and screenshot the `<main>` section. Also screenshot `src/pages/LandingPage.jsx` to show the main page content.

**Output screenshot:** Run `npm run dev`, open `http://localhost:5174`, and screenshot the full landing page content area (the scrollable main section below the header).
