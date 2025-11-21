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
    const { error: signUpError } = await signUp(email, password)

    if (signUpError) {
      setError(signUpError.message)
    } else {
      // Sign up successful, navigate to dashboard
      // Note: Supabase may require email confirmation depending on settings
      navigate('/dashboard')
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

