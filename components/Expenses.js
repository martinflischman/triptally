"use client";
// Expenses.js
// Handles adding, editing, and removing expenses for a trip
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// --- List of possible expense categories ---
const CATEGORY_OPTIONS = [
  "Accommodation",
  "Transport",
  "Food & Drink",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Other",
].sort();

// --- Currency symbols for supported currencies ---
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

export default function Expenses({ tripId, currency, travellers = [], onExpensesChange, onShowToast }) {
  // --- State variables for all expense data and UI state ---
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  // State for add expense form
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  // State for editing an expense
  const [editingId, setEditingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(CATEGORY_OPTIONS[0]);
  const [editingAmount, setEditingAmount] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingPaidBy, setEditingPaidBy] = useState("");

  // --- Fetch expenses when tripId changes ---
  useEffect(() => {
    if (tripId) fetchExpenses();
    // eslint-disable-next-line
  }, [tripId]);

  // --- Reset paidBy when travellers change ---
  useEffect(() => {
    // Clear paidBy if selected traveller no longer exists
    if (paidBy && !travellers.find((t) => t.id === paidBy)) {
      setPaidBy("");
    }
  }, [travellers, paidBy]);

  // --- Fetch all expenses for the current trip from Supabase ---
  async function fetchExpenses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select(
        `
        *,
        travellers (
          id,
          name
        )
      `
      )
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });
    if (!error) setExpenses(data);
    setLoading(false);
  }

  // --- Handle adding a new expense ---
  async function handleAddExpense(e) {
    e.preventDefault();
    setAdding(true);
    setError("");

    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      setAdding(false);
      return;
    }

    // Validate paidBy
    if (!paidBy) {
      setError("Please select who paid for this expense.");
      setAdding(false);
      return;
    }

    // Insert new expense into database
    const { error } = await supabase.from("expenses").insert([
      {
        trip_id: tripId,
        category,
        amount: Number(amount),
        description,
        paid_by: paidBy,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setAmount("");
      setDescription("");
      // Keep the same traveller selected for convenience
      fetchExpenses();
      if (onShowToast) {
        onShowToast("Expense added");
      }
    }
    setAdding(false);
  }

  // --- Handle deleting an expense ---
  async function handleDeleteExpense(id) {
    if (!window.confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id", id);
    fetchExpenses();
    if (onExpensesChange) {
      await onExpensesChange();
    }
    if (onShowToast) {
      onShowToast("Expense deleted", "error");
    }
  }

  // --- Handle editing an expense (open edit mode) ---
  function handleEditExpense(exp) {
    setEditingId(exp.id);
    setEditingCategory(exp.category);
    setEditingAmount(exp.amount);
    setEditingDescription(exp.description || "");
    setEditingPaidBy(exp.paid_by || "");
  }

  // --- Save edits to an expense ---
  async function handleSaveEditExpense(id) {
    // Validate amount
    if (!editingAmount || isNaN(editingAmount) || Number(editingAmount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    // Validate paidBy
    if (!editingPaidBy) {
      setError("Please select who paid for this expense.");
      return;
    }

    // Update expense in database
    await supabase
      .from("expenses")
      .update({
        category: editingCategory,
        amount: Number(editingAmount),
        description: editingDescription,
        paid_by: editingPaidBy,
      })
      .eq("id", id);
    setEditingId(null);
    setError("");
    fetchExpenses();
  }

  // --- Get the name of the traveller who paid for an expense ---
  function getTravellerName(expense) {
    if (expense.travellers) {
      return expense.travellers.name;
    }
    // Fallback if traveller was deleted
    const traveller = travellers.find((t) => t.id === expense.paid_by);
    return traveller ? traveller.name : "Unknown";
  }

  // --- If no tripId is provided, don't render anything ---
  if (!tripId) return null;

  // --- Render the expense form and expense history list ---
  return (
    <div className="card bg-base-100 shadow mt-3 xs:mt-4 sm:mt-6 rounded-lg w-full max-w-full xs:max-w-[97vw] sm:max-w-[93vw] md:max-w-full">
      <div className="card-body p-3 xs:p-4 sm:p-5">
        <h3 className="card-title flex items-center gap-2 text-lg xs:text-2xl sm:text-3xl md:text-xl lg:text-xl xl:text-xl mb-3 xs:mb-4">
          Add Expense
        </h3>

        {/* Always show the expense form, but disable paidBy and button if no travellers */}
        <form
          className="flex flex-col gap-2 xs:gap-3 mb-3 xs:mb-4"
          onSubmit={handleAddExpense}
        >
          {/* Category dropdown */}
          <select
            className="select select-bordered w-full rounded-lg text-base h-10 xs:h-12"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={adding}
          >
            <option value="">Select expense</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Amount input */}
          <input
            className="input input-bordered w-full rounded-lg text-base h-10 xs:h-12"
            placeholder={`Amount (${currency})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={adding}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
          />

          {/* Paid by dropdown */}
          <select
            className="select select-bordered w-full rounded-lg text-base h-10 xs:h-12"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            disabled={adding || travellers.length === 0}
          >
            {travellers.length === 0 ? (
              <option value="">Add a traveller first</option>
            ) : (
              <>
                <option value="">Who paid?</option>
                {travellers.map((traveller) => (
                  <option key={traveller.id} value={traveller.id}>
                    {traveller.name}
                  </option>
                ))}
              </>
            )}
          </select>

          {/* Description input */}
          <input
            className="input input-bordered w-full rounded-lg text-base h-10 xs:h-12"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={adding}
          />

          {/* Add Expense button */}
          <button
            className="btn btn-primary btn-soft w-full flex items-center gap-2 rounded-lg h-10 xs:h-12 text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm shadow-none"
            disabled={adding || !paidBy || travellers.length === 0}
          >
            <PlusIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4" />
            {adding ? "Adding..." : "Add Expense"}
          </button>
        </form>

        {/* Show error message if any */}
        {error && (
          <div className="alert alert-error mb-3 xs:mb-4 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm py-2">
            {error}
          </div>
        )}

        {/* Expense history section */}
        <h4 className="font-bold text-base xs:text-lg sm:text-xl md:text-xl lg:text-xl xl:text-xl mb-2 xs:mb-3">
          Expense History
        </h4>

        {/* Show loading spinner, empty state, or list of expenses */}
        {loading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-dots loading-md loading-md text-primary"></span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="input input-bordered w-full rounded-lg pointer-events-none cursor-default bg-info/20 text-info font-semibold border-info/20">
            No expenses yet.
          </div>
        ) : (
          <div className="space-y-2 xs:space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="card bg-base-200 shadow rounded-lg p-4 flex flex-col gap-0">
                <div className="text-lg font-bold text-base-content mb-1">
                  {exp.category || 'Expense'}
                </div>
                <div className="text-2xl font-extrabold text-secondary mb-3">
                  {CURRENCY_SYMBOLS[currency] || currency} {Number(exp.amount).toFixed(2)}
                </div>
                <div className="text-xs text-base-content/60 font-medium tracking-wide mt-3">
                  {new Date(exp.created_at).toLocaleDateString()} 
                  <span className="mx-1">&bull;</span>
                  <span className="text-xs text-primary font-semibold">Paid by: {getTravellerName(exp)}</span>
                </div>
                <div className="flex gap-2 absolute top-4 right-4">
                  <button className="btn btn-ghost btn-xs rounded-lg p-1 focus:outline-none focus:ring-0 border-none" title="Edit Expense" onClick={() => handleEditExpense(exp)} type="button">
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button className="btn btn-ghost btn-xs rounded-lg p-1 hover:bg-error/10 focus:bg-error/10 focus:outline-none focus:ring-0 border-none" title="Delete Expense" onClick={() => handleDeleteExpense(exp.id)} type="button">
                    <TrashIcon className="h-4 w-4 text-error" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
