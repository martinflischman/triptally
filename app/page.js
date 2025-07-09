// page.js
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

  // States for travellers and expenses of selected trip
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
      .eq("trip_id", tripId)
      .order("name", { ascending: true });

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

  // Function to refresh travellers data
  const refreshTravellers = () => {
    if (selectedTrip) {
      fetchTripData(selectedTrip.id);
    }
  };

  // Function to refresh expenses data
  const refreshExpenses = () => {
    if (selectedTrip) {
      fetchTripData(selectedTrip.id);
    }
  };

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
      <div className="container mx-auto px-3 py-4 xs:py-6 sm:py-8 max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl xl:max-w-xl">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 xs:mb-6 sm:mb-8 flex items-center gap-2 text-center text-primary">
            <MapIcon className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
            TripTally
          </h1>

          {!selectedTrip && (
            <>
              <form
                className="card bg-base-100 shadow w-full mb-4 xs:mb-6 sm:mb-8 rounded-lg"
                onSubmit={handleCreateTrip}
              >
                <div className="card-body p-3 xs:p-4 sm:p-6">
                  <h2 className="card-title text-base xs:text-lg sm:text-xl lg:text-2xl mb-3 xs:mb-4">
                    Create a New Trip
                  </h2>
                  <input
                    className="input input-bordered w-full rounded-lg mb-3 xs:mb-4 text-sm xs:text-base md:text-lg lg:text-xl h-10 xs:h-12"
                    placeholder="Trip Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={creating}
                  />
                  <select
                    className="select select-bordered w-full rounded-lg mb-3 xs:mb-4 text-sm xs:text-base md:text-lg lg:text-xl h-10 xs:h-12"
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
                    <div className="alert alert-error rounded-lg mb-3 xs:mb-4 text-sm xs:text-base md:text-lg py-2">
                      {error}
                    </div>
                  )}
                  <button
                    className="btn btn-primary w-full rounded-lg flex items-center gap-2 h-10 xs:h-12 text-sm xs:text-base md:text-lg lg:text-xl"
                    disabled={creating}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 xs:h-5 xs:w-5 lg:h-6 lg:w-6"
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
                <div className="flex justify-center py-4">
                  <span className="loading loading-dots text-primary loading-lg"></span>
                </div>
              ) : (
                <div className="space-y-3 xs:space-y-4 w-full">
                  {trips.length === 0 ? (
                    <div className="alert alert-info rounded-lg text-sm xs:text-base md:text-lg py-2">
                      No trips found.
                    </div>
                  ) : (
                    trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="card bg-base-100 shadow rounded-lg"
                      >
                        <div className="card-body p-3 xs:p-4 sm:p-6">
                          <div className="flex items-start justify-between">
                            {editingTripId === trip.id ? (
                              <div className="flex-1">
                                <input
                                  className="input input-bordered w-full mb-2 rounded-lg text-sm xs:text-base md:text-lg lg:text-xl h-10 xs:h-12"
                                  value={editingTripName}
                                  onChange={(e) =>
                                    setEditingTripName(e.target.value)
                                  }
                                />
                                <select
                                  className="select select-bordered w-full mb-2 rounded-lg text-sm xs:text-base md:text-lg lg:text-xl h-10 xs:h-12"
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
                                    className="btn btn-success btn-xs xs:btn-sm md:btn-md rounded-lg text-xs xs:text-sm md:text-base lg:text-lg"
                                    onClick={() => handleSaveEditTrip(trip.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs xs:btn-sm md:btn-md rounded-lg text-xs xs:text-sm md:text-base lg:text-lg"
                                    onClick={() => setEditingTripId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1">
                                  <h2 className="card-title text-base xs:text-lg sm:text-xl lg:text-2xl">
                                    {trip.name}
                                  </h2>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    className="btn btn-ghost btn-xs rounded-lg p-1"
                                    title="Edit Trip"
                                    onClick={() => handleEditTrip(trip)}
                                  >
                                    <PencilSquareIcon className="h-4 w-4 xs:h-5 xs:w-5 lg:h-6 lg:w-6" />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs rounded-lg p-1"
                                    title="Delete Trip"
                                    onClick={() => handleDeleteTrip(trip.id)}
                                  >
                                    <TrashIcon className="h-4 w-4 xs:h-5 xs:w-5 lg:h-6 lg:w-6 text-error" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          {editingTripId !== trip.id && (
                            <button
                              className="btn btn-outline btn-sm w-full mt-3 xs:mt-4 flex items-center gap-2 rounded-lg h-10 xs:h-12 text-sm xs:text-base md:text-lg lg:text-xl"
                              onClick={() => setSelectedTrip(trip)}
                            >
                              <MapIcon className="h-4 w-4 xs:h-5 xs:w-5" />
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
                className="btn btn-sm mb-3 xs:mb-4 rounded-lg text-xs xs:text-sm md:text-base lg:text-lg h-8 xs:h-10"
                onClick={handleBack}
              >
                ← Back to Trips
              </button>

              <div className="card bg-base-100 shadow mb-3 xs:mb-4 rounded-lg">
                <div className="card-body p-3 xs:p-4 sm:p-6">
                  <h2 className="card-title text-base xs:text-lg sm:text-xl lg:text-2xl mb-2 xs:mb-3">
                    {selectedTrip.name}
                  </h2>
                  <div className="text-xs xs:text-sm md:text-base lg:text-lg text-base-content/70 mb-3 xs:mb-4">
                    Currency: {CURRENCY_SYMBOLS[selectedTrip.currency]}{" "}
                    {selectedTrip.currency}
                  </div>

                  {/* Show loading state if fetching trip data */}
                  {loadingTripData ? (
                    <div className="flex justify-center py-4">
                      <span className="loading loading-dots text-primary loading-sm"></span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                      <div className="bg-secondary/10 p-2 xs:p-3 rounded-lg border border-secondary/20">
                        <div className="text-xs xs:text-sm md:text-base lg:text-lg text-base-content/70 mb-1">
                          Total Expenses
                        </div>
                        <div className="text-base xs:text-lg md:text-xl lg:text-2xl font-semibold text-secondary">
                          {CURRENCY_SYMBOLS[selectedTrip.currency]}{" "}
                          {totalExpense.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-primary/10 p-2 xs:p-3 rounded-lg border border-primary/20">
                        <div className="text-xs xs:text-sm md:text-base lg:text-lg text-base-content/70 mb-1">
                          Per Traveller
                        </div>
                        <div className="text-lg xs:text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                          {CURRENCY_SYMBOLS[selectedTrip.currency]}{" "}
                          {perTraveller.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pass refresh functions and data to components */}
              <Travellers
                tripId={selectedTrip.id}
                onTravellersChange={refreshTravellers}
              />
              <Expenses
                tripId={selectedTrip.id}
                currency={selectedTrip.currency}
                currencySymbol={CURRENCY_SYMBOLS[selectedTrip.currency]}
                travellers={travellers}
                onExpensesChange={refreshExpenses}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
