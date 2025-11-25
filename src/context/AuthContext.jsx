import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext({})

/**
 * AuthContext provider that manages authentication state
 * Provides user session, signup, login, and logout functions
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Sign up a new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  const signUp = async (email, password) => {
    try {
      // Check if Supabase client is properly initialized
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      // Safe check - verify they exist, are strings, and not empty/placeholder
      const urlValid = supabaseUrl && 
                       typeof supabaseUrl === 'string' && 
                       supabaseUrl.trim() !== '' && 
                       supabaseUrl !== 'https://placeholder.supabase.co'
      const keyValid = supabaseAnonKey && 
                       typeof supabaseAnonKey === 'string' && 
                       supabaseAnonKey.trim() !== '' && 
                       supabaseAnonKey !== 'placeholder-key'
      
      if (!urlValid || !keyValid) {
        console.error('Supabase configuration check failed:')
        console.error('VITE_SUPABASE_URL:', supabaseUrl || 'undefined', `(type: ${typeof supabaseUrl})`)
        console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'undefined', `(type: ${typeof supabaseAnonKey})`)
        console.error('All VITE_ env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')))
        return {
          data: null,
          error: {
            message: 'Supabase is not configured. Please check your .env.local file and restart the dev server.'
          }
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        return { data, error }
      }
      
      return { data, error: null }
    } catch (err) {
      // Catch network errors and other exceptions
      console.error('Signup error:', err)
      return {
        data: null,
        error: {
          message: err.message || 'Failed to connect to server. Please check your internet connection and try again.'
        }
      }
    }
  }

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  const signIn = async (email, password) => {
    try {
      // Check if Supabase client is properly initialized
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      // Safe check - verify they exist, are strings, and not empty/placeholder
      const urlValid = supabaseUrl && 
                       typeof supabaseUrl === 'string' && 
                       supabaseUrl.trim() !== '' && 
                       supabaseUrl !== 'https://placeholder.supabase.co'
      const keyValid = supabaseAnonKey && 
                       typeof supabaseAnonKey === 'string' && 
                       supabaseAnonKey.trim() !== '' && 
                       supabaseAnonKey !== 'placeholder-key'
      
      if (!urlValid || !keyValid) {
        console.error('Supabase configuration check failed:')
        console.error('VITE_SUPABASE_URL:', supabaseUrl || 'undefined', `(type: ${typeof supabaseUrl})`)
        console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'undefined', `(type: ${typeof supabaseAnonKey})`)
        console.error('All VITE_ env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')))
        return {
          data: null,
          error: {
            message: 'Supabase is not configured. Please check your .env.local file and restart the dev server.'
          }
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return { data, error }
      }
      
      return { data, error: null }
    } catch (err) {
      // Catch network errors and other exceptions
      console.error('Signin error:', err)
      return {
        data: null,
        error: {
          message: err.message || 'Failed to connect to server. Please check your internet connection and try again.'
        }
      }
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<{error: Error|null}>}
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication context
 * @returns {object} Auth context with user, session, and auth methods
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

