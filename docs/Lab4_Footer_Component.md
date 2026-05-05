# Laboratory 4 — Footer Component
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

The Footer Component is the bottom section of the Landing Page. It is implemented directly inside `src/pages/LandingPage.jsx` as the `<footer>` element — the last section of the page, providing closure and attribution.

---

## Component File

**File:** `src/pages/LandingPage.jsx`

The footer is the final `<footer>` element at the bottom of the `LandingPage` component.

---

## Footer Design

| Property | Value |
|----------|-------|
| Background | Inherits `bg-slate-950` from page |
| Border | `border-t border-slate-800` (top separator line) |
| Padding | `py-10 px-6` |
| Text color | `text-slate-600` (muted, subtle) |
| Layout | Two rows: brand + tech stack / copyright + developer |

---

## Footer Features

### Top Row
- **Brand logo** — "FP" gradient badge + "GenderLens AI" app name
- **Tech stack pills** — All 12 technologies listed as small rounded badges

### Bottom Row (copyright bar)
- **Left:** `© 2026 GenderLens AI — ITE03 + EVENTDP Final Project`
- **Right:** `Brix A. Directo · BSIT-III`

---

## Full Footer Code

```jsx
{/* ── FOOTER COMPONENT ── src/pages/LandingPage.jsx ── */}

<footer className="border-t border-slate-800 py-10 px-6">
  <div className="max-w-5xl mx-auto">

    {/* ── Top row: Brand + Tech stack ── */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600
          flex items-center justify-center text-xs font-black">
          FP
        </div>
        <span className="font-semibold text-sm text-slate-400">GenderLens AI</span>
      </div>

      {/* Tech stack pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {TECH.map((t) => (
          <span key={t}
            className="bg-slate-900 border border-slate-800 text-slate-600
              px-2.5 py-0.5 rounded-full text-xs">
            {t}
          </span>
        ))}
      </div>
    </div>

    {/* ── Bottom row: Copyright + Developer ── */}
    <div className="border-t border-slate-800 mt-6 pt-6
      flex flex-col sm:flex-row items-center justify-between gap-2
      text-xs text-slate-600">
      <p>© 2026 GenderLens AI — ITE03 + EVENTDP Final Project</p>
      <p>Directo · Rubis · Madayag · BSIT-III</p>
    </div>

  </div>
</footer>
```

---

## Tech Stack Listed in Footer

```js
const TECH = [
  "React 19", "Vite", "Tailwind CSS", "React Router",
  "FastAPI", "TensorFlow", "MobileNetV2",
  "Express.js", "MySQL", "JWT Auth", "Recharts", "Python",
];
```

---

## Screenshot Instructions

**Code screenshot:** Open `src/pages/LandingPage.jsx` in your editor and screenshot the `<footer>` section at the bottom of the file.

**Output screenshot:** Run `npm run dev`, open `http://localhost:5174`, scroll all the way to the bottom of the landing page, and screenshot the footer showing:
- The "FP" logo badge + "GenderLens AI" on the left
- Tech stack pills on the right
- Copyright line: "© 2026 GenderLens AI — ITE03 + EVENTDP Final Project"
- Developer credit: "Directo · Rubis · Madayag · Roldan · Quimson · BSIT-III"
