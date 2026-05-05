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
      {/* Top Bar */}
      <header className="w-full bg-slate-900 border-b border-slate-800 text-white h-14 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenNav((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Toggle navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-black">
              FP
            </div>
            <span className="font-semibold text-sm tracking-wide text-slate-100">FinalProject</span>
          </NavLink>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {token ? (
            <>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                  {username?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden sm:block text-slate-300 text-xs">{username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-slate-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-slate-400 hover:text-white transition-colors text-xs">
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`absolute left-0 top-0 h-full bg-slate-900 border-r border-slate-800 z-10
            transition-all duration-300 ease-in-out overflow-y-auto scrollbar-thin
            ${openNav ? "w-56 translate-x-0" : "w-56 -translate-x-full"}`}
        >
          <nav className="flex flex-col p-3 gap-0.5 pt-4">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-3">
              General
            </p>

            <NavLink
              to="/"
              end
              onClick={() => setOpenNav(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-violet-600/20 text-violet-400 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </NavLink>

            <NavLink
              to="/classify"
              onClick={() => setOpenNav(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-violet-600/20 text-violet-400 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
              AI Classifier
            </NavLink>

            <div className="border-t border-slate-800 my-3" />

            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-3">
              Students
            </p>

            {token ? (
              <>
                <NavLink
                  to="/students"
                  end
                  onClick={() => setOpenNav(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-violet-600/20 text-violet-400 font-medium"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`
                  }
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  All Students
                </NavLink>
                <NavLink
                  to="/students/dashboard"
                  onClick={() => setOpenNav(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-violet-600/20 text-violet-400 font-medium"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`
                  }
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </NavLink>
                <NavLink
                  to="/students/add"
                  onClick={() => setOpenNav(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-violet-600/20 text-violet-400 font-medium"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`
                  }
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Student
                </NavLink>
              </>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setOpenNav(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-800 hover:text-slate-400 transition-all"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Login required
              </NavLink>
            )}
          </nav>
        </aside>

        {/* Overlay */}
        {openNav && (
          <div
            className="absolute inset-0 bg-black/50 z-[5]"
            onClick={() => setOpenNav(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
