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
    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
    } else {
      navigate('/dashboard')
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

