import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Development test page for manual CRUD verification
 * Only accessible in development mode
 */
export function TestCRUD() {
  const { user, signUp, signIn, signOut } = useAuth()
  const { subscriptions, loading, createSubscription, updateSubscription, deleteSubscription } = useSubscriptions()
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('test123456')
  const [authResult, setAuthResult] = useState('')
  const [crudResult, setCrudResult] = useState('')

  const handleTestSignUp = async () => {
    setAuthResult('Signing up...')
    const { error } = await signUp(testEmail, testPassword)
    if (error) {
      setAuthResult(`Error: ${error.message}`)
    } else {
      setAuthResult('Sign up successful! Check your email for confirmation if required.')
    }
  }

  const handleTestSignIn = async () => {
    setAuthResult('Signing in...')
    const { error } = await signIn(testEmail, testPassword)
    if (error) {
      setAuthResult(`Error: ${error.message}`)
    } else {
      setAuthResult('Sign in successful!')
    }
  }

  const handleTestSignOut = async () => {
    setAuthResult('Signing out...')
    const { error } = await signOut()
    if (error) {
      setAuthResult(`Error: ${error.message}`)
    } else {
      setAuthResult('Sign out successful!')
    }
  }

  const handleTestCreate = async () => {
    setCrudResult('Creating subscription...')
    const { data, error } = await createSubscription({
      name: 'Test Subscription',
      price: 9.99,
      cycle: 'monthly',
      category: 'Test',
      renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'This is a test subscription',
    })
    if (error) {
      setCrudResult(`Error: ${error}`)
    } else {
      setCrudResult(`Created successfully! ID: ${data?.id}`)
    }
  }

  const handleTestUpdate = async () => {
    if (subscriptions.length === 0) {
      setCrudResult('No subscriptions to update. Create one first.')
      return
    }
    const firstSub = subscriptions[0]
    setCrudResult('Updating subscription...')
    const { error } = await updateSubscription(firstSub.id, {
      name: 'Updated Test Subscription',
      price: 19.99,
    })
    if (error) {
      setCrudResult(`Error: ${error}`)
    } else {
      setCrudResult('Updated successfully!')
    }
  }

  const handleTestDelete = async () => {
    if (subscriptions.length === 0) {
      setCrudResult('No subscriptions to delete. Create one first.')
      return
    }
    const lastSub = subscriptions[subscriptions.length - 1]
    setCrudResult('Deleting subscription...')
    const { error } = await deleteSubscription(lastSub.id)
    if (error) {
      setCrudResult(`Error: ${error}`)
    } else {
      setCrudResult('Deleted successfully!')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Page (Dev Only)</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Auth Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current User</Label>
              <p className="text-sm text-muted-foreground">
                {user ? `Logged in as: ${user.email}` : 'Not logged in'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-email">Email</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-password">Password</Label>
              <Input
                id="test-password"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleTestSignUp} variant="outline">
                Test Sign Up
              </Button>
              <Button onClick={handleTestSignIn} variant="outline">
                Test Sign In
              </Button>
              <Button onClick={handleTestSignOut} variant="outline">
                Test Sign Out
              </Button>
            </div>

            {authResult && (
              <div className="p-3 bg-muted rounded-md text-sm">{authResult}</div>
            )}
          </CardContent>
        </Card>

        {/* CRUD Tests */}
        <Card>
          <CardHeader>
            <CardTitle>CRUD Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subscriptions Count</Label>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${subscriptions.length} subscriptions`}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleTestCreate} variant="outline" disabled={!user}>
                Test Create
              </Button>
              <Button onClick={handleTestUpdate} variant="outline" disabled={!user || subscriptions.length === 0}>
                Test Update
              </Button>
              <Button onClick={handleTestDelete} variant="outline" disabled={!user || subscriptions.length === 0}>
                Test Delete
              </Button>
            </div>

            {crudResult && (
              <div className="p-3 bg-muted rounded-md text-sm">{crudResult}</div>
            )}

            {subscriptions.length > 0 && (
              <div className="mt-4">
                <Label>Sample Subscription</Label>
                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(subscriptions[0], null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

