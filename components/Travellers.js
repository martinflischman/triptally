import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function Travellers({ tripId }) {
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
    if (!name) {
      setError("Traveller name is required.");
      setAdding(false);
      return;
    }
    const { error } = await supabase
      .from("travellers")
      .insert([{ name, trip_id: tripId }]);
    if (error) {
      setError(error.message);
    } else {
      setName("");
      fetchTravellers();
    }
    setAdding(false);
  }

  async function handleDeleteTraveller(id) {
    await supabase.from("travellers").delete().eq("id", id);
    fetchTravellers();
  }

  async function handleEditTraveller(id, currentName) {
    setEditingId(id);
    setEditingName(currentName);
  }

  async function handleSaveEdit(id) {
    if (!editingName) return;
    await supabase
      .from("travellers")
      .update({ name: editingName })
      .eq("id", id);
    setEditingId(null);
    setEditingName("");
    fetchTravellers();
  }

  if (!tripId) return null;

  return (
    <div className="card bg-base-100 shadow mt-6 rounded-md">
      <div className="card-body">
        <h3 className="card-title flex items-center gap-2">Travellers</h3>
        <form className="flex gap-2 mb-4" onSubmit={handleAddTraveller}>
          <input
            className="input input-bordered flex-1 rounded-md"
            placeholder="Traveller Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={adding}
          />
          <button
            className="btn btn-secondary flex items-center gap-2 rounded-md"
            disabled={adding}
          >
            <PlusIcon className="h-4 w-4" />
            {adding ? "Adding..." : "Add"}
          </button>
        </form>
        {error && (
          <div className="alert alert-error mb-2 rounded-md">{error}</div>
        )}
        {loading ? (
          <span className="loading loading-spinner loading-md"></span>
        ) : travellers.length === 0 ? (
          <div className="alert alert-info rounded-md">No travellers yet.</div>
        ) : (
          <div className="grid gap-2">
            {travellers.map((trav) => (
              <div
                key={trav.id}
                className="card bg-base-200 shadow flex flex-row items-center p-2 rounded-md"
              >
                {editingId === trav.id ? (
                  <>
                    <input
                      className="input input-bordered flex-1 rounded-md"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                    <button
                      className="btn btn-success btn-xs ml-2 rounded-md"
                      onClick={() => handleSaveEdit(trav.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-ghost btn-xs ml-2 rounded-md"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{trav.name}</span>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs rounded-md"
                        onClick={() => handleEditTraveller(trav.id, trav.name)}
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs rounded-md"
                        onClick={() => handleDeleteTraveller(trav.id)}
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4 text-error" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
