"use client";
// Travellers.js
// Handles adding, editing, and removing travellers for a trip
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ReassignExpensesModal from "./ReassignExpensesModal";

export default function Travellers({ tripId, onTravellersChange, onExpensesChange, expenses = [], onShowToast }) {
  // State for all travellers in the trip
  const [travellers, setTravellers] = useState([]);
  // State for the add traveller form
  const [name, setName] = useState("");
  // Loading state for fetching travellers
  const [loading, setLoading] = useState(true);
  // State for add/edit errors
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  // State for editing a traveller
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  // State for reassign modal
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTravellerId, setReassignTravellerId] = useState(null);
  const [modalExpenses, setModalExpenses] = useState([]);

  // Fetch all travellers for the trip when tripId changes
  useEffect(() => {
    if (tripId) fetchTravellers();
    // eslint-disable-next-line
  }, [tripId]);

  // Fetch all travellers from Supabase
  async function fetchTravellers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("travellers")
      .select("*")
      .eq("trip_id", tripId)
      .order("name", { ascending: true });
    if (!error) setTravellers(data);
    setLoading(false);
  }

  // Handle adding a new traveller
  async function handleAddTraveller(e) {
    e.preventDefault();
    setAdding(true);
    setError("");
    if (!name.trim()) {
      setError("Traveller name is required.");
      setAdding(false);
      return;
    }
    const { error } = await supabase
      .from("travellers")
      .insert([{ name: name.trim(), trip_id: tripId }]);
    if (error) {
      setError(error.message);
    } else {
      setName("");
      fetchTravellers();
      // Notify parent component that travellers changed
      if (onTravellersChange) {
        onTravellersChange();
      }
      if (onShowToast) {
        onShowToast("Traveller added");
      }
    }
    setAdding(false);
  }

  async function handleDeleteTraveller(id) {
    // Check if this traveller is referenced in any expenses
    const referencedExpenses = expenses.filter(exp => exp.paid_by === id);
    if (referencedExpenses.length > 0) {
      setReassignTravellerId(id);
      setModalExpenses(referencedExpenses);
      setShowReassignModal(true);
      return;
    }
    if (!window.confirm("Remove this traveller?")) return;
    await supabase.from("travellers").delete().eq("id", id);
    fetchTravellers();
    if (onTravellersChange) {
      onTravellersChange();
    }
    if (onShowToast) {
      onShowToast("Traveller deleted", "error");
    }
  }

  async function handleReassignAndDelete(reassignments) {
    // Update each expense to the selected new payer
    const updates = Object.entries(reassignments).map(([expenseId, newTravellerId]) =>
      supabase.from("expenses").update({ paid_by: newTravellerId }).eq("id", expenseId)
    );
    await Promise.all(updates);
    // Now delete the traveller
    await supabase.from("travellers").delete().eq("id", reassignTravellerId);
    fetchTravellers();
    if (onTravellersChange) {
      onTravellersChange();
    }
    if (onExpensesChange) {
      await onExpensesChange();
    }
    if (onShowToast) {
      onShowToast("Traveller deleted", "error");
    }
    setShowReassignModal(false);
    setReassignTravellerId(null);
    setModalExpenses([]);
  }

  async function handleEditTraveller(id, currentName) {
    setEditingId(id);
    setEditingName(currentName);
    setError("");
  }

  async function handleSaveEdit(id) {
    if (!editingName.trim()) {
      setError("Traveller name is required.");
      return;
    }
    await supabase
      .from("travellers")
      .update({ name: editingName.trim() })
      .eq("id", id);
    setEditingId(null);
    setEditingName("");
    setError("");
    fetchTravellers();
    // Notify parent component that travellers changed
    if (onTravellersChange) {
      onTravellersChange();
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditingName("");
    setError("");
  }

  if (!tripId) return null;

  return (
    <>
      <ReassignExpensesModal
        open={showReassignModal}
        onClose={() => { setShowReassignModal(false); setReassignTravellerId(null); setModalExpenses([]); }}
        onConfirm={handleReassignAndDelete}
        travellers={travellers}
        excludeTravellerId={reassignTravellerId}
        expenses={modalExpenses}
      />
      <div className="card bg-base-100 shadow mt-3 xs:mt-4 sm:mt-6 rounded-lg w-full max-w-full xs:max-w-[97vw] sm:max-w-[93vw] md:max-w-full">
        <div className="card-body p-3 xs:p-4 sm:p-5">
          <h3 className="card-title flex items-center gap-2 text-lg xs:text-2xl sm:text-3xl md:text-xl lg:text-xl xl:text-xl mb-3 xs:mb-4">
            Travellers
          </h3>

          <form
            className="space-y-2 xs:space-y-3 mb-3 xs:mb-4"
            onSubmit={handleAddTraveller}
          >
            <input
              className="input input-bordered w-full rounded-lg text-base h-10 xs:h-12"
              placeholder="Traveller Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={adding}
            />
            <button
              className="btn btn-primary w-full flex items-center gap-2 rounded-lg h-10 xs:h-12 text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm shadow-none"
              disabled={adding}
            >
              <PlusIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4" />
              {adding ? "Adding..." : "Add Traveller"}
            </button>
          </form>

          {error && (
            <div className="alert alert-error mb-3 xs:mb-4 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm py-2">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-dots loading-md loading-md text-primary loading-md"></span>
            </div>
          ) : travellers.length === 0 ? (
            <div className="input input-bordered w-full rounded-lg pointer-events-none cursor-default bg-info/20 text-info font-semibold border-info/20">
              No travellers yet.
            </div>
          ) : (
            <div className="space-y-2 xs:space-y-3">
              {travellers.map((trav) => (
                <div key={trav.id} className="card bg-base-200 shadow rounded-lg">
                  <div className="card-body p-2 xs:p-3 sm:p-4">
                    {editingId === trav.id ? (
                      <div className="flex flex-col gap-2 xs:gap-3">
                        <input
                          className="input input-bordered w-full rounded-lg text-base h-10 xs:h-12"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Traveller Name"
                        />
                        <div className="flex gap-2">
                          <button
                            className="btn btn-success btn-xs xs:btn-sm md:btn-sm rounded-lg text-xs xs:text-sm md:text-sm lg:text-sm xl:text-sm"
                            onClick={() => handleSaveEdit(trav.id)}
                            type="button"
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-ghost btn-xs xs:btn-sm md:btn-sm rounded-lg text-xs xs:text-sm md:text-sm lg:text-sm xl:text-sm"
                            onClick={handleCancelEdit}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="flex-1 min-w-0 text-sm xs:text-base md:text-base lg:text-base xl:text-base font-medium truncate pr-2">
                          {trav.name}
                        </span>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-ghost btn-xs rounded-lg p-1"
                            onClick={() =>
                              handleEditTraveller(trav.id, trav.name)
                            }
                            title="Edit Traveller"
                            type="button"
                          >
                            <PencilSquareIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs rounded-lg p-1"
                            onClick={() => handleDeleteTraveller(trav.id)}
                            title="Remove Traveller"
                            type="button"
                          >
                            <TrashIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 text-error" />
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
    </>
  );
}
