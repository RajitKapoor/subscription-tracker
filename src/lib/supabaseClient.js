import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

/**
 * Supabase client instance for database and authentication operations
 * Uses the anon key for client-side operations (RLS policies apply)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

