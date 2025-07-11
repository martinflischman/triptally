"use client";
// Toast.js
// Shows a temporary notification (success or error) at the bottom of the screen
import { useEffect } from "react";

export default function Toast({ open, message, onClose, duration = 2000, type = "success" }) {
  // Automatically close the toast after 'duration' ms
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  // Choose DaisyUI alert-soft class based on type
  let colorClass = "alert alert-success alert-soft";
  if (type === "error") colorClass = "alert alert-error alert-soft";
  else if (type === "warning") colorClass = "alert alert-warning alert-soft";
  else if (type === "info") colorClass = "alert alert-info alert-soft";

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex justify-center w-full pointer-events-none" role="alert" aria-live="assertive">
      <div className={`${colorClass} pointer-events-auto animate-fade-in-up`}>
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
}

// Add a simple fade-in-up animation
// In your globals.css, add:
// @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
// .animate-fade-in-up { animation: fade-in-up 0.3s ease; } 