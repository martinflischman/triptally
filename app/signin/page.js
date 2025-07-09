// SignIn page for TripTally
// Handles magic link and Google sign-in, and shows feedback to the user
"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignIn() {
  // State for email input
  const [email, setEmail] = useState("");
  // Loading state for sign-in actions
  const [loading, setLoading] = useState(false);
  // State for feedback messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // State to track if magic link was sent
  const [emailSent, setEmailSent] = useState(false);

  // Handle magic link sign-in
  async function handleMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Magic link sent!");
      setEmailSent(true);
    }
    setLoading(false);
  }

  // Handle Google sign-in
  async function handleGoogle() {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (error) setError(error.message);
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
    setLoading(false);
  }

  // Reset the form to allow another email
  function handleReset() {
    setEmailSent(false);
    setMessage("");
    setEmail("");
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-lg p-6 w-full max-w-sm">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {/* MapIcon SVG, always matches theme primary color */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={32} height={32} className="block text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
          </svg>
          <span className="text-3xl font-bold text-primary" style={{ letterSpacing: "-1px" }}>TripTally</span>
        </div>
        {/* Show feedback if magic link was sent */}
        {emailSent ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="rounded-lg bg-green-200/80 border border-green-300 text-green-900 text-base px-4 py-3 text-center font-medium w-full">
              Magic link sent to <span className="font-semibold">{email}</span>.<br />Check your email to sign in.
            </div>
            <button className="btn btn-ghost mt-2" onClick={handleReset}>
              Try another email
            </button>
          </div>
        ) : (
          <>
            {/* Magic link sign-in form */}
            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                className="input input-bordered input-primary w-full text-base"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button className="btn btn-primary w-full mt-2" disabled={loading}>
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
            </form>
            <div className="divider">or</div>
            {/* Google sign-in button */}
            <button className="btn btn-outline w-full" onClick={handleGoogle} disabled={loading}>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 5.1 28.1 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.5-4z" fill="#FF3D00"/><path d="M24 45c5.8 0 10.7-1.9 14.6-5.1l-6.7-5.5C29.7 35.7 27 36.5 24 36.5c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.7 41.2 15.3 45 24 45z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.7 41.2 15.3 45 24 45c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.5-4z" fill="#1976D2"/></g></svg>
              Sign in with Google
            </button>
            {/* Show feedback messages */}
            {message && (
              <div className="mt-4 rounded-lg bg-green-200/80 border border-green-300 text-green-900 text-sm px-4 py-3 text-center font-medium" role="alert">
                {message}
              </div>
            )}
            {error && (
              <div className="alert alert-error mt-4 text-sm" role="alert">{error}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 