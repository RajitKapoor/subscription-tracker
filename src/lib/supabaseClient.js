import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log('Supabase Configuration Check:')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? `✓ ${supabaseUrl}` : '✗ Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✓ ***${supabaseAnonKey.slice(-4)}` : '✗ Missing')
}

// Provide fallback values to prevent immediate crash, but log warning
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗ Missing')
  console.error('Please check your .env.local file and restart the dev server.')
}

// Validate URL format
const isValidUrl = supabaseUrl && 
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  !supabaseUrl.includes('placeholder')

// Create client with proper URL validation
export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

