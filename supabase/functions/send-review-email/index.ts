const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Retry up to 4 times — handles Resend free-tier cold starts
const sendEmailWithRetry = async (apiKey: string, payload: object, retries = 4): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    if (res.ok) return res

    const errorData = await res.json().catch(() => ({}))
    console.error(`Attempt ${attempt}/${retries} failed:`, res.status, errorData)

    // Retry on rate limit (429) or server/cold-start errors (5xx)
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const delay = 1000 * attempt // 1s, 2s, 3s — shorter for cold start recovery
      console.log(`Waiting ${delay}ms before retry...`)
      await wait(delay)
      continue
    }

    // Don't retry on other 4xx errors
    return res
  }
  throw new Error('All retry attempts exhausted')
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY secret is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const { client_email, client_name, business_name, technician_slug: _technician_slug, booking_id } = body

    if (!client_email || !client_name || !business_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use app-redirect with ?next= pattern for universal deep linking (web + native app)
    const baseUrl = 'https://mekh.app'
    const reviewLink = `${baseUrl}/app-redirect?next=${encodeURIComponent('com.mekh.app://bookings' + (booking_id ? `/${booking_id}` : ''))}`

    const res = await sendEmailWithRetry(RESEND_API_KEY, {
      from: 'Mekh <noreply@mekh.app>',
      to: client_email,
      subject: `How was your experience with ${business_name}?`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #ffffff; color-scheme: light;">
          <img src="https://mekh.app/assets/Blue logo.png" width="60" style="margin-bottom: 16px;" />
          <h2 style="color: #0f172a; margin-bottom: 8px;">Hi ${client_name},</h2>
          <p style="color: #475569;">Your recent service with <strong>${business_name}</strong> has been completed.</p>
          <p style="color: #475569;">Got a minute? Leave a quick rating — it helps other car owners in Kenya find trusted technicians.</p>
          <a href="${reviewLink}"
             style="display: inline-block; background: #1877f2; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
            ⭐ Leave a Review ⭐
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
            Mekh — Automotive Services Marketplace
          </p>
        </div>
      `
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Resend error after retries:', res.status, errorData)
      return new Response(JSON.stringify({
        error: `Resend API error: ${res.status}`,
        details: errorData
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Edge Function error:', err)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})