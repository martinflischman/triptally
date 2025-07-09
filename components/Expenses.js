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

export default function Expenses({ tripId, currency }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(CATEGORY_OPTIONS[0]);
  const [editingAmount, setEditingAmount] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  useEffect(() => {
    if (tripId) fetchExpenses();
    // eslint-disable-next-line
  }, [tripId]);

  async function fetchExpenses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
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
    const { error } = await supabase.from("expenses").insert([
      {
        trip_id: tripId,
        category,
        amount: Number(amount),
        description,
      },
    ]);
    if (error) {
      setError(error.message);
    } else {
      setAmount("");
      setDescription("");
      fetchExpenses();
    }
    setAdding(false);
  }

  async function handleDeleteExpense(id) {
    if (!window.confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id", id);
    fetchExpenses();
  }

  function handleEditExpense(exp) {
    setEditingId(exp.id);
    setEditingCategory(exp.category);
    setEditingAmount(exp.amount);
    setEditingDescription(exp.description || "");
  }

  async function handleSaveEditExpense(id) {
    if (!editingAmount || isNaN(editingAmount) || Number(editingAmount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    await supabase
      .from("expenses")
      .update({
        category: editingCategory,
        amount: Number(editingAmount),
        description: editingDescription,
      })
      .eq("id", id);
    setEditingId(null);
    setError("");
    fetchExpenses();
  }

  if (!tripId) return null;

  return (
    <div className="card bg-base-100 shadow mt-4 sm:mt-6 rounded-lg">
      <div className="card-body p-4 sm:p-6">
        <h3 className="card-title flex items-center gap-2 text-lg sm:text-xl mb-4">
          Add Expense
        </h3>
        <form className="flex flex-col gap-3 mb-4" onSubmit={handleAddExpense}>
          <select
            className="select select-bordered w-full rounded-lg"
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
            className="input input-bordered w-full rounded-lg"
            placeholder={`Amount (${currency})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={adding}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
          />
          <input
            className="input input-bordered w-full rounded-lg"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={adding}
          />
          <button
            className="btn btn-primary w-full flex items-center gap-2 rounded-lg"
            disabled={adding}
          >
            <PlusIcon className="h-4 w-4" />
            {adding ? "Adding..." : "Add Expense"}
          </button>
        </form>
        {error && (
          <div className="alert alert-error mb-4 rounded-lg">{error}</div>
        )}

        <h4 className="font-bold text-lg mb-3">Expense History</h4>
        {loading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="alert alert-info rounded-lg">No expenses yet.</div>
        ) : (
          <div className="space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="card bg-base-200 shadow rounded-lg">
                <div className="card-body p-3 sm:p-4">
                  {editingId === exp.id ? (
                    <div className="flex flex-col gap-3">
                      <select
                        className="select select-bordered w-full rounded-lg"
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
                        className="input input-bordered w-full rounded-lg"
                        value={editingAmount}
                        onChange={(e) => setEditingAmount(e.target.value)}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                      />
                      <input
                        className="input input-bordered w-full rounded-lg"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        placeholder="Description (optional)"
                      />
                      <div className="flex gap-2">
                        <button
                          className="btn btn-success btn-sm rounded-lg"
                          onClick={() => handleSaveEditExpense(exp.id)}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-ghost btn-sm rounded-lg"
                          onClick={() => setEditingId(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm sm:text-base">
                            {exp.category}
                          </span>
                          <span className="text-lg sm:text-xl font-bold text-secondary">
                            {CURRENCY_SYMBOLS[currency]}{" "}
                            {Number(exp.amount).toFixed(2)}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-sm text-base-content/70 mb-1">
                            {exp.description}
                          </p>
                        )}
                        <span className="text-xs text-base-content/50">
                          {new Date(exp.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-1 ml-3">
                        <button
                          className="btn btn-ghost btn-xs rounded-lg"
                          title="Edit Expense"
                          onClick={() => handleEditExpense(exp)}
                          type="button"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs rounded-lg"
                          title="Delete Expense"
                          onClick={() => handleDeleteExpense(exp.id)}
                          type="button"
                        >
                          <TrashIcon className="h-4 w-4 text-error" />
                        </button>
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
