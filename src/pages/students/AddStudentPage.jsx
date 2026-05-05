import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { EXPRESS_API, COURSES } from "../../config/api.js";
import { ToastContainer, useToast } from "../../components/Toast.jsx";

export default function AddStudentPage() {
  const [form, setForm] = useState({ student_no: "", name: "", email: "", course: "", year_level: "" });
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate  = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch(`${EXPRESS_API}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, year_level: parseInt(form.year_level) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add student");
      showToast("Student added!", "success");
      setTimeout(() => navigate("/students"), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-950 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/students" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
            ← Students
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-lg font-bold text-white">Add Student</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Student No." name="student_no" value={form.student_no} onChange={handleChange} placeholder="e.g. 2024-00123" mono />
            <FormField label="Full Name"   name="name"       value={form.name}       onChange={handleChange} placeholder="e.g. Juan Dela Cruz" />
            <FormField label="Email"       name="email"      value={form.email}      onChange={handleChange} placeholder="e.g. juan@school.edu" type="email" />

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Course <span className="text-red-400">*</span>
              </label>
              <select name="course" value={form.course} onChange={handleChange} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
                <option value="">Select a course</option>
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Year Level <span className="text-red-400">*</span>
              </label>
              <select name="year_level" value={form.year_level} onChange={handleChange} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
                <option value="">Select year level</option>
                {[1,2,3,4].map((y) => <option key={y} value={y}>{y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : "4th"} Year</option>)}
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold transition-all">
                {loading ? "Saving…" : "Add Student"}
              </button>
              <Link to="/students"
                className="flex-1 text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded-xl font-semibold transition-all">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = "text", mono = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
        {label} <span className="text-red-400">*</span>
      </label>
      <input type={type} name={name} value={value} onChange={onChange} required placeholder={placeholder}
        className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
