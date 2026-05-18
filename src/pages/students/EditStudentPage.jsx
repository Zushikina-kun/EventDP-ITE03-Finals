import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { EXPRESS_API, COURSES, STUDENT_STATUSES } from "../../config/api.js";
import { ToastContainer, useToast } from "../../components/Toast.jsx";

export default function EditStudentPage() {
  const { id } = useParams();
  const [form, setForm] = useState({
    student_no: "", name: "", email: "", course: "", year_level: "",
    section: "", status: "active", phone: "", address: "",
    guardian_name: "", guardian_phone: "", date_enrolled: "", notes: "",
  });
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${EXPRESS_API}/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Student not found");
        const data = await res.json();
        setForm({
          student_no: data.student_no || "",
          name: data.name || "",
          email: data.email || "",
          course: data.course || "",
          year_level: String(data.year_level || ""),
          section: data.section || "",
          status: data.status || "active",
          phone: data.phone || "",
          address: data.address || "",
          guardian_name: data.guardian_name || "",
          guardian_phone: data.guardian_phone || "",
          date_enrolled: data.date_enrolled ? data.date_enrolled.split("T")[0] : "",
          notes: data.notes || "",
        });
      } catch (err) { setFetchError(err.message); }
      finally { setFetchLoading(false); }
    }
    load();
  }, [id, token]);

  function handleChange(e) { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { ...form, year_level: parseInt(form.year_level) };
      const res = await fetch(`${EXPRESS_API}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      showToast("Student updated!", "success");
      setTimeout(() => navigate("/students"), 1000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (fetchLoading) return (
    <div className="min-h-full bg-slate-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (fetchError) return (
    <div className="min-h-full bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-400 font-medium mb-4">{fetchError}</p>
        <Link to="/students" className="text-violet-400 hover:text-violet-300 text-sm">← Back to Students</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/students" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">← Students</Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-lg font-bold text-white">Edit Student</h1>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Required Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Student No." name="student_no" value={form.student_no} onChange={handleChange} mono required />
                <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                <FormField label="Email" name="email" value={form.email} onChange={handleChange} type="email" required />
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Course <span className="text-red-400">*</span></label>
                  <select name="course" value={form.course} onChange={handleChange} required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
                    <option value="">Select a course</option>
                    {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Year Level <span className="text-red-400">*</span></label>
                  <select name="year_level" value={form.year_level} onChange={handleChange} required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
                    <option value="">Select year level</option>
                    {[1,2,3,4].map((y) => <option key={y} value={y}>{y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : "4th"} Year</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
                  <select name="status" value={form.status} onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all">
                    {STUDENT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Additional Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Section" name="section" value={form.section} onChange={handleChange} placeholder="e.g. 3A" />
                <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 09171234567" />
                <FormField label="Date Enrolled" name="date_enrolled" value={form.date_enrolled} onChange={handleChange} type="date" />
                <FormField label="Guardian Name" name="guardian_name" value={form.guardian_name} onChange={handleChange} />
                <FormField label="Guardian Phone" name="guardian_phone" value={form.guardian_phone} onChange={handleChange} />
              </div>
              <div className="mt-4">
                <FormField label="Address" name="address" value={form.address} onChange={handleChange} />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none" />
              </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">{error}</div>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold transition-all">
                {loading ? "Saving…" : "Save Changes"}
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

function FormField({ label, name, value, onChange, placeholder = "", type = "text", mono = false, required = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
