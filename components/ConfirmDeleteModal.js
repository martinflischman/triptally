"use client";
// ConfirmDeleteModal.js
// Shows a modal dialog to confirm deleting a trip or traveller
import React from "react";

export default function ConfirmDeleteModal({ open, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", cancelRed = false }) {
  // If not open, don't render anything
  if (!open) return null;

  // Handle Escape key to close modal
  React.useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-xs border-t-4 border-error flex flex-col items-center">
        <h3 id="modal-title" className="text-lg font-bold mb-3 text-error text-center">{title}</h3>
        <p id="modal-message" className="mb-5 text-sm text-base-content/80 text-center">{message}</p>
        <div className="flex justify-center gap-2 w-full">
          <button
            className={`flex-1 px-4 py-2 rounded-lg border text-base font-medium transition-colors duration-150 cursor-pointer
              ${cancelRed ? 'text-error border-error bg-base-200 hover:bg-base-300 focus:ring-2 focus:ring-error' : 'text-base-content border-base-300 bg-base-200 hover:bg-base-300 focus:ring-2 focus:ring-primary'}`}
            style={{ minWidth: 0 }}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-lg border border-error bg-error text-white text-base font-medium transition-colors duration-150 hover:bg-error/90 focus:ring-2 focus:ring-error cursor-pointer"
            style={{ minWidth: 0 }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 