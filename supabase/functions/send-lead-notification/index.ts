import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Validate required environment variables
if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Retry up to 4 times — shorter delays for cold-start recovery (1s, 2s, 3s, 4s)
const sendEmailWithRetry = async (payload: object, retries = 4): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        console.log(`Email sent successfully on attempt ${attempt}`)
        return res
      }

      const errorData = await res.json().catch(() => ({}))
      console.error(`Attempt ${attempt}/${retries} failed:`, res.status, errorData)

      // Retry on rate limit (429) or server/cold-start errors (5xx)
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        const delay = 1000 * attempt
        console.log(`Waiting ${delay}ms before retry...`)
        await wait(delay)
        continue
      }

      // Don't retry on other 4xx errors
      return res
    } catch (fetchError) {
      console.error(`Fetch error on attempt ${attempt}:`, fetchError)
      if (attempt < retries) {
        const delay = 1000 * attempt
        console.log(`Waiting ${delay}ms before retry...`)
        await wait(delay)
        continue
      }
      throw fetchError
    }
  }
  throw new Error('All retry attempts exhausted')
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Validate HTTP method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate environment variables
    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables during request')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    let requestBody: any
    try {
      requestBody = await req.json()
    } catch (parseErr) {
      console.error('Failed to parse request body:', parseErr)
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const {
      technician_id,
      client_id,
      client_name,
      client_phone,
      service_requested,
      client_location,
      vehicle_model,
    }: {
      technician_id: string;
      client_id: string;
      client_name: string;
      client_phone: string;
      service_requested: string;
      client_location?: string;
      vehicle_model?: string;
    } = requestBody

    // Validate required fields
    if (!technician_id || !client_name || !client_phone || !service_requested) {
      console.error('Missing required fields:', { technician_id, client_name, client_phone, service_requested })
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        received: { technician_id: !!technician_id, client_name: !!client_name, client_phone: !!client_phone, service_requested: !!service_requested }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Fetch technician details
    const { data: technician, error: techError } = await supabase
      .from('technicians')
      .select('business_name, email')
      .eq('id', technician_id)
      .single()

    if (techError) {
      console.error('Error fetching technician:', techError)
      return new Response(JSON.stringify({ error: 'Failed to fetch technician details' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!technician) {
      console.error('Technician not found:', technician_id)
      return new Response(JSON.stringify({ error: 'Technician not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const technicianEmail = technician.email
    if (!technicianEmail) {
      console.error('Technician email is missing:', technician_id)
      return new Response(JSON.stringify({ error: 'Technician email not available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use app-redirect with ?next= pattern for universal deep linking (web + native app)
    const baseUrl = 'https://mekh.app'
    const dashboardLink = `${baseUrl}/app-redirect?next=${encodeURIComponent('com.mekh.app://technician-dashboard')}`

    // Send email
    const res = await sendEmailWithRetry({
      from: 'Mekh <noreply@mekh.app>',
      to: technicianEmail,
      subject: `New Lead: ${client_name} is interested in your services`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #ffffff; color-scheme: light;">
          <img src="https://mekh.app/assets/Blue logo.png" width="60" style="margin-bottom: 16px;" />
          <h2 style="color: #0f172a; margin-bottom: 8px;">New Lead 🎉</h2>
          <p style="color: #475569;">You have a new booking request on <strong>Mekh</strong>.</p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #94a3b8; font-size: 13px; padding: 6px 0; width: 40%;">Client Name</td>
                <td style="color: #0f172a; font-size: 13px; font-weight: 600; padding: 6px 0;">${client_name}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; font-size: 13px; padding: 6px 0;">Service</td>
                <td style="color: #0f172a; font-size: 13px; font-weight: 600; padding: 6px 0;">${service_requested}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; font-size: 13px; padding: 6px 0;">Phone</td>
                <td style="color: #0f172a; font-size: 13px; font-weight: 600; padding: 6px 0;">+${client_phone}</td>
              </tr>
              ${client_location ? `
              <tr>
                <td style="color: #94a3b8; font-size: 13px; padding: 6px 0;">Location</td>
                <td style="color: #0f172a; font-size: 13px; font-weight: 600; padding: 6px 0;">${client_location}</td>
              </tr>` : ''}
              ${vehicle_model ? `
              <tr>
                <td style="color: #94a3b8; font-size: 13px; padding: 6px 0;">Vehicle</td>
                <td style="color: #0f172a; font-size: 13px; font-weight: 600; padding: 6px 0;">${vehicle_model}</td>
              </tr>` : ''}
            </table>
          </div>

          <a href="${dashboardLink}" style="display: inline-block; background: #1877f2; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 8px 0;">View Lead in Dashboard →</a>

          <p style="color: #475569; font-size: 13px; margin-top: 16px;">
            The client has also reached out to you via WhatsApp. Respond quickly to secure the job!
          </p>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
            Mekh — Automotive Services Marketplace
          </p>
        </div>
      `
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Resend API error:', res.status, res.statusText, errorData)
      return new Response(JSON.stringify({
        error: `Email service error: ${res.status}`,
        details: errorData
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await res.json()
    console.log('Email sent successfully:', data)

    // Insert notification for technician
    const { error: notifError } = await supabase
      .from('notifications')
      .insert([{
        technician_id,
        client_id,
        type: 'new_lead',
        message: `New lead: ${client_name} from ${client_location || 'unknown location'} is interested in ${service_requested}. Check your dashboard.`
      }])

    if (notifError) {
      console.error('Failed to insert notification:', notifError)
      // Don't fail the whole function for notification error
    } else {
      console.log('Notification inserted successfully')
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Lead notification sent successfully',
      data: data
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Edge Function error:', errorMessage, err)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})