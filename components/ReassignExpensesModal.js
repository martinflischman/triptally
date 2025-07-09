import React, { useState } from "react";

export default function ReassignExpensesModal({ open, onClose, onConfirm, travellers, excludeTravellerId }) {
  const [selectedTraveller, setSelectedTraveller] = useState("");

  if (!open) return null;

  const availableTravellers = travellers.filter(t => t.id !== excludeTravellerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-xs">
        <h3 className="text-lg font-bold mb-4">Reassign Expenses</h3>
        <p className="mb-3 text-sm">This traveller has paid for one or more expenses. Please select another traveller to reassign these expenses to before deleting.</p>
        <select
          className="select select-bordered w-full mb-4"
          value={selectedTraveller}
          onChange={e => setSelectedTraveller(e.target.value)}
        >
          <option value="">Select new traveller</option>
          {availableTravellers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={!selectedTraveller}
            onClick={() => onConfirm(selectedTraveller)}
          >
            Reassign & Delete
          </button>
        </div>
      </div>
    </div>
  );
} 