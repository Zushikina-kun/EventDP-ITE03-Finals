import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { EXPRESS_API } from "../../config/api.js";
import { ToastContainer, useToast } from "../../components/Toast.jsx";
import SkeletonRow from "../../components/SkeletonRow.jsx";

const API_URL    = EXPRESS_API;
const PAGE_SIZE  = 10;

const STATUS_COLORS = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  graduated: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  dropped: "bg-red-500/20 text-red-400 border-red-500/30",
};

// ── CSV export helper ─────────────────────────────────────────────────────────
function exportCSV(students) {
  const header = ["Student No.", "Name", "Email", "Course", "Year Level"];
  const rows   = students.map((s) => [
    s.student_no, s.name, s.email, s.course, `Year ${s.year_level}`,
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sortable column header ────────────────────────────────────────────────────
function SortTh({ label, field, sortField, sortDir, onSort, className = "" }) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-violet-400 transition-colors ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-slate-600">
          {active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </span>
    </th>
  );
}

export default function StudentsPage() {
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [deleteId,     setDeleteId]     = useState(null);
  const [deleteLoading,setDeleteLoading]= useState(false);
  const [search,       setSearch]       = useState("");
  const [sortField,    setSortField]    = useState("name");
  const [sortDir,      setSortDir]      = useState("asc");
  const [page,         setPage]         = useState(1);
  const { token, hasRole } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

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

  // Reset to page 1 whenever search or sort changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [search, sortField, sortDir]);

  async function handleDelete(id) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setDeleteId(null);
      showToast("Student deleted successfully.", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  // ── Filter → sort → paginate ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        (s.student_no && s.student_no.toLowerCase().includes(q))
    );
  }, [students, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortField] ?? "";
      let bv = b[sortField] ?? "";
      if (sortField === "year_level") { av = Number(av); bv = Number(bv); }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-full bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Students</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {loading ? "Loading…" : `${students.length} student${students.length !== 1 ? "s" : ""} enrolled`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/students/dashboard"
              className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl font-semibold hover:bg-slate-700 transition-colors text-sm">
              Dashboard
            </Link>
            {students.length > 0 && (
              <button onClick={() => { exportCSV(sorted); showToast("CSV exported!", "success"); }}
                className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl font-semibold hover:bg-slate-700 transition-colors text-sm">
                Export CSV
              </button>
            )}
            {hasRole("admin", "staff") && (
              <Link to="/students/add"
                className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-xl font-semibold transition-colors text-sm">
                + Add Student
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input type="text" placeholder="Search by name, student no., email, or course…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm mb-4">
            {error}
            <button onClick={fetchStudents} className="ml-3 underline hover:text-red-300">Retry</button>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800">
                  <tr>
                    <SortTh label="Student No." field="student_no" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortTh label="Name"        field="name"       sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortTh label="Email"       field="email"      sortField={sortField} sortDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                    <SortTh label="Course"      field="course"     sortField={sortField} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                    <SortTh label="Year"        field="year_level" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <SkeletonRow count={7} />
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-slate-600">
                        {search ? "No students match your search." : "No students yet. Add one!"}
                      </td>
                    </tr>
                  ) : (
                    paginated.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{student.student_no}</td>
                        <td className="px-4 py-3 font-medium text-slate-200">
                          <Link to={`/students/${student.id}`} className="hover:text-violet-400 transition-colors">
                            {student.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{student.email}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{student.course}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">Year {student.year_level}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[student.status] || STATUS_COLORS.active}`}>
                            {student.status || "active"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/students/${student.id}`}
                              className="text-slate-400 hover:text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                              View
                            </Link>
                            {hasRole("admin", "staff") && (
                              <Link to={`/students/edit/${student.id}`}
                                className="text-violet-400 hover:text-violet-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-violet-500/10 transition-colors">
                                Edit
                              </Link>
                            )}
                            {hasRole("admin") && (
                              <button onClick={() => setDeleteId(student.id)}
                                className="text-red-400 hover:text-red-300 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && sorted.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-sm text-slate-500">
                <span className="text-xs">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-400">
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-2 py-1 text-slate-600">…</span>
                      ) : (
                        <button key={p} onClick={() => setPage(p)}
                          className={`px-3 py-1 rounded-lg border transition-colors text-xs ${
                            p === page ? "bg-violet-600 text-white border-violet-600" : "border-slate-700 hover:bg-slate-800 text-slate-400"
                          }`}>
                          {p}
                        </button>
                      )
                    )}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-400">
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-2">Delete Student?</h2>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. The student record will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-semibold disabled:opacity-50 transition-colors">
                {deleteLoading ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteId(null)} disabled={deleteLoading}
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
