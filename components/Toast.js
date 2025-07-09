import { useEffect } from "react";

export default function Toast({ open, message, onClose, duration = 2000 }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex justify-center w-full pointer-events-none">
      <div className="alert bg-success/10 text-success shadow-lg pointer-events-auto animate-fade-in-up">
        <span className="font-semibold text-success">{message}</span>
      </div>
    </div>
  );
}

// Add a simple fade-in-up animation
// In your globals.css, add:
// @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
// .animate-fade-in-up { animation: fade-in-up 0.3s ease; } 