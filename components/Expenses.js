// Expenses.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const CATEGORY_OPTIONS = [
  "Accommodation",
  "Transport",
  "Food & Drink",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Other",
].sort();

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
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(CATEGORY_OPTIONS[0]);
  const [editingAmount, setEditingAmount] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingPaidBy, setEditingPaidBy] = useState("");

  useEffect(() => {
    if (tripId) fetchExpenses();
    // eslint-disable-next-line
  }, [tripId]);

  // Reset paidBy when travellers change
  useEffect(() => {
    // Clear paidBy if selected traveller no longer exists
    if (paidBy && !travellers.find((t) => t.id === paidBy)) {
      setPaidBy("");
    }
  }, [travellers, paidBy]);

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

  async function handleAddExpense(e) {
    e.preventDefault();
    setAdding(true);
    setError("");

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      setAdding(false);
      return;
    }

    if (!paidBy) {
      setError("Please select who paid for this expense.");
      setAdding(false);
      return;
    }

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

  function handleEditExpense(exp) {
    setEditingId(exp.id);
    setEditingCategory(exp.category);
    setEditingAmount(exp.amount);
    setEditingDescription(exp.description || "");
    setEditingPaidBy(exp.paid_by || "");
  }

  async function handleSaveEditExpense(id) {
    if (!editingAmount || isNaN(editingAmount) || Number(editingAmount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!editingPaidBy) {
      setError("Please select who paid for this expense.");
      return;
    }

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

  function getTravellerName(expense) {
    if (expense.travellers) {
      return expense.travellers.name;
    }
    // Fallback if traveller was deleted
    const traveller = travellers.find((t) => t.id === expense.paid_by);
    return traveller ? traveller.name : "Unknown";
  }

  if (!tripId) return null;

  return (
    <div className="card bg-base-100 shadow mt-3 xs:mt-4 sm:mt-6 rounded-lg w-full max-w-full xs:max-w-[97vw] sm:max-w-[93vw] md:max-w-full">
      <div className="card-body p-3 xs:p-4 sm:p-5">
        <h3 className="card-title flex items-center gap-2 text-lg xs:text-2xl sm:text-3xl md:text-xl lg:text-xl xl:text-xl mb-3 xs:mb-4">
          Add Expense
        </h3>

        {travellers.length === 0 ? (
          <div className="mb-3 xs:mb-4 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm py-2 bg-warning/20 text-warning font-semibold border border-warning/20">
            Add travellers first to assign expenses.
          </div>
        ) : (
          <form
            className="flex flex-col gap-2 xs:gap-3 mb-3 xs:mb-4"
            onSubmit={handleAddExpense}
          >
            <select
              className="select select-bordered w-full rounded-lg text-base h-10 xs:h-12"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={adding}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

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

            <select
              className="select select-bordered w-full rounded-lg text-base h-10 xs:h-12"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              disabled={adding}
            >
              <option value="">Who paid?</option>
              {travellers.map((traveller) => (
                <option key={traveller.id} value={traveller.id}>
                  {traveller.name}
                </option>
              ))}
            </select>

            <input
              className="input input-bordered w-full rounded-lg text-base h-10 xs:h-12"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={adding}
            />

            <button
              className="btn btn-primary w-full flex items-center gap-2 rounded-lg h-10 xs:h-12 text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm"
              disabled={adding || !paidBy}
            >
              <PlusIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4" />
              {adding ? "Adding..." : "Add Expense"}
            </button>
          </form>
        )}

        {error && (
          <div className="alert alert-error mb-3 xs:mb-4 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm py-2">
            {error}
          </div>
        )}

        <h4 className="font-bold text-base xs:text-lg sm:text-xl md:text-xl lg:text-xl xl:text-xl mb-2 xs:mb-3">
          Expense History
        </h4>

        {loading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-dots loading-md loading-md text-primary"></span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="rounded-lg text-sm xs:text-base md:text-sm lg:text-sm py-2 bg-info/20 text-info font-semibold border border-info/20">
            No expenses yet.
          </div>
        ) : (
          <div className="space-y-2 xs:space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="card bg-base-200 shadow rounded-lg">
                <div className="card-body p-2 xs:p-3 sm:p-4">
                  {editingId === exp.id ? (
                    <div className="flex flex-col gap-2 xs:gap-3">
                      <select
                        className="select select-bordered w-full rounded-lg text-base h-10 xs:h-12"
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      <input
                        className="input input-bordered w-full rounded-lg text-base h-10 xs:h-12"
                        value={editingAmount}
                        onChange={(e) => setEditingAmount(e.target.value)}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                      />

                      <select
                        className="select select-bordered w-full rounded-lg text-base h-10 xs:h-12"
                        value={editingPaidBy}
                        onChange={(e) => setEditingPaidBy(e.target.value)}
                      >
                        <option value="">Who paid?</option>
                        {travellers.map((traveller) => (
                          <option key={traveller.id} value={traveller.id}>
                            {traveller.name}
                          </option>
                        ))}
                      </select>

                      <input
                        className="input input-bordered w-full rounded-lg text-base h-10 xs:h-12"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        placeholder="Description (optional)"
                      />

                      <div className="flex gap-2">
                        <button
                          className="btn btn-success btn-xs xs:btn-sm md:btn-sm rounded-lg text-xs xs:text-sm md:text-sm lg:text-sm xl:text-sm"
                          onClick={() => handleSaveEditExpense(exp.id)}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-ghost btn-xs xs:btn-sm md:btn-sm rounded-lg text-xs xs:text-sm md:text-sm lg:text-sm xl:text-sm"
                          onClick={() => setEditingId(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex flex-row justify-between items-start">
                        {/* Top row: Date and Paid by, and action icons */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs xs:text-sm md:text-sm lg:text-sm xl:text-sm text-base-content/50">
                            {new Date(exp.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs xs:text-sm md:text-sm lg:text-sm xl:text-sm text-primary font-semibold">
                            · Paid by: {getTravellerName(exp)}
                          </span>
                        </div>
                        <div className="flex flex-row gap-1 ml-2 xs:ml-3">
                          <button
                            className="btn btn-ghost btn-xs rounded-lg p-1"
                            title="Edit Expense"
                            onClick={() => handleEditExpense(exp)}
                            type="button"
                          >
                            <PencilSquareIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs rounded-lg p-1"
                            title="Delete Expense"
                            onClick={() => handleDeleteExpense(exp.id)}
                            type="button"
                          >
                            <TrashIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 text-error" />
                          </button>
                        </div>
                      </div>
                      {/* Small space */}
                      <div className="h-1" />
                      {/* Category */}
                      <div className="font-semibold text-xs xs:text-sm sm:text-base md:text-base lg:text-base xl:text-base truncate mb-1">
                        {exp.category}
                      </div>
                      {/* Description below category, if present */}
                      {exp.description && (
                        <div className="text-xs xs:text-sm md:text-sm lg:text-sm xl:text-sm text-base-content/70 mb-1 line-clamp-2">
                          {exp.description}
                        </div>
                      )}
                      {/* Amount */}
                      <div className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-xl xl:text-xl font-bold text-secondary mt-1">
                        {CURRENCY_SYMBOLS[currency]} {Number(exp.amount).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
