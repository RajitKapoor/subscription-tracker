/**
 * Serverless function to sync and check upcoming renewals
 * Can be scheduled via Vercel Cron or GitHub Actions
 * 
 * This function checks for subscriptions renewing in the next 7 days
 * and could send notifications (email, in-app flags, etc.)
 * 
 * For now, this is a placeholder that logs upcoming renewals.
 * Extend this to integrate with email services, push notifications, etc.
 */

/**
 * Vercel serverless function format
 * Deploy to: /api/sync-renewals
 */

export default async function handler(req, res) {
  // Only allow POST requests (for cron triggers)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Dynamic import to avoid bundling in frontend
  const { createClient } = await import('@supabase/supabase-js')

  // Verify cron secret if using Vercel Cron
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Initialize Supabase with service role key (server-side only)
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Never expose this in frontend!
    )

    // Calculate date range (next 7 days)
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    const todayStr = today.toISOString().split('T')[0]
    const nextWeekStr = nextWeek.toISOString().split('T')[0]

    // Fetch subscriptions renewing in the next 7 days
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, name, price, renewal_date, cycle')
      .gte('renewal_date', todayStr)
      .lte('renewal_date', nextWeekStr)
      .order('renewal_date', { ascending: true })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return res.status(500).json({ error: error.message })
    }

    // Group by user for potential notifications
    const byUser = {}
    subscriptions.forEach((sub) => {
      if (!byUser[sub.user_id]) {
        byUser[sub.user_id] = []
      }
      byUser[sub.user_id].push(sub)
    })

    // TODO: Send notifications to users
    // For now, just log the results
    console.log(`Found ${subscriptions.length} subscriptions renewing in the next 7 days`)
    console.log(`Affected users: ${Object.keys(byUser).length}`)

    // Example: Create calendar links or in-app flags
    // You could store these in a notifications table or send emails

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      users: Object.keys(byUser).length,
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        name: sub.name,
        renewal_date: sub.renewal_date,
        price: sub.price,
      })),
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

