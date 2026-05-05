# Laboratory 2 — Header Component
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

The Header Component is the persistent top navigation bar rendered on every page of the application. It is implemented inside `src/layout/NavBar.jsx` as the `<header>` element within the main `Layout` component.

---

## Component File

**File:** `src/layout/NavBar.jsx`

The `Layout` component wraps the entire app and renders three parts:
1. `<header>` — the top bar (this laboratory)
2. `<aside>` — the sidebar (Lab 3 / Main Component)
3. `<main>` — the page content outlet

---

## Header Design

| Property | Value |
|----------|-------|
| Background | `bg-slate-900` (dark navy) |
| Border | `border-b border-slate-800` (subtle bottom line) |
| Height | `h-14` (56px, fixed) |
| Position | Fixed at top, `z-20` (above sidebar overlay) |
| Text color | White / slate tones |
| Accent color | Violet gradient |

---

## Header Features

### Left Side
- **Hamburger button** — Toggles the sidebar open/closed using `useState`
- **Logo badge** — "FP" in a violet-to-indigo gradient rounded square
- **App name** — "FinalProject" as a `NavLink` to the home page

### Right Side (Authentication-aware)
- **When logged out:** "Sign in" link + "Register" button (violet)
- **When logged in:** User avatar (first letter of username in gradient circle) + username + "Sign out" button

---

## Full Header Code

```jsx
{/* ── HEADER COMPONENT ── src/layout/NavBar.jsx ── */}

<header className="w-full bg-slate-900 border-b border-slate-800 text-white h-14
  flex items-center justify-between px-4 flex-shrink-0 z-20">

  {/* ── Left: Hamburger + Logo ── */}
  <div className="flex items-center gap-3">

    {/* Hamburger menu toggle */}
    <button
      onClick={() => setOpenNav((v) => !v)}
      className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
      aria-label="Toggle navigation"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    {/* Logo + App name */}
    <NavLink to="/" className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600
        flex items-center justify-center text-xs font-black">
        FP
      </div>
      <span className="font-semibold text-sm tracking-wide text-slate-100">
        FinalProject
      </span>
    </NavLink>
  </div>

  {/* ── Right: Auth controls ── */}
  <div className="flex items-center gap-3 text-sm">
    {token ? (
      <>
        {/* Logged in state */}
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
            flex items-center justify-center text-xs font-bold text-white">
            {username?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="hidden sm:block text-slate-300 text-xs">{username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors
            px-2 py-1 rounded hover:bg-slate-800"
        >
          Sign out
        </button>
      </>
    ) : (
      <>
        {/* Logged out state */}
        <NavLink to="/login"
          className="text-slate-400 hover:text-white transition-colors text-xs">
          Sign in
        </NavLink>
        <NavLink to="/register"
          className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5
            rounded-lg text-xs font-semibold transition-colors">
          Register
        </NavLink>
      </>
    )}
  </div>

</header>
```

---

## Screenshot Instructions

**Code screenshot:** Open `src/layout/NavBar.jsx` in your editor and screenshot the `<header>` section (approximately lines 18–60).

**Output screenshot:** Run `npm run dev`, open `http://localhost:5174`, and screenshot the top bar showing:
- Logged-out state: Sign in + Register visible on the right
- Logged-in state: Avatar initial + username + Sign out visible on the right
