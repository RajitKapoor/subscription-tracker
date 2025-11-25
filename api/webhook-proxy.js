/**
 * Secure proxy for calling third-party APIs that require server-side authentication
 * 
 * This function uses the Supabase service role key to make secure API calls
 * that should not be exposed to the frontend.
 * 
 * Example use cases:
 * - Calling external payment APIs
 * - Webhook handlers for third-party services
 * - Secure data processing
 */

/**
 * Vercel serverless function format
 * Deploy to: /api/webhook-proxy
 */

export default async function handler(req, res) {
  // Dynamic import to avoid bundling in frontend
  const { createClient } = await import('@supabase/supabase-js')
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify request (add your own authentication logic)
    const { action, data } = req.body

    // Initialize Supabase with service role key
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Server-side only!
    )

    // Example: Process webhook from external service
    if (action === 'process_webhook') {
      // Your webhook processing logic here
      // This is just a placeholder
      console.log('Processing webhook:', data)

      return res.status(200).json({
        success: true,
        message: 'Webhook processed',
      })
    }

    // Example: Secure API call to external service
    if (action === 'external_api_call') {
      // Make secure API call using service role key
      // This would typically call a third-party API
      // that requires authentication

      return res.status(200).json({
        success: true,
        data: 'API call successful',
      })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Error in webhook proxy:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Example frontend usage:
 * 
 * const response = await fetch('/api/webhook-proxy', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     action: 'process_webhook',
 *     data: { ... }
 *   })
 * })
 */

