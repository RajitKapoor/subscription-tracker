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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{error: Error|null, data: object|null}>}
   */
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
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

