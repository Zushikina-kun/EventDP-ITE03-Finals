import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EXPRESS_API } from "../../config/api.js";

export default function RegisterPage() {
  const [form, setForm]     = useState({ username: "", password: "", confirm: "" });
  const [error, setError]   = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res  = await fetch(`${EXPRESS_API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-black mx-auto mb-4">
            FP
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-slate-500 text-sm mt-1">Access the Student Management System</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
              <p className="text-emerald-400 font-semibold">Account created!</p>
              <p className="text-slate-500 text-sm mt-1">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "username", label: "Username", type: "text", placeholder: "choose a username" },
                { name: "password", label: "Password", type: "password", placeholder: "at least 6 characters" },
                { name: "confirm",  label: "Confirm Password", type: "password", placeholder: "repeat password" },
              ].map(({ name, label, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold transition-all mt-2"
              >
                {loading ? "Creating…" : "Create Account"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
