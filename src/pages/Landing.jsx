import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { TrendingUp, Bell, BarChart3, Shield } from 'lucide-react'

/**
 * Landing page with marketing content and call-to-action
 */
export function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold">Subscription Tracker</h1>
          <div className="flex gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6">
            Track Your Subscriptions
            <br />
            <span className="text-primary">Stay in Control</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Never lose track of your recurring subscriptions. Monitor spending, get renewal reminders,
            and make informed decisions about your subscriptions.
          </p>
          {!user && (
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Tracking Free
              </Button>
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Track Spending</CardTitle>
              <CardDescription>
                Monitor your monthly and yearly subscription costs with detailed analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Renewal Reminders</CardTitle>
              <CardDescription>
                Get notified about upcoming renewals so you never miss a payment or renewal date
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Visualize your spending patterns and category breakdowns with interactive charts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and secure. We never share your information with third parties
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center text-muted-foreground">
          <p>© 2024 Subscription Tracker. Built with React, Vite, and Supabase.</p>
        </footer>
      </div>
    </div>
  )
}

