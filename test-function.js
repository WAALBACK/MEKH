// Test script to check if send-review-email-resend function is deployed
// Run this in your browser console when logged into your app

// Access the existing supabase client from your app
const supabase = window.supabase || window.supabaseClient; // Adjust based on how it's exposed

async function testFunction() {
  try {
    console.log('🧪 Testing send-review-email-resend function...')

    const result = await supabase.functions.invoke('send-review-email-resend', {
      body: {
        client_email: 'test@example.com',
        client_name: 'Test Client',
        business_name: 'Test Business',
        technician_slug: 'test-tech'
      }
    })

    console.log('✅ Function exists and responded:', result)
    return result
  } catch (error) {
    console.error('❌ Function test failed:', error)
    console.log('This likely means the function is not deployed or the name is wrong')
    throw error
  }
}

// Call the function
testFunction()