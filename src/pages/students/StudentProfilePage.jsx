import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { EXPRESS_API } from "../../config/api.js";
import { ToastContainer, useToast } from "../../components/Toast.jsx";

const YEAR_LABELS = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { token, hasRole } = useAuth();
  const navigate  = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${EXPRESS_API}/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Student not found");
        setStudent(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token]);

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${EXPRESS_API}/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Student deleted.", "success");
      setTimeout(() => navigate("/students"), 1000);
    } catch (err) {
      showToast(err.message, "error");
      setDeleteLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-full bg-slate-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-full bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-red-400 font-medium mb-4">{error}</p>
        <Link to="/students" className="text-violet-400 hover:text-violet-300 text-sm">← Back to Students</Link>
      </div>
    </div>
  );

  const initial = student.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="min-h-full bg-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link to="/students" className="text-slate-500 hover:text-slate-300 transition-colors">Students</Link>
          <span className="text-slate-700">/</span>
          <span className="text-slate-300">{student.name}</span>
        </div>

        {/* Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Header band */}
          <div className="h-24 bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border-b border-slate-800 relative">
            <div className="absolute -bottom-8 left-7">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white border-4 border-slate-900">
                {initial}
              </div>
            </div>
          </div>

          <div className="pt-12 px-7 pb-7">
            {/* Name + student no */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">{student.name}</h1>
              <p className="text-slate-500 text-sm font-mono mt-0.5">{student.student_no}</p>
            </div>

            {/* Info grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <InfoCard label="Email" value={student.email} icon="✉️" />
              <InfoCard label="Course" value={student.course} icon="📚" />
              <InfoCard label="Year Level" value={YEAR_LABELS[student.year_level] ?? `Year ${student.year_level}`} icon="🎓" />
              <InfoCard label="Status" value={student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : "Active"} icon="📋" />
              {student.gender && <InfoCard label="Gender" value={student.gender} icon="⚧️" />}
              {student.birthdate && <InfoCard label="Birthdate" value={new Date(student.birthdate).toLocaleDateString()} icon="🎂" />}
              {student.section && <InfoCard label="Section" value={student.section} icon="🏫" />}
              {student.phone && <InfoCard label="Phone" value={student.phone} icon="📱" />}
              {student.nationality && <InfoCard label="Nationality" value={student.nationality} icon="🌍" />}
              {student.religion && <InfoCard label="Religion" value={student.religion} icon="🙏" />}
              {student.civil_status && <InfoCard label="Civil Status" value={student.civil_status} icon="💍" />}
              {student.guardian_name && <InfoCard label="Guardian" value={student.guardian_name} icon="👤" />}
              {student.guardian_phone && <InfoCard label="Guardian Phone" value={student.guardian_phone} icon="📞" />}
              {student.date_enrolled && <InfoCard label="Date Enrolled" value={new Date(student.date_enrolled).toLocaleDateString()} icon="📅" />}
              <InfoCard label="Student ID" value={`#${student.id}`} icon="🪪" mono />
            </div>

            {student.address && (
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">📍 Address</p>
                <p className="text-sm text-slate-300">{student.address}</p>
              </div>
            )}

            {student.notes && (
              <div className="mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">📝 Notes</p>
                <p className="text-sm text-slate-400">{student.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              {hasRole("admin", "staff") && (
                <Link to={`/students/edit/${student.id}`}
                  className="flex-1 text-center bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-xl font-semibold transition-all text-sm">
                  Edit Student
                </Link>
              )}
              {hasRole("admin") && (
                <button onClick={() => setShowConfirm(true)}
                  className="flex-1 bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-300 hover:text-red-400 py-2.5 rounded-xl font-semibold transition-all text-sm">
                  Delete
                </button>
              )}
              <Link to="/students"
                className="px-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 py-2.5 rounded-xl font-semibold transition-all text-sm">
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Delete Student?</h2>
            <p className="text-slate-400 text-sm mb-6">
              This will permanently remove <span className="text-white font-medium">{student.name}</span> from the system.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 transition-colors">
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setShowConfirm(false)} disabled={deleteLoading}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded-xl font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function InfoCard({ label, value, icon, mono = false }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">{icon} {label}</p>
      <p className={`text-sm font-semibold text-white ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
