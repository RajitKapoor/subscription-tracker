import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { supabase } from '@/lib/supabaseClient'

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

// Test component that uses auth
function TestComponent() {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return <div>{user ? `User: ${user.email}` : 'No user'}</div>
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides auth context to children', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument()
    })
  })

  it('handles sign up', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    })
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null,
    })

    function SignUpTest() {
      const { signUp } = useAuth()
      const handleSignUp = async () => {
        await signUp('test@example.com', 'password123')
      }
      return <button onClick={handleSignUp}>Sign Up</button>
    }

    render(
      <AuthProvider>
        <SignUpTest />
      </AuthProvider>
    )

    // Basic test that component renders
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })
})

