import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSubscriptions } from '../useSubscriptions'
import { supabase } from '@/lib/supabaseClient'
import { AuthProvider } from '@/context/AuthContext'

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '1', name: 'Test' },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { id: '1', name: 'Updated' },
                error: null,
              })),
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            error: null,
          })),
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}))

// Mock AuthContext
vi.mock('@/context/AuthContext', async () => {
  const actual = await vi.importActual('@/context/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'test-user-id' },
      loading: false,
    }),
  }
})

describe('useSubscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches subscriptions on mount', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

    const { result } = renderHook(() => useSubscriptions(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('creates a subscription', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

    const { result } = renderHook(() => useSubscriptions(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const subscriptionData = {
      name: 'Test Subscription',
      price: 9.99,
      cycle: 'monthly',
    }

    await result.current.createSubscription(subscriptionData)

    expect(supabase.from).toHaveBeenCalledWith('subscriptions')
  })
})

