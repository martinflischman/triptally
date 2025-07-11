"use client";

import React, { useState, useEffect } from "react";
// Currency symbols for supported currencies
const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  ZAR: "R",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
  JPY: "¥",
  CNY: "¥",
};

export default function ReassignExpensesModal({ open, onClose, onConfirm, travellers, excludeTravellerId, expenses = [], currency }) {
  const [reassignments, setReassignments] = useState({});

  useEffect(() => {
    // Reset reassignments when modal opens or expenses change
    if (open) {
      const initial = {};
      expenses.forEach(exp => { initial[exp.id] = ""; });
      setReassignments(initial);
    }
  }, [open, expenses]);

  if (!open) return null;

  const availableTravellers = travellers.filter(t => t.id !== excludeTravellerId);
  const allAssigned = expenses.length > 0 && Object.values(reassignments).every(val => val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Reassign Expenses</h3>
        <p className="mb-3 text-sm">This traveller has paid for the following expenses. Please select a new payer for each before deleting.</p>
        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
          {expenses.map(exp => (
            <div key={exp.id} className="flex items-center gap-2">
              <div className="w-1/2 truncate text-sm">
                {exp.category} <span className="text-xs text-base-content/60">(
                  {CURRENCY_SYMBOLS[exp.currency || currency] || exp.currency || currency || ""} {Number(exp.amount).toFixed(2)}
                )</span>
              </div>
              <select
                className="select select-bordered w-1/2"
                value={reassignments[exp.id] || ""}
                onChange={e => setReassignments(r => ({ ...r, [exp.id]: e.target.value }))}
              >
                <option value="">Select new payer</option>
                {availableTravellers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost btn-soft flex-1" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-error btn-soft flex-1 hover:text-white"
            disabled={!allAssigned}
            onClick={() => onConfirm(reassignments)}
          >
            Reassign & Delete
          </button>
        </div>
      </div>
    </div>
  );
} 