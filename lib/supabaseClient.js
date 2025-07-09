// supabaseClient.js
// This file sets up the connection to Supabase (the backend database and auth service)
import { createClient } from "@supabase/supabase-js";

// These environment variables are set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a Supabase client instance to use throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
