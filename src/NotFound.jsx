import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NotFound() {
  const navigate  = useNavigate();
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) { navigate("/"); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div className="min-h-full bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Animated number */}
        <div className="relative inline-block mb-6">
          <p className="text-[10rem] font-black text-slate-900 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-bounce">🔍</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-slate-500 mb-1 text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
        <p className="text-sm text-slate-700 mb-8">
          Redirecting in{" "}
          <span className="font-semibold text-violet-400">{count}</span>s…
        </p>

        <div className="flex gap-3 justify-center">
          <Link to="/"
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all">
            Go Home
          </Link>
          <button onClick={() => navigate(-1)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-6 py-2.5 rounded-xl font-semibold transition-all">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
