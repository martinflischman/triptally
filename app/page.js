// Main page for TripTally app
// Handles trip creation, selection, editing, deletion, and displays all trip-related data
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import confetti from "canvas-confetti";

// Currency symbols for supported currencies
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
  // --- State variables for all app data and UI state ---
  // Router for navigation
  const router = useRouter();
  // State for checking if user is authenticated
  const [authChecked, setAuthChecked] = useState(false);
  // State for all trips
  const [trips, setTrips] = useState([]);
  // Loading state for trips
  const [loading, setLoading] = useState(true);
  // Form fields for creating a new trip
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  // State for selected trip and editing
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTripId, setEditingTripId] = useState(null);
  const [editingTripName, setEditingTripName] = useState("");
  const [editingTripCurrency, setEditingTripCurrency] = useState("USD");
  const [editingTripStartDate, setEditingTripStartDate] = useState("");
  const [editingTripEndDate, setEditingTripEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // State for travellers and expenses of selected trip
  const [travellers, setTravellers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loadingTripData, setLoadingTripData] = useState(false);
  // State for displaying the logged-in user's info
  const [userDisplay, setUserDisplay] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  // State for the full user object (needed for dropdown info)
  const [user, setUser] = useState(null);
  // Toast notification state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  // Modal state for confirming trip deletion
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  // Ref for Supabase real-time subscriptions
  const subscriptionsRef = useRef({});
  // State for dropdown menu visibility
  const [menuOpen, setMenuOpen] = useState(false);
  // Add state for scrollable and scrolled (for back-to-top button)
  const [showBackToTop, setShowBackToTop] = useState(false);

  // --- Toast notification handler ---
  // Shows a temporary message at the bottom of the screen
  function showToast(message, type = "success") {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  }

  // --- Modal open handler for deleting a trip ---
  function handleRequestDeleteTrip(trip) {
    setTripToDelete(trip);
    setConfirmDeleteOpen(true);
  }

  // --- Actually delete a trip after confirmation ---
  async function handleDeleteTripConfirmed() {
    if (!tripToDelete) return;
    await supabase.from("trips").delete().eq("id", tripToDelete.id);
    fetchTrips();
    setConfirmDeleteOpen(false);
    setTripToDelete(null);
    showToast("Trip deleted", "error");
  }

  // --- Fetch all trips from the database for the current user ---
  async function fetchTrips() {
    setLoading(true);
    // Only fetch trips for the current user
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("trips").select("*").eq("user_id", user.id);
    if (!error) {
      // Sort trips by start date
      data.sort((a, b) => (a.start_date || "") > (b.start_date || "") ? 1 : -1);
      setTrips(data);
    } else {
      showToast("Failed to load trips. Please try again.", "error");
    }
    setLoading(false);
  }

  // --- Fetch travellers and expenses for a selected trip ---
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

  // --- Refresh functions for child components ---
  // Used to re-fetch data after changes
  const refreshTravellers = () => {
    if (selectedTrip) fetchTripData(selectedTrip.id);
  };
  const refreshExpenses = () => {
    if (selectedTrip) fetchTripData(selectedTrip.id);
  };

  // --- Handle creating a new trip ---
  async function handleCreateTrip(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    // Validate form fields
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
    if (!user) {
      setError("User not authenticated.");
      setCreating(false);
      return;
    }
    // Insert new trip into database with user_id
    const { error } = await supabase.from("trips").insert([{ name, currency, start_date: startDate, end_date: endDate, user_id: user.id }]);
    if (error) {
      setError(error.message);
    } else {
      setName("");
      setCurrency("");
      setStartDate("");
      setEndDate("");
      fetchTrips();
      showToast("Trip added", "success");
      // Fire confetti animation on success
      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 35,
        gravity: 0.7,
        ticks: 200,
        origin: { y: 0.6 }
      });
    }
    setCreating(false);
  }

  // --- Handle deleting a trip (with browser confirm) ---
  async function handleDeleteTrip(id) {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    await supabase.from("trips").delete().eq("id", id);
    fetchTrips();
  }

  // --- Go back to trip list ---
  function handleBack() {
    setSelectedTrip(null);
  }

  // --- Handle editing a trip (open edit mode) ---
  function handleEditTrip(trip) {
    setEditingTripId(trip.id);
    setEditingTripName(trip.name);
    setEditingTripCurrency(trip.currency);
    setEditingTripStartDate(trip.start_date || "");
    setEditingTripEndDate(trip.end_date || "");
  }

  // --- Save edits to a trip ---
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
    showToast("Changes saved", "success");
  }

  // --- Calculate total expense sum for selected trip ---
  const totalExpense = expenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );

  // --- Calculate amount per traveller safely ---
  const perTraveller = travellers.length ? totalExpense / travellers.length : 0;

  // --- Handle user logout ---
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/signin");
  }

  // --- Fetch user info for header display (first name for Google, email for magic link) ---
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user); // Store the full user object for later use
        const name = user.user_metadata?.name || user.user_metadata?.full_name;
        const avatarUrl = user.user_metadata?.avatar_url;
        if (avatarUrl) {
          setUserAvatar(avatarUrl);
        } else {
          // Use first letter of name or email for fallback avatar
          const initial = name ? name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "?");
          setUserAvatar(initial);
        }
        if (name) {
          setUserDisplay(name.split(" ")[0]); // First name only
        } else {
          setUserDisplay(user.email);
        }
      }
    }
    fetchUser();
  }, []);

  // --- Fetch trips whenever user is loaded ---
  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  // --- Route protection: redirect to /signin if not authenticated ---
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/signin");
      } else {
        setAuthChecked(true);
      }
    }
    checkAuth();
  }, [router]);

  // --- When a trip is selected, fetch its travellers and expenses ---
  useEffect(() => {
    if (!selectedTrip) {
      setTravellers([]);
      setExpenses([]);
      return;
    }
    fetchTripData(selectedTrip.id);
  }, [selectedTrip]);

  // --- Subscribe to real-time updates for travellers and expenses of selected trip ---
  useEffect(() => {
    if (!selectedTrip) return;

    // Clean up previous subscriptions
    if (subscriptionsRef.current.travellers)
      subscriptionsRef.current.travellers.unsubscribe();
    if (subscriptionsRef.current.expenses)
      subscriptionsRef.current.expenses.unsubscribe();

    // Subscribe to travellers table changes
    subscriptionsRef.current.travellers = supabase
      .channel("public:travellers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "travellers",
          filter: `trip_id=eq.${selectedTrip.id}`,
        },
        () => fetchTripData(selectedTrip.id)
      )
      .subscribe();

    // Subscribe to expenses table changes
    subscriptionsRef.current.expenses = supabase
      .channel("public:expenses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `trip_id=eq.${selectedTrip.id}`,
        },
        () => fetchTripData(selectedTrip.id)
      )
      .subscribe();

    // Cleanup on unmount or trip change
    return () => {
      if (subscriptionsRef.current.travellers)
        subscriptionsRef.current.travellers.unsubscribe();
      if (subscriptionsRef.current.expenses)
        subscriptionsRef.current.expenses.unsubscribe();
    };
  }, [selectedTrip]);

  // --- Close dropdown on outside click ---
  function handleClickOutside(e) {
    if (!e.target.closest('#user-menu')) setMenuOpen(false);
  }
  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // --- Show/hide back-to-top button based on scroll position and content height ---
  useEffect(() => {
    function checkScroll() {
      const scrollable = document.documentElement.scrollHeight > window.innerHeight;
      const scrolled = window.scrollY > 40;
      setShowBackToTop(scrollable && scrolled);
    }
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    checkScroll();
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  // --- Render main UI: header, trip list, modals, etc. ---
  return (
    <main className="min-h-screen bg-base-200" role="main">
      {/* Responsive header bar with MapIcon and user info */}
      <header className="w-full flex items-center justify-between px-4 py-3 bg-base-100 mb-2 md:sticky md:top-0 md:z-50">
        <span className="flex items-center gap-2 text-lg font-bold text-primary tracking-tight">
          <MapIcon className="h-6 w-6 md:h-5 md:w-5" />
          <span className="text-xl md:text-lg font-bold leading-tight">TripTally</span>
        </span>
        <div className="flex items-center gap-4 relative" id="user-menu">
          {/* User avatar: Google image or fallback initial. Click to open menu. */}
          {userAvatar && (
            typeof userAvatar === "string" && userAvatar.startsWith("http") ? (
              <img
                src={userAvatar}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-primary cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => setMenuOpen((v) => !v)}
                tabIndex={0}
                aria-label="Open user menu"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setMenuOpen(v => !v); }}
              />
            ) : (
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-white font-bold text-base select-none border-2 border-primary cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => setMenuOpen((v) => !v)}
                tabIndex={0}
                aria-label="Open user menu"
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setMenuOpen(v => !v); }}
              >
                {userAvatar}
              </span>
            )
          )}
          {/* Dropdown menu: appears below avatar when open */}
          {menuOpen && user && (
            <div className="absolute right-0 top-12 z-50 bg-base-100 rounded-xl shadow py-2 px-4 animate-fade-in min-w-[200px] max-w-xs w-fit" role="menu" aria-label="User menu">
              {/* 'Logged in as:' label */}
              <div className="flex flex-col min-w-0 mb-2">
                <span className="text-xs text-base-content/50 mb-1">Logged in as:</span>
                <span className="font-medium text-base-content break-words" title={user.user_metadata?.full_name || user.user_metadata?.name || user.email}>
                  {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                </span>
                <span className="text-xs text-base-content/60 break-words" title={user.email}>{user.email}</span>
              </div>
              <div className="border-t border-base-300 my-2" />
              <button
                className="btn btn-soft btn-error w-full flex items-center gap-2 justify-center hover:text-white"
                onClick={handleLogout}
                role="menuitem"
                aria-label="Log out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h12m0 0l-3-3m3 3l-3 3" />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      {/* Scroll to top button, only on desktop/tablet and if scrollable */}
      {showBackToTop && (
        <button
          className="btn btn-circle btn-primary btn-soft hidden md:flex fixed bottom-6 right-6 z-50"
          style={{ outline: 'none' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      {!authChecked ? (
        <div className="flex items-center justify-center min-h-screen">
          <span className="loading loading-dots text-primary loading-lg"></span>
        </div>
      ) : (
        <>
          <Toast
            open={toastOpen}
            message={toastMessage}
            type={toastType}
            onClose={() => setToastOpen(false)}
            role="alert"
          />
          <ConfirmDeleteModal
            open={confirmDeleteOpen}
            onClose={() => {
              setConfirmDeleteOpen(false);
              setTripToDelete(null);
            }}
            onConfirm={handleDeleteTripConfirmed}
            title="Delete Trip?"
            message="Are you sure you want to delete this trip? This can't be undone."
            confirmText="Delete"
            cancelText="Cancel"
            cancelRed
          />
          <div className="container mx-auto px-3 xs:px-4 sm:px-5 py-2 xs:py-3 sm:py-4 max-w-full xs:max-w-[97vw] sm:max-w-[93vw] md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
            <div className="flex flex-col items-center">
              {/* Removed MapIcon and TripTally heading here */}

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
                      {/* In the trip creation form, move labels above their respective input fields */}
                      <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 mb-3 xs:mb-4">
                        <div className="flex-1 flex flex-col">
                          <label htmlFor="trip-name" className="block text-xs xs:text-sm mb-1 font-medium text-left">
                            Trip Name
                          </label>
                          <input
                            id="trip-name"
                            className="input input-bordered input-primary w-full rounded-lg text-base h-10 xs:h-12"
                            placeholder="Summer in Italy 🍝"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={creating}
                            required
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <label htmlFor="currency-select" className="block text-xs xs:text-sm mb-1 font-medium text-left">
                            Currency
                          </label>
                          <select
                            id="currency-select"
                            className="select select-bordered select-primary w-full rounded-lg text-base h-10 xs:h-12"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            disabled={creating}
                            required
                          >
                            <option value="">Select currency</option>
                            {Object.keys(CURRENCY_SYMBOLS).map((code) => (
                              <option key={code} value={code}>
                                {code}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 mb-3 xs:mb-4">
                        <div className="flex-1 flex flex-col">
                          <label htmlFor="start-date" className="block text-xs xs:text-sm mb-1 font-medium text-left">
                            Trip Start Date
                          </label>
                          <input
                            id="start-date"
                            type="date"
                            className="input input-bordered input-primary w-full rounded-lg text-base h-10 xs:h-12"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={creating}
                            required
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <label htmlFor="end-date" className="block text-xs xs:text-sm mb-1 font-medium text-left">
                            Trip End Date
                          </label>
                          <input
                            id="end-date"
                            type="date"
                            className="input input-bordered input-primary w-full rounded-lg text-base h-10 xs:h-12"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={creating}
                            required
                          />
                        </div>
                      </div>
                      {/* In the trip creation form, show error with role="alert" and consistent style */}
                      {error && (
                        <div className="alert alert-error rounded-lg mb-3 xs:mb-4 text-sm xs:text-base md:text-sm lg:text-sm py-2" role="alert">
                          {error}
                        </div>
                      )}
                      <button
                        className="btn btn-primary btn-soft w-full rounded-lg flex items-center gap-2 h-10 xs:h-12 text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm shadow-none"
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

                  {/* Always show 'Your Trips' heading */}
                  <h2 className="text-base xs:text-lg sm:text-xl md:text-lg lg:text-lg xl:text-lg font-semibold mb-2 xs:mb-3 text-primary w-full text-left">
                    Your Trips
                  </h2>

                  {loading ? (
                    <div className="flex justify-center py-4">
                      <span className="loading loading-dots text-primary loading-lg"></span>
                    </div>
                  ) : (
                    <div className="space-y-3 xs:space-y-4 w-full">
                      {trips.length === 0 ? (
                        <div className="input input-bordered w-full rounded-lg pointer-events-none cursor-default bg-info/20 text-info font-semibold border-info/20 text-sm py-2 px-4">
                          You don’t have any trips yet.
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
                                      onChange={(e) =>
                                        setEditingTripName(e.target.value)
                                      }
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                      <select
                                        className="select select-bordered w-full sm:w-1/3 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                                        value={editingTripCurrency}
                                        onChange={(e) =>
                                          setEditingTripCurrency(e.target.value)
                                        }
                                      >
                                        {Object.keys(CURRENCY_SYMBOLS).map(
                                          (code) => (
                                            <option key={code} value={code}>
                                              {code}
                                            </option>
                                          )
                                        )}
                                      </select>
                                      <input
                                        type="date"
                                        className="input input-bordered w-full sm:w-1/3 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                                        value={editingTripStartDate}
                                        onChange={(e) =>
                                          setEditingTripStartDate(e.target.value)
                                        }
                                      />
                                      <input
                                        type="date"
                                        className="input input-bordered w-full sm:w-1/3 rounded-lg text-sm xs:text-base md:text-sm lg:text-sm xl:text-sm h-10 xs:h-12"
                                        value={editingTripEndDate}
                                        onChange={(e) =>
                                          setEditingTripEndDate(e.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                      <button
                                        className="btn btn-primary btn-soft h-10 rounded-lg px-4 font-semibold text-white"
                                        onClick={() => handleSaveEditTrip(trip.id)}
                                      >
                                        Save
                                      </button>
                                      <button
                                        className="btn btn-ghost btn-soft h-10 rounded-lg px-4 font-semibold"
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
                                          {trip.start_date}{" "}
                                          <span className="mx-1">&rarr;</span>{" "}
                                          {trip.end_date}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                      <button
                                        className="btn btn-ghost btn-xs rounded-lg p-1"
                                        title="Edit Trip"
                                        aria-label="Edit Trip"
                                        onClick={() => handleEditTrip(trip)}
                                      >
                                        <PencilSquareIcon className="h-4 w-4 xs:h-5 xs:w-5 md:h-4 md:w-4 lg:h-4 lg:w-4 xl:h-4 xl:w-4" />
                                      </button>
                                      <button
                                        className="btn btn-ghost btn-xs rounded-lg p-1"
                                        title="Delete Trip"
                                        aria-label="Delete Trip"
                                        onClick={() =>
                                          handleRequestDeleteTrip(trip)
                                        }
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
                    className="btn btn-sm btn-soft mb-3 xs:mb-4 rounded-lg text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs h-8 xs:h-10"
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
                              {selectedTrip.start_date}{" "}
                              <span className="mx-1">&rarr;</span>{" "}
                              {selectedTrip.end_date}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Show loading state if fetching trip data */}
                      {loadingTripData ? (
                        <div className="flex justify-center py-4">
                          <span className="loading loading-dots text-primary loading-sm"></span>
                        </div>
                      ) : (
                        <>
                          {/* Summary row: two blocks, each w-1/2, fixed height and vertical centering */}
                          <div className="flex flex-row gap-3 xs:gap-4 w-full mb-3">
                            <div className="w-1/2 bg-secondary/10 p-2 xs:p-3 h-20 flex flex-col justify-center rounded-lg border border-secondary/20 min-w-[140px]">
                              <div className="text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs text-base-content/70 mb-1">
                                Total Expenses
                              </div>
                              <div className="text-base xs:text-lg md:text-base lg:text-base xl:text-base font-semibold text-secondary">
                                {CURRENCY_SYMBOLS[selectedTrip.currency]} {totalExpense.toFixed(2)}
                              </div>
                            </div>
                            <div className="w-1/2 bg-primary/10 p-2 xs:p-3 h-20 flex flex-col justify-center rounded-lg border border-primary/20 min-w-[140px]">
                              <div className="text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs text-base-content/70 mb-1">
                                Per Traveller
                              </div>
                              <div className="text-lg xs:text-xl md:text-lg lg:text-lg xl:text-lg font-bold text-primary">
                                {CURRENCY_SYMBOLS[selectedTrip.currency]} {perTraveller.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {/* Traveller blocks: grid with 2 columns on mobile, 4 on desktop, fixed height and vertical centering */}
                          {travellers.length > 0 && expenses.length > 0 && (
                            <div className={`w-full ${travellers.length === 1 ? 'flex justify-center' : ''}`}>
                              <div className={`grid ${travellers.length === 1 ? '' : 'grid-cols-2'} md:grid-cols-4 gap-3 xs:gap-4 w-full`}>
                                {travellers.map(traveller => {
                                  const totalPaid = expenses
                                    .filter(exp => exp.paid_by === traveller.id)
                                    .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
                                  return (
                                    <div key={traveller.id} className="bg-base-200 p-2 xs:p-3 h-20 flex flex-col justify-between rounded-lg border border-base-300 w-full min-w-[140px]">
                                      <div className="text-xs xs:text-sm md:text-xs lg:text-xs xl:text-xs text-base-content/70 truncate">
                                        {traveller.name} paid
                                      </div>
                                      <div className="text-lg font-bold text-base-content">
                                        {CURRENCY_SYMBOLS[selectedTrip.currency]} {totalPaid.toFixed(2)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
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
                    currency={selectedTrip.currency}
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
        </>
      )}
    </main>
  );
}
