"use client";
// ConfirmDeleteModal.js
// Modal dialog for confirming destructive actions (delete trip, traveller, or expense)
// Shows a title, message, and Delete/Cancel buttons with overlay
import React, { useState } from "react";

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

  // Track hover state for Delete button
  const [deleteHover, setDeleteHover] = useState(false);

  // Cancel button classes
  const cancelBase = "flex-1 px-4 py-2 rounded-lg border text-base font-medium transition-colors duration-150 cursor-pointer select-none";
  const cancelDefault = "bg-error text-white border-error";
  const cancelDeleteHover = "bg-white text-error border-error";

  // Delete button classes
  const deleteBase = "flex-1 px-4 py-2 rounded-lg border text-base font-medium transition-colors duration-150 cursor-pointer select-none";
  const deleteDefault = "bg-white text-error border-error";
  const deleteHoverClass = "bg-error text-white border-error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-message"
    >
      <div className="bg-base-100 rounded-xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center">
        <h3 id="modal-title" className="text-lg font-bold mb-3 text-error text-center">{title}</h3>
        <p id="modal-message" className="mb-5 text-sm text-base-content/80 text-center">{message}</p>
        <div className="flex justify-center gap-2 w-full">
          <button className="btn btn-soft flex-1" onClick={onClose}>{cancelText}</button>
          <button
            className="btn btn-error btn-soft flex-1 hover:text-white"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 