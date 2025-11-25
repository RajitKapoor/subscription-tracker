import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

/**
 * Custom hook for managing subscriptions CRUD operations
 * Handles fetching, creating, updating, and deleting subscriptions
 * @returns {object} Subscriptions data and CRUD methods
 */
export function useSubscriptions() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch subscriptions for the current user
  const fetchSubscriptions = async () => {
    if (!user) {
      setSubscriptions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('renewal_date', { ascending: true, nullsLast: true })

      if (fetchError) throw fetchError
      setSubscriptions(data || [])
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create a new subscription
  const createSubscription = async (subscriptionData) => {
    if (!user) throw new Error('User must be authenticated')

    try {
      const { data, error: createError } = await supabase
        .from('subscriptions')
        .insert([
          {
            ...subscriptionData,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (createError) throw createError
      await fetchSubscriptions() // Refresh list
      return { data, error: null }
    } catch (err) {
      console.error('Error creating subscription:', err)
      return { data: null, error: err.message }
    }
  }

  // Update an existing subscription
  const updateSubscription = async (id, updates) => {
    if (!user) throw new Error('User must be authenticated')

    try {
      const { data, error: updateError } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns this subscription
        .select()
        .single()

      if (updateError) throw updateError
      await fetchSubscriptions() // Refresh list
      return { data, error: null }
    } catch (err) {
      console.error('Error updating subscription:', err)
      return { data: null, error: err.message }
    }
  }

  // Delete a subscription
  const deleteSubscription = async (id) => {
    if (!user) throw new Error('User must be authenticated')

    try {
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns this subscription

      if (deleteError) throw deleteError
      await fetchSubscriptions() // Refresh list
      return { error: null }
    } catch (err) {
      console.error('Error deleting subscription:', err)
      return { error: err.message }
    }
  }

  // Subscribe to realtime updates (if available on free tier)
  useEffect(() => {
    if (!user) return

    fetchSubscriptions()

    // Set up realtime subscription
    const channel = supabase
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscriptions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    subscriptions,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    refetch: fetchSubscriptions,
  }
}

