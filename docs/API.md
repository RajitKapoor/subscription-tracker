# API Documentation

This document describes the API usage for Subscription Tracker. The app uses Supabase as the backend, which provides a RESTful API and a JavaScript client library.

## Supabase Client

The Supabase client is initialized in `src/lib/supabaseClient.js`:

```javascript
import { supabase } from '@/lib/supabaseClient'
```

## Authentication API

### Sign Up

Create a new user account.

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
})
```

**Response:**
```javascript
{
  data: {
    user: { id: 'uuid', email: 'user@example.com', ... },
    session: { ... }
  },
  error: null
}
```

### Sign In

Authenticate an existing user.

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
})
```

**Response:**
```javascript
{
  data: {
    user: { id: 'uuid', email: 'user@example.com', ... },
    session: { access_token: '...', ... }
  },
  error: null
}
```

### Sign Out

Sign out the current user.

```javascript
const { error } = await supabase.auth.signOut()
```

### Get Current Session

Get the current authenticated session.

```javascript
const { data: { session }, error } = await supabase.auth.getSession()
```

### Listen to Auth Changes

Subscribe to authentication state changes.

```javascript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event)
    console.log('Session:', session)
  }
)

// Unsubscribe
subscription.unsubscribe()
```

## Subscriptions API

All subscription operations require authentication. The user must be signed in.

### List Subscriptions

Fetch all subscriptions for the current user.

```javascript
const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .order('renewal_date', { ascending: true, nullsLast: true })
```

**Response:**
```javascript
{
  data: [
    {
      id: 'uuid',
      user_id: 'uuid',
      name: 'Netflix',
      price: 15.99,
      renewal_date: '2024-02-15',
      cycle: 'monthly',
      category: 'Entertainment',
      notes: 'Premium plan',
      created_at: '2024-01-15T10:00:00Z'
    },
    // ...
  ],
  error: null
}
```

### Create Subscription

Create a new subscription.

```javascript
const { data, error } = await supabase
  .from('subscriptions')
  .insert([
    {
      user_id: userId,
      name: 'Spotify',
      price: 9.99,
      renewal_date: '2024-02-20',
      cycle: 'monthly',
      category: 'Music',
      notes: 'Student discount'
    }
  ])
  .select()
  .single()
```

**Response:**
```javascript
{
  data: {
    id: 'uuid',
    user_id: 'uuid',
    name: 'Spotify',
    price: 9.99,
    renewal_date: '2024-02-20',
    cycle: 'monthly',
    category: 'Music',
    notes: 'Student discount',
    created_at: '2024-01-20T10:00:00Z'
  },
  error: null
}
```

### Update Subscription

Update an existing subscription.

```javascript
const { data, error } = await supabase
  .from('subscriptions')
  .update({
    name: 'Spotify Premium',
    price: 10.99
  })
  .eq('id', subscriptionId)
  .eq('user_id', userId) // Security: ensure user owns this subscription
  .select()
  .single()
```

**Response:**
```javascript
{
  data: {
    id: 'uuid',
    // ... updated fields
  },
  error: null
}
```

### Delete Subscription

Delete a subscription.

```javascript
const { error } = await supabase
  .from('subscriptions')
  .delete()
  .eq('id', subscriptionId)
  .eq('user_id', userId) // Security: ensure user owns this subscription
```

**Response:**
```javascript
{
  error: null
}
```

### Filter Subscriptions

Filter subscriptions by category.

```javascript
const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('category', 'Entertainment')
```

Filter by upcoming renewals (next 30 days).

```javascript
const today = new Date().toISOString().split('T')[0]
const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0]

const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .gte('renewal_date', today)
  .lte('renewal_date', futureDate)
```

## Realtime Subscriptions

Subscribe to real-time changes in the subscriptions table.

```javascript
const channel = supabase
  .channel('subscriptions-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // 'INSERT', 'UPDATE', 'DELETE'
      schema: 'public',
      table: 'subscriptions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Change received!', payload)
      // Handle the change (e.g., refetch data)
    }
  )
  .subscribe()

// Unsubscribe when done
supabase.removeChannel(channel)
```

## Using the Custom Hooks

The app provides custom hooks that wrap the Supabase API:

### useAuth Hook

```javascript
import { useAuth } from '@/context/AuthContext'

function MyComponent() {
  const { user, session, loading, signUp, signIn, signOut } = useAuth()
  
  // user: current user object or null
  // session: current session or null
  // loading: boolean indicating if auth state is loading
  // signUp(email, password): sign up function
  // signIn(email, password): sign in function
  // signOut(): sign out function
}
```

### useSubscriptions Hook

```javascript
import { useSubscriptions } from '@/hooks/useSubscriptions'

function MyComponent() {
  const {
    subscriptions,      // array of subscriptions
    loading,            // boolean
    error,              // error message or null
    createSubscription, // function to create
    updateSubscription, // function to update
    deleteSubscription, // function to delete
    refetch             // function to manually refetch
  } = useSubscriptions()
  
  // Example: Create a subscription
  const handleCreate = async () => {
    const { data, error } = await createSubscription({
      name: 'Netflix',
      price: 15.99,
      cycle: 'monthly',
      category: 'Entertainment'
    })
  }
}
```

## Error Handling

All Supabase operations return an `error` object if something goes wrong:

```javascript
const { data, error } = await supabase.from('subscriptions').select('*')

if (error) {
  console.error('Error:', error.message)
  // Handle error (show toast, etc.)
} else {
  // Use data
  console.log('Subscriptions:', data)
}
```

Common errors:
- `new_row violates row-level security policy` - RLS policy violation (check user authentication)
- `JWT expired` - Session expired (sign in again)
- `relation "subscriptions" does not exist` - Table not created (run SQL script)

## Rate Limits

Supabase free tier limits:
- **API requests**: 50,000/month
- **Database size**: 500 MB
- **File storage**: 1 GB
- **Bandwidth**: 5 GB/month

For production apps, consider upgrading to a paid plan.

## Security Notes

1. **Never expose service role key** in frontend code
2. **Always use RLS policies** to protect data
3. **Validate user ownership** in update/delete operations
4. **Use HTTPS** in production
5. **Sanitize user input** before database operations

## Example: Complete CRUD Flow

```javascript
import { useAuth } from '@/context/AuthContext'
import { useSubscriptions } from '@/hooks/useSubscriptions'

function SubscriptionManager() {
  const { user } = useAuth()
  const { subscriptions, createSubscription, updateSubscription, deleteSubscription } = useSubscriptions()
  
  // Create
  const handleCreate = async () => {
    const { data, error } = await createSubscription({
      name: 'New Service',
      price: 9.99,
      cycle: 'monthly'
    })
    if (error) {
      alert('Error creating subscription: ' + error)
    }
  }
  
  // Update
  const handleUpdate = async (id) => {
    const { data, error } = await updateSubscription(id, {
      price: 19.99
    })
    if (error) {
      alert('Error updating subscription: ' + error)
    }
  }
  
  // Delete
  const handleDelete = async (id) => {
    const { error } = await deleteSubscription(id)
    if (error) {
      alert('Error deleting subscription: ' + error)
    }
  }
  
  return (
    <div>
      {subscriptions.map(sub => (
        <div key={sub.id}>
          <h3>{sub.name}</h3>
          <button onClick={() => handleUpdate(sub.id)}>Update</button>
          <button onClick={() => handleDelete(sub.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

