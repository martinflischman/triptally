// page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Travellers from "../components/Travellers";
import Expenses from "../components/Expenses";
import Toast from "../components/Toast";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
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
  const [editingTripStartDate, setEditingTripStartDate] = useState("");
  const [editingTripEndDate, setEditingTripEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // States for travellers and expenses of selected trip
  const [travellers, setTravellers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loadingTripData, setLoadingTripData] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  function showToast(message, type = "success") {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  }

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  function handleRequestDeleteTrip(trip) {
    setTripToDelete(trip);
    setConfirmDeleteOpen(true);
  }

  async function handleDeleteTripConfirmed() {
    if (!tripToDelete) return;
    await supabase.from("trips").delete().eq("id", tripToDelete.id);
    fetchTrips();
    setConfirmDeleteOpen(false);
    setTripToDelete(null);
    showToast("Trip deleted", "error");
  }

  const subscriptionsRef = useRef({});

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

  useEffect(() => {
    if (!selectedTrip) return;

    // Clean up previous subscriptions
    if (subscriptionsRef.current.travellers) subscriptionsRef.current.travellers.unsubscribe();
    if (subscriptionsRef.current.expenses) subscriptionsRef.current.expenses.unsubscribe();

    // Subscribe to travellers
    subscriptionsRef.current.travellers = supabase
      .channel('public:travellers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'travellers', filter: `trip_id=eq.${selectedTrip.id}` },
        () => fetchTripData(selectedTrip.id)
      )
      .subscribe();

    // Subscribe to expenses
    subscriptionsRef.current.expenses = supabase
      .channel('public:expenses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `trip_id=eq.${selectedTrip.id}` },
        () => fetchTripData(selectedTrip.id)
      )
      .subscribe();

    // Cleanup on unmount or trip change
    return () => {
      if (subscriptionsRef.current.travellers) subscriptionsRef.current.travellers.unsubscribe();
      if (subscriptionsRef.current.expenses) subscriptionsRef.current.expenses.unsubscribe();
    };
  }, [selectedTrip]);

  async function fetchTrips() {
    setLoading(true);
    const { data, error } = await supabase.from("trips").select("*");
    if (!error) {
      // Sort by start_date ascending
      data.sort((a, b) => (a.start_date || "") > (b.start_date || "") ? 1 : -1);
      setTrips(data);
    }
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
    if (!startDate) {
      setError("Start date is required.");
      setCreating(false);
      return;
    }
    if (!endDate) {
      setError("End date is required.");
      setCreating(false);
      return;
    }
    const { error } = await supabase.from("trips").insert([{ name, currency, start_date: startDate, end_date: endDate }]);
    if (error) {
      setError(error.message);
    } else {
      setName("");
      setCurrency("");
      setStartDate("");
      setEndDate("");
      fetchTrips();
      showToast("Trip added", "success");
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
    setEditingTripStartDate(trip.start_date || "");
    setEditingTripEndDate(trip.end_date || "");
  }

  async function handleSaveEditTrip(id) {
    if (!editingTripName) return;
    if (!editingTripCurrency) return;
    if (!editingTripStartDate) return;
    if (!editingTripEndDate) return;
    await supabase
      .from("trips")
      .update({
        name: editingTripName,
        currency: editingTripCurrency,
        start_date: editingTripStartDate,
        end_date: editingTripEndDate,
      })
      .eq("id", id);
    setEditingTripId(null);
    setEditingTripName("");
    setEditingTripCurrency("USD");
    setEditingTripStartDate("");
    setEditingTripEndDate("");
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
      <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        onClose={() => { setConfirmDeleteOpen(false); setTripToDelete(null); }}
        onConfirm={handleDeleteTripConfirmed}
        title="Delete Trip?"
        message="Are you sure you want to delete this trip? This will permanently delete all trip information and cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
      <div className="container mx-auto px-3 xs:px-4 sm:px-5 py-4 xs:py-5 sm:py-6 max-w-full xs:max-w-[97vw] sm:max-w-[93vw] md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
        <div className="flex flex-col items-center">
          <h1 className="mt-4 xs:mt-6 sm:mt-8 text-2xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-3xl xl:text-3xl font-bold mb-4 xs:mb-6 sm:mb-8 flex items-center gap-2 text-center text-primary">
            <MapIcon className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 md:h-10 md:w-10 lg:h-6 lg:w-6 xl:h-6 xl:w-6" />
            TripTally
          </h1>

          {!selectedTrip && (
            <>
              <form
                className="card bg-base-100 shadow w-full mb-4 xs:mb-6 sm:mb-8 rounded-lg"
                onSubmit={handleCreateTrip}
              >
                <div className="card-body p-3 xs:p-4 sm:p-6">
                  <h2 className="card-title text-base xs:text-lg sm:text-xl md:text-lg lg:text-lg xl:text-lg mb-3 xs:mb-4">
                    Create a New Trip
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 mb-3 xs:mb-4">
                    <input
                      className="input input-bordered w-full sm:w-2/3 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                      placeholder="Trip Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={creating}
                    />
                    <select
                      className="select select-bordered w-full sm:w-1/3 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
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
                  </div>
                  <div className="flex flex-row gap-3 mb-3 xs:mb-4">
                    <div className="flex-1">
                      <label className="block text-xs xs:text-sm mb-1 font-medium">Trip Start Date</label>
                      <input
                        type="date"
                        className="input input-bordered w-full rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={creating}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs xs:text-sm mb-1 font-medium">Trip End Date</label>
                      <input
                        type="date"
                        className="input input-bordered w-full rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={creating}
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="alert alert-error rounded-lg mb-3 xs:mb-4 text-sm xs:text-base md:text-sm lg:text-sm py-2">
                      {error}
                    </div>
                  )}
                  <button
                    className="btn btn-primary w-full rounded-lg flex items-center gap-2 h-10 xs:h-12 text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm"
                    disabled={creating}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4"
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

              {trips.length > 0 && (
                <h2 className="text-base xs:text-lg sm:text-xl md:text-lg lg:text-lg xl:text-lg font-semibold mb-2 xs:mb-3 text-primary w-full text-left">Your Trips</h2>
              )}

              {loading ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-dots text-primary loading-lg"></span>
                </div>
              ) : (
                <div className="space-y-3 xs:space-y-4 w-full">
                  {trips.length === 0 ? (
                    <div className="alert alert-info rounded-lg text-sm xs:text-base md:text-sm lg:text-sm py-2">
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
                                  className="input input-bordered w-full mb-2 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                                  value={editingTripName}
                                  onChange={(e) => setEditingTripName(e.target.value)}
                                />
                                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                  <select
                                    className="select select-bordered w-full sm:w-1/3 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                                    value={editingTripCurrency}
                                    onChange={(e) => setEditingTripCurrency(e.target.value)}
                                  >
                                    {Object.keys(CURRENCY_SYMBOLS).map((code) => (
                                      <option key={code} value={code}>
                                        {code}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="date"
                                    className="input input-bordered w-full sm:w-1/3 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                                    value={editingTripStartDate}
                                    onChange={(e) => setEditingTripStartDate(e.target.value)}
                                  />
                                  <input
                                    type="date"
                                    className="input input-bordered w-full sm:w-1/3 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                                    value={editingTripEndDate}
                                    onChange={(e) => setEditingTripEndDate(e.target.value)}
                                  />
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    className="btn btn-success btn-xs xs:btn-sm md:btn-xs lg:btn-xs rounded-lg text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs"
                                    onClick={() => handleSaveEditTrip(trip.id)}
                                  >
                                    Save
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs xs:btn-sm md:btn-xs lg:btn-xs rounded-lg text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs"
                                    onClick={() => setEditingTripId(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1">
                                  <h2 className="card-title text-base xs:text-lg sm:text-xl md:text-lg lg:text-lg xl:text-lg">
                                    {trip.name}
                                  </h2>
                                  {trip.start_date && trip.end_date && (
                                    <div className="text-xs xs:text-sm text-base-content/60 mb-1">
                                      {trip.start_date} <span className="mx-1">&rarr;</span> {trip.end_date}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <button
                                    className="btn btn-ghost btn-xs rounded-lg p-1"
                                    title="Edit Trip"
                                    onClick={() => handleEditTrip(trip)}
                                  >
                                    <PencilSquareIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4" />
                                  </button>
                                  <button
                                    className="btn btn-ghost btn-xs rounded-lg p-1"
                                    title="Delete Trip"
                                    onClick={() => handleRequestDeleteTrip(trip)}
                                  >
                                    <TrashIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 text-error" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          {editingTripId !== trip.id && (
                            <button
                              className="btn btn-outline btn-sm w-full mt-3 xs:mt-4 flex items-center gap-2 rounded-lg h-10 xs:h-12 text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm"
                              onClick={() => setSelectedTrip(trip)}
                            >
                              <MapIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4" />
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
                className="btn btn-sm mb-3 xs:mb-4 rounded-lg text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs h-8 xs:h-10"
                onClick={handleBack}
              >
                ← Back to Trips
              </button>

              <div className="card bg-base-100 shadow mb-3 xs:mb-4 rounded-lg">
                <div className="card-body p-3 xs:p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="card-title text-lg xs:text-xl sm:text-2xl md:text-lg lg:text-lg xl:text-lg mb-0">
                        {selectedTrip.name}
                      </h2>
                      {selectedTrip.start_date && selectedTrip.end_date && (
                        <div className="text-xs xs:text-sm text-base-content/60 mt-1">
                          {selectedTrip.start_date} <span className="mx-1">&rarr;</span> {selectedTrip.end_date}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        className="btn btn-ghost btn-xs rounded-lg p-1"
                        title="Edit Trip"
                        onClick={() => handleEditTrip(selectedTrip)}
                      >
                        <PencilSquareIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs rounded-lg p-1"
                        title="Delete Trip"
                        onClick={() => handleRequestDeleteTrip(selectedTrip)}
                      >
                        <TrashIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4 text-error" />
                      </button>
                    </div>
                  </div>
                  {/* Show loading state if fetching trip data */}
                  {loadingTripData ? (
                    <div className="flex justify-center py-4">
                      <span className="loading loading-dots text-primary loading-sm"></span>
                    </div>
                  ) : (
                   <div className="flex flex-row gap-3 xs:gap-4 w-full">
                     <div className="flex-1 bg-secondary/10 p-2 xs:p-3 rounded-lg border border-secondary/20">
                       <div className="text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs text-base-content/70 mb-1">
                         Total Expenses
                       </div>
                       <div className="text-base xs:text-lg md:text-base lg:text-base xl:text-base font-semibold text-secondary">
                         {CURRENCY_SYMBOLS[selectedTrip.currency]}{" "}
                         {totalExpense.toFixed(2)}
                       </div>
                     </div>
                     <div className="flex-1 bg-primary/10 p-2 xs:p-3 rounded-lg border border-primary/20">
                       <div className="text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs text-base-content/70 mb-1">
                         Per Traveller
                       </div>
                       <div className="text-lg xs:text-xl md:text-lg lg:text-lg xl:text-lg font-bold text-primary">
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
                onExpensesChange={refreshExpenses}
                expenses={expenses}
                onShowToast={showToast}
              />
              <Expenses
                tripId={selectedTrip.id}
                currency={selectedTrip.currency}
                currencySymbol={CURRENCY_SYMBOLS[selectedTrip.currency]}
                travellers={travellers}
                onExpensesChange={refreshExpenses}
                onShowToast={showToast}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
