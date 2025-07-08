"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Travellers from "../components/Travellers";
import Expenses from "../components/Expenses";
import {
  TrashIcon,
  PencilSquareIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

// Currency symbols for display in Expenses
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

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);

  // For editing trips
  const [editingTripId, setEditingTripId] = useState(null);
  const [editingTripName, setEditingTripName] = useState("");
  const [editingTripCurrency, setEditingTripCurrency] = useState("USD");

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    setLoading(true);
    const { data, error } = await supabase.from("trips").select("*");
    if (!error) setTrips(data);
    setLoading(false);
  }

  async function handleCreateTrip(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    if (!name) {
      setError("Trip name is required.");
      setCreating(false);
      return;
    }
    if (!currency) {
      setError("Currency is required.");
      setCreating(false);
      return;
    }
    const { error } = await supabase.from("trips").insert([{ name, currency }]);
    if (error) {
      setError(error.message);
    } else {
      setName("");
      setCurrency("");
      fetchTrips();
    }
    setCreating(false);
  }

  async function handleDeleteTrip(id) {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    await supabase.from("trips").delete().eq("id", id);
    fetchTrips();
  }

  function handleBack() {
    setSelectedTrip(null);
  }

  function handleEditTrip(trip) {
    setEditingTripId(trip.id);
    setEditingTripName(trip.name);
    setEditingTripCurrency(trip.currency);
  }

  async function handleSaveEditTrip(id) {
    if (!editingTripName) return;
    await supabase
      .from("trips")
      .update({ name: editingTripName, currency: editingTripCurrency })
      .eq("id", id);
    setEditingTripId(null);
    setEditingTripName("");
    setEditingTripCurrency("USD");
    fetchTrips();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-base-200 pb-8">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-2">
        <MapIcon className="h-8 w-8 text-primary" />
        TripTally
      </h1>
      {!selectedTrip && (
        <>
          <form
            className="card bg-base-100 shadow w-full max-w-md mb-8 rounded-md"
            onSubmit={handleCreateTrip}
          >
            <div className="card-body">
              <h2 className="card-title">Create a New Trip</h2>
              <input
                className="input input-bordered w-full rounded-md"
                placeholder="Trip Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={creating}
              />
              <select
                className="select select-bordered w-full rounded-md"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={creating}
              >
                <option value="">Select currency</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="ZAR">ZAR</option>
                <option value="INR">INR</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="JPY">JPY</option>
                <option value="CNY">CNY</option>
                {/* Add more as needed */}
              </select>
              {error && (
                <div className="alert alert-error rounded-md">{error}</div>
              )}
              <button
                className="btn btn-primary w-full rounded-md flex items-center gap-2"
                disabled={creating}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {creating ? "Creating..." : "Add Trip"}
              </button>
            </div>
          </form>
          {loading ? (
            <span className="loading loading-spinner loading-lg"></span>
          ) : (
            <div className="w-full max-w-md space-y-4 pb-8">
              {trips.length === 0 ? (
                <div className="alert alert-info rounded-md">
                  No trips found.
                </div>
              ) : (
                trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="card bg-base-100 shadow rounded-md"
                  >
                    <div className="card-body">
                      <div className="flex items-start justify-between">
                        {editingTripId === trip.id ? (
                          <div className="flex-1">
                            <input
                              className="input input-bordered w-full mb-2 rounded-md"
                              value={editingTripName}
                              onChange={(e) =>
                                setEditingTripName(e.target.value)
                              }
                            />
                            <select
                              className="select select-bordered w-full mb-2 rounded-md"
                              value={editingTripCurrency}
                              onChange={(e) =>
                                setEditingTripCurrency(e.target.value)
                              }
                            >
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                              <option value="ZAR">ZAR</option>
                              <option value="INR">INR</option>
                              <option value="AUD">AUD</option>
                              <option value="CAD">CAD</option>
                              <option value="JPY">JPY</option>
                              <option value="CNY">CNY</option>
                            </select>
                            <div className="flex gap-2 mt-2">
                              <button
                                className="btn btn-success btn-xs rounded-md"
                                onClick={() => handleSaveEditTrip(trip.id)}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-ghost btn-xs rounded-md"
                                onClick={() => setEditingTripId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <h2 className="card-title">{trip.name}</h2>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                className="btn btn-ghost btn-xs rounded-md"
                                title="Edit Trip"
                                onClick={() => handleEditTrip(trip)}
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button
                                className="btn btn-ghost btn-xs rounded-md"
                                title="Delete Trip"
                                onClick={() => handleDeleteTrip(trip.id)}
                              >
                                <TrashIcon className="h-5 w-5 text-error" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                      {editingTripId !== trip.id && (
                        <button
                          className="btn btn-outline btn-sm w-full mt-4 flex items-center gap-2 rounded-md"
                          onClick={() => setSelectedTrip(trip)}
                        >
                          <MapIcon className="h-4 w-4" />
                          View Trip
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
      {selectedTrip && (
        <div className="w-full max-w-md pb-8">
          <button className="btn btn-sm mb-4 rounded-md" onClick={handleBack}>
            ← Back to Trips
          </button>
          <div className="card bg-base-100 shadow mb-4 rounded-md">
            <div className="card-body">
              <h2 className="card-title">{selectedTrip.name}</h2>
              <p className="text-gray-500">
                {CURRENCY_SYMBOLS[selectedTrip.currency] ||
                  selectedTrip.currency}{" "}
                {selectedTrip.currency}
              </p>
            </div>
          </div>
          <Travellers tripId={selectedTrip.id} />
          <Expenses tripId={selectedTrip.id} currency={selectedTrip.currency} />
        </div>
      )}
    </main>
  );
}
