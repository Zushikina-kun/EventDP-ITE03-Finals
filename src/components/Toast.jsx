import { useEffect, useState } from "react";

const ICONS = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

const COLORS = {
  success: "bg-green-50 border-green-300 text-green-800",
  error:   "bg-red-50 border-red-300 text-red-800",
  info:    "bg-blue-50 border-blue-300 text-blue-800",
  warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
};

/**
 * Single toast message.
 * Props: message (str), type ('success'|'error'|'info'|'warning'), onClose (fn)
 */
export function Toast({ message, type = "info", onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const show = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 3.5s
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // wait for exit animation
    }, 3500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [onClose]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm w-full
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        ${COLORS[type]}`}
    >
      <span className="text-base flex-shrink-0">{ICONS[type]}</span>
      <p className="flex-1 leading-snug">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Container that renders all active toasts in the bottom-right corner.
 * Props: toasts (array of {id, message, type}), onRemove (fn)
 */
export function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => onRemove(t.id)}
        />
      ))}
    </div>
  );
}

/**
 * Hook to manage toast state.
 * Returns { toasts, showToast, removeToast }
 *
 * Usage:
 *   const { toasts, showToast, removeToast } = useToast();
 *   showToast("Saved!", "success");
 *   <ToastContainer toasts={toasts} onRemove={removeToast} />
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = "info") {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, showToast, removeToast };
}
