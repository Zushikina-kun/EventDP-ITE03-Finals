import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { EXPRESS_API, COURSES } from "../../config/api.js";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const API_URL = EXPRESS_API;

const YEAR_LABELS = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

// Colour palette — one per course slot
const COLORS = [
  "#6366f1", "#3b82f6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f97316",
];

export default function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const { token } = useAuth();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch students");
      setStudents(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const byCourse = COURSES.map((c) => ({
    name: c,
    value: students.filter((s) => s.course === c).length,
  })).filter((d) => d.value > 0);

  const byYear = [1, 2, 3, 4].map((y) => ({
    name: YEAR_LABELS[y],
    students: students.filter((s) => s.year_level === y).length,
  }));

  const topCourse = byCourse.reduce(
    (best, c) => (c.value > (best?.value ?? 0) ? c : best),
    null
  );

  if (loading) {
    return (
      <div className="min-h-full bg-slate-950 py-8 px-4">
        <div className="max-w-5xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-24" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-72" />
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-72" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button onClick={fetchStudents} className="text-violet-400 hover:text-violet-300 text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Overview of enrolled students</p>
          </div>
          <Link to="/students" className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
            ← Students
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Students" value={students.length} color="violet" icon="🎓" />
          <StatCard label="Courses" value={byCourse.length} color="blue" icon="📚" />
          <StatCard label="Most Enrolled" value={topCourse?.name ?? "—"} color="emerald" icon="🏆" small />
          <StatCard label="Avg per Course" value={byCourse.length ? (students.length / byCourse.length).toFixed(1) : "—"} color="amber" icon="📈" />
        </div>

        {/* Charts */}
        {students.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-600">
            No student data yet.{" "}
            <Link to="/students/add" className="text-violet-400 hover:text-violet-300">Add some students</Link>{" "}
            to see charts.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">By Course</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={byCourse} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {byCourse.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} students`, "Count"]} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", color: "#e2e8f0" }} />
                  <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">By Year Level</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byYear} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip formatter={(v) => [`${v} students`, "Count"]} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", color: "#e2e8f0" }} />
                  <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                    {byYear.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const colorMap = {
  violet: "bg-violet-500/20 text-violet-400",
  blue:   "bg-blue-500/20 text-blue-400",
  emerald:"bg-emerald-500/20 text-emerald-400",
  amber:  "bg-amber-500/20 text-amber-400",
};

function StatCard({ label, value, color, icon, small = false }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-2">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${colorMap[color]}`}>
        {icon}
      </div>
      <p className={`font-bold ${small ? "text-base" : "text-2xl"} text-white leading-tight`}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
