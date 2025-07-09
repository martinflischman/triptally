import { useEffect } from "react";

export default function Toast({ open, message, onClose, duration = 2000, type = "success" }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  const colorClass = type === "error"
    ? "bg-error/20 text-error rounded-lg border-none shadow-none outline-none"
    : "bg-success/20 text-success rounded-lg border-none shadow-none outline-none";

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex justify-center w-full pointer-events-none" role="alert" aria-live="assertive">
      <div className={`alert ${colorClass} pointer-events-auto animate-fade-in-up`}>
        <span className={`font-semibold ${type === "error" ? "text-error" : "text-success"}`}>{message}</span>
      </div>
    </div>
  );
}

// Add a simple fade-in-up animation
// In your globals.css, add:
// @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
// .animate-fade-in-up { animation: fade-in-up 0.3s ease; } 