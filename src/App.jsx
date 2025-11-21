import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { TestCRUD } from './pages/TestCRUD'
import { useAuth } from './context/AuthContext'
import { Button } from './components/ui/button'
import { LogOut } from 'lucide-react'

/**
 * Redirect authenticated users away from auth pages
 */
function AuthRedirect({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

/**
 * Navigation component with logout
 */
function Nav() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex gap-6">
            <Link to="/dashboard" className="text-lg font-semibold">
              Subscription Tracker
            </Link>
            <div className="flex gap-4">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link to="/subscriptions" className="text-sm text-muted-foreground hover:text-foreground">
                Subscriptions
              </Link>
              {import.meta.env.DEV && (
                <Link to="/test" className="text-sm text-muted-foreground hover:text-foreground">
                  Test
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

/**
 * Main App component with routing
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRedirect>
                <Signup />
              </AuthRedirect>
            }
          />
          <Route
            path="/dashboard"
            element={
              <>
                <Nav />
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <>
                <Nav />
                <ProtectedRoute>
                  <SubscriptionsPage />
                </ProtectedRoute>
              </>
            }
          />
          {import.meta.env.DEV && (
            <Route
              path="/test"
              element={
                <>
                  <Nav />
                  <ProtectedRoute>
                    <TestCRUD />
                  </ProtectedRoute>
                </>
              }
            />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

