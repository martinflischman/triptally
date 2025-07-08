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
  const [editingTripId, setEditingTripId] = useState(null);
  const [editingTripName, setEditingTripName] = useState("");
  const [editingTripCurrency, setEditingTripCurrency] = useState("USD");

  // New states for travellers and expenses of selected trip
  const [travellers, setTravellers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loadingTripData, setLoadingTripData] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  // When a trip is selected, fetch its travellers and expenses
  useEffect(() => {
    if (!selectedTrip) {
      setTravellers([]);
      setExpenses([]);
      return;
    }
    fetchTripData(selectedTrip.id);
  }, [selectedTrip]);

  async function fetchTrips() {
    setLoading(true);
    const { data, error } = await supabase.from("trips").select("*");
    if (!error) setTrips(data);
    setLoading(false);
  }

  // Fetch travellers and expenses for the selected trip
  async function fetchTripData(tripId) {
    setLoadingTripData(true);

    // Fetch travellers
    const { data: travellersData, error: travellersError } = await supabase
      .from("travellers")
      .select("*")
      .eq("trip_id", tripId);

    if (!travellersError) setTravellers(travellersData || []);
    else setTravellers([]);

    // Fetch expenses
    const { data: expensesData, error: expensesError } = await supabase
      .from("expenses")
      .select("*")
      .eq("trip_id", tripId);

    if (!expensesError) setExpenses(expensesData || []);
    else setExpenses([]);

    setLoadingTripData(false);
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

  // Calculate total expense sum
  const totalExpense = expenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );

  // Calculate amount per traveller safely
  const perTraveller = travellers.length ? totalExpense / travellers.length : 0;

  return (
    <main className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 flex items-center gap-2 text-center">
            <MapIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            TripTally
          </h1>

          {!selectedTrip && (
            <>
              <form
                className="card bg-base-100 shadow w-full mb-6 sm:mb-8 rounded-lg"
                onSubmit={handleCreateTrip}
              >
                <div className="card-body p-4 sm:p-6">
                  <h2 className="card-title text-lg sm:text-xl mb-4">
                    Create a New Trip
                  </h2>
                  <input
                    className="input input-bordered w-full rounded-lg mb-4"
                    placeholder="Trip Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={creating}
                  />
                  <select
                    className="select select-bordered w-full rounded-lg mb-4"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={creating}
                  >
                    <option value="">Select currency</option>
                    {Object.keys(CURRENCY_SYMBOLS).map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                  {error && (
                    <div className="alert alert-error rounded-lg mb-4">
                      {error}
                    </div>
                  )}
                  <button
                    className="btn btn-primary w-full rounded-lg flex items-center gap-2"
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
                <div className="flex justify-center">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  {trips.length === 0 ? (
                    <div className="alert alert-info rounded-lg">
                      No trips found.
                    </div>
                  ) : (
                    trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="card bg-base-100 shadow rounded-lg"
                      >
                        <div className="card-body p-4 sm:p-6">
                          <div className="flex items-start justify-between">
                            {editingTripId === trip.id ? (
                              <div className="flex-1">
                                <input
                                  className="input input-bordered w-full mb-2 rounded-lg"
                                  value={editingTripName}
                                  onChange={(e) =>
                                    setEditingTripName(e.target.value)
                                  }
                                />
                                <select
                                  className="select select-bordered w-full mb-2 rounded-lg"
                                  value={editingTripCurrency}
                                  onChange={(e) =>
                                    setEditingTripCurrency(e.target.value)
                                  }
                                >
                                  {Object.keys(CURRENCY_SYMBOLS).map((code) => (
                                    <option key={code} value={code}>
                                      {code}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    className="btn btn-success btn-xs rounded-lg"
                                    onClick={() => handleSaveEditTrip(trip.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs rounded-lg"
                                    onClick={() => setEditingTripId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1">
                                  <h2 className="card-title text-lg sm:text-xl">
                                    {trip.name}
                                  </h2>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    className="btn btn-ghost btn-xs rounded-lg"
                                    title="Edit Trip"
                                    onClick={() => handleEditTrip(trip)}
                                  >
                                    <PencilSquareIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs rounded-lg"
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
                              className="btn btn-outline btn-sm w-full mt-4 flex items-center gap-2 rounded-lg"
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

          {/* Selected Trip View */}
          {selectedTrip && (
            <div className="w-full">
              <button
                className="btn btn-sm mb-4 rounded-lg"
                onClick={handleBack}
              >
                ← Back to Trips
              </button>

              <div className="card bg-base-100 shadow mb-4 rounded-lg">
                <div className="card-body p-4 sm:p-6">
                  <h2 className="card-title text-lg sm:text-xl">
                    {selectedTrip.name}
                  </h2>
                  <p className="text-gray-500 mb-2">
                    Currency: {CURRENCY_SYMBOLS[selectedTrip.currency]}{" "}
                    {selectedTrip.currency}
                  </p>

                  {/* Show loading state if fetching trip data */}
                  {loadingTripData ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <p className="font-semibold">
                        Total Expenses:{" "}
                        {CURRENCY_SYMBOLS[selectedTrip.currency]}{" "}
                        {totalExpense.toFixed(2)}
                      </p>
                      <p className="font-semibold">
                        Per Traveller: {CURRENCY_SYMBOLS[selectedTrip.currency]}{" "}
                        {perTraveller.toFixed(2)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Pass tripId and currency as before */}
              <Travellers tripId={selectedTrip.id} />
              <Expenses
                tripId={selectedTrip.id}
                currency={selectedTrip.currency}
                currencySymbol={CURRENCY_SYMBOLS[selectedTrip.currency]}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
