import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationPayload {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { user_id, title, body, data, badge }: PushNotificationPayload = await req.json()

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's push tokens
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('user_push_tokens')
      .select('push_token, platform')
      .eq('user_id', user_id)

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No push tokens found for user' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send notifications to each token
    const results = []
    
    for (const tokenData of tokens) {
      try {
        // For Firebase Cloud Messaging (FCM) - Android
        if (tokenData.platform === 'android') {
          const fcmResponse = await sendFCMNotification({
            token: tokenData.push_token,
            title,
            body,
            data,
            badge
          })
          results.push({ platform: 'android', success: true, response: fcmResponse })
        }
        // For Apple Push Notification Service (APNS) - iOS
        else if (tokenData.platform === 'ios') {
          const apnsResponse = await sendAPNSNotification({
            token: tokenData.push_token,
            title,
            body,
            data,
            badge
          })
          results.push({ platform: 'ios', success: true, response: apnsResponse })
        }
      } catch (error) {
        console.error(`Error sending notification to ${tokenData.platform}:`, error)
        results.push({ 
          platform: tokenData.platform, 
          success: false, 
          error: error.message 
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Notifications sent', 
        results,
        total_tokens: tokens.length,
        successful: results.filter(r => r.success).length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Send notification via Firebase Cloud Messaging (Android)
async function sendFCMNotification({ token, title, body, data, badge }: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}) {
  const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')
  
  if (!FCM_SERVER_KEY) {
    throw new Error('FCM_SERVER_KEY environment variable not set')
  }

  const payload = {
    to: token,
    notification: {
      title,
      body,
      badge,
      sound: 'default',
      click_action: 'FLUTTER_NOTIFICATION_CLICK'
    },
    data: data || {}
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${FCM_SERVER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`FCM request failed: ${response.status} ${errorText}`)
  }

  return await response.json()
}

// Send notification via Apple Push Notification Service (iOS)
async function sendAPNSNotification({ token, title, body, data, badge }: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}) {
  // Note: This is a simplified example. In production, you would need to:
  // 1. Set up proper APNS certificates or JWT tokens
  // 2. Use the official APNS HTTP/2 API
  // 3. Handle APNS-specific payload formatting
  
  console.log('APNS notification would be sent here:', { token, title, body, data, badge })
  
  // For now, return a mock response
  return { 
    success: true, 
    message: 'APNS notification sending not implemented in this example' 
  }
}

/* 
Usage example:

POST /functions/v1/send-push-notification
{
  "user_id": "user-uuid-here",
  "title": "Booking Update",
  "body": "Your technician is on the way!",
  "data": {
    "booking_id": "booking-123",
    "route": "/bookings"
  },
  "badge": 1
}
*/