import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      setMessage("Check your email for a magic link to sign in.");
    }
    setLoading(false);
  }

  // Handle Google sign-in
  async function handleGoogle() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-primary text-center">Sign In</h2>
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
        <button className="btn btn-outline w-full" onClick={handleGoogle} disabled={loading}>
          <svg className="h-5 w-5 mr-2" viewBox="0 0 48 48"><g><path d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 5.1 28.1 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.5-4z" fill="#FFC107"/><path d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.5l6.4-6.4C33.5 5.1 28.1 3 24 3c-7.2 0-13.4 3.8-17 9.7z" fill="#FF3D00"/><path d="M24 45c5.8 0 10.7-1.9 14.6-5.1l-6.7-5.5C29.7 35.7 27 36.5 24 36.5c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.7 41.2 15.3 45 24 45z" fill="#4CAF50"/><path d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.7 41.2 15.3 45 24 45c10.5 0 20-8.5 20-20 0-1.3-.1-2.7-.5-4z" fill="#1976D2"/></g></svg>
          Sign in with Google
        </button>
        {message && <div className="alert alert-success mt-4 text-sm">{message}</div>}
        {error && <div className="alert alert-error mt-4 text-sm">{error}</div>}
      </div>
    </div>
  );
} 