import React from "react";

export default function ConfirmDeleteModal({ open, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel" }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-xs border-t-4 border-error flex flex-col items-center">
        <h3 className="text-lg font-bold mb-3 text-error text-center">{title}</h3>
        <p className="mb-5 text-sm text-base-content/80 text-center">{message}</p>
        <div className="flex justify-center gap-2 w-full">
          <button className="btn btn-ghost" onClick={onClose}>{cancelText}</button>
          <button className="btn btn-error" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
} 