import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function Travellers({ tripId, onTravellersChange }) {
  const [travellers, setTravellers] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (tripId) fetchTravellers();
    // eslint-disable-next-line
  }, [tripId]);

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
    }
    setAdding(false);
  }

  async function handleDeleteTraveller(id) {
    if (!window.confirm("Remove this traveller?")) return;
    await supabase.from("travellers").delete().eq("id", id);
    fetchTravellers();
    // Notify parent component that travellers changed
    if (onTravellersChange) {
      onTravellersChange();
    }
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
    <div className="card bg-base-100 shadow mt-3 xs:mt-4 sm:mt-6 rounded-lg">
      <div className="card-body p-3 xs:p-4 sm:p-6">
        <h3 className="card-title flex items-center gap-2 text-base xs:text-lg sm:text-xl mb-3 xs:mb-4">
          Travellers
        </h3>

        <form
          className="space-y-2 xs:space-y-3 mb-3 xs:mb-4"
          onSubmit={handleAddTraveller}
        >
          <input
            className="input input-bordered w-full rounded-lg text-sm xs:text-base h-10 xs:h-12"
            placeholder="Traveller Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={adding}
          />
          <button
            className="btn btn-primary w-full flex items-center gap-2 rounded-lg h-10 xs:h-12 text-sm xs:text-base"
            disabled={adding}
          >
            <PlusIcon className="h-4 w-4" />
            {adding ? "Adding..." : "Add"}
          </button>
        </form>

        {error && (
          <div className="alert alert-error mb-3 xs:mb-4 rounded-lg text-sm py-2">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-dots loading-md text-primary loading-md"></span>
          </div>
        ) : travellers.length === 0 ? (
          <div className="alert alert-info rounded-lg text-sm py-2">
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
                        className="input input-bordered w-full rounded-lg text-sm xs:text-base h-10 xs:h-12"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Traveller Name"
                      />
                      <div className="flex gap-2">
                        <button
                          className="btn btn-success btn-xs xs:btn-sm rounded-lg text-xs xs:text-sm"
                          onClick={() => handleSaveEdit(trav.id)}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-ghost btn-xs xs:btn-sm rounded-lg text-xs xs:text-sm"
                          onClick={handleCancelEdit}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="flex-1 min-w-0 text-sm xs:text-base font-medium truncate pr-2">
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
                          <PencilSquareIcon className="h-3 w-3 xs:h-4 xs:w-4" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs rounded-lg p-1"
                          onClick={() => handleDeleteTraveller(trav.id)}
                          title="Remove Traveller"
                          type="button"
                        >
                          <TrashIcon className="h-3 w-3 xs:h-4 xs:w-4 text-error" />
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
