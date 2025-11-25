import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthForm } from '@/components/AuthForm'

/**
 * Signup page component
 */
export function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const handleSubmit = async (email, password) => {
    setError(null)
    try {
      const { data, error: signUpError } = await signUp(email, password)

      if (signUpError) {
        // Handle different error types
        let errorMessage = signUpError.message || 'An error occurred during signup'
        
        // Provide more helpful error messages
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          errorMessage = 'Failed to connect to server. Please check your internet connection and ensure Supabase is properly configured.'
        } else if (errorMessage.includes('email')) {
          errorMessage = 'Invalid email address. Please check and try again.'
        } else if (errorMessage.includes('password')) {
          errorMessage = 'Password must be at least 6 characters long.'
        }
        
        setError(errorMessage)
      } else if (data?.user) {
        // Sign up successful
        // Note: Supabase may require email confirmation depending on settings
        // If email confirmation is required, user will be null but session might exist
        if (data.session) {
          navigate('/dashboard')
        } else {
          // Email confirmation required
          setError('Please check your email to confirm your account before signing in.')
        }
      }
    } catch (err) {
      // Catch any unexpected errors
      console.error('Unexpected signup error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <AuthForm mode="signup" onSubmit={handleSubmit} error={error} />
      </div>
    </div>
  )
}

