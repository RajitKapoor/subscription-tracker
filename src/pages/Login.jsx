import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthForm } from '@/components/AuthForm'

/**
 * Login page component
 */
export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const handleSubmit = async (email, password) => {
    setError(null)
    try {
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        // Handle different error types
        let errorMessage = signInError.message || 'An error occurred during sign in'
        
        // Provide more helpful error messages
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          errorMessage = 'Failed to connect to server. Please check your internet connection and ensure Supabase is properly configured.'
        } else if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address before signing in. Check your inbox for the confirmation link.'
        }
        
        setError(errorMessage)
      } else if (data?.user || data?.session) {
        // Sign in successful
        navigate('/dashboard')
      }
    } catch (err) {
      // Catch any unexpected errors
      console.error('Unexpected signin error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        <AuthForm mode="login" onSubmit={handleSubmit} error={error} />
      </div>
    </div>
  )
}

