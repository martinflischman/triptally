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
    <div className="card bg-base-100 shadow mt-6 rounded-md">
      <div className="card-body">
        <h3 className="card-title flex items-center gap-2">Add Expense</h3>
        <form className="flex flex-col gap-2 mb-4" onSubmit={handleAddExpense}>
          <select
            className="select select-bordered w-full rounded-md"
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
            className="input input-bordered w-full rounded-md"
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
            className="input input-bordered w-full rounded-md"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={adding}
          />
          <button
            className="btn btn-secondary flex items-center gap-2 rounded-md"
            disabled={adding}
          >
            <PlusIcon className="h-4 w-4" />
            {adding ? "Adding..." : "Add Expense"}
          </button>
        </form>
        {error && (
          <div className="alert alert-error mb-2 rounded-md">{error}</div>
        )}
        <h4 className="font-bold mt-4 mb-2">Expense History</h4>
        {loading ? (
          <span className="loading loading-spinner loading-md"></span>
        ) : expenses.length === 0 ? (
          <div className="alert alert-info rounded-md">No expenses yet.</div>
        ) : (
          <ul className="divide-y">
            {expenses.map((exp) => (
              <li key={exp.id} className="py-2 flex flex-col">
                {editingId === exp.id ? (
                  <div className="flex flex-col gap-2">
                    <select
                      className="select select-bordered w-full rounded-md"
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
                      className="input input-bordered w-full rounded-md"
                      value={editingAmount}
                      onChange={(e) => setEditingAmount(e.target.value)}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                    />
                    <input
                      className="input input-bordered w-full rounded-md"
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Description (optional)"
                    />
                    <div className="flex gap-2">
                      <button
                        className="btn btn-success btn-xs rounded-md"
                        onClick={() => handleSaveEditExpense(exp.id)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-ghost btn-xs rounded-md"
                        onClick={() => setEditingId(null)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{exp.category}</span>
                      <span className="ml-2">
                        {currency} {Number(exp.amount).toFixed(2)}
                      </span>
                      {exp.description && (
                        <span className="block text-sm text-gray-500">
                          {exp.description}
                        </span>
                      )}
                      <span className="block text-xs text-gray-400">
                        {new Date(exp.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs rounded-md"
                        title="Edit Expense"
                        onClick={() => handleEditExpense(exp)}
                        type="button"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs rounded-md"
                        title="Delete Expense"
                        onClick={() => handleDeleteExpense(exp.id)}
                        type="button"
                      >
                        <TrashIcon className="h-4 w-4 text-error" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
