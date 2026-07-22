# Push Notifications Setup Guide

This guide explains how to set up and use push notifications in the Mekh app.

## Overview

The push notification system consists of:
- **Capacitor Push Notifications Plugin** - Handles native push notifications
- **Notification Service** - Manages registration and token storage
- **React Hook** - Easy integration in components
- **Supabase Edge Function** - Backend notification sending
- **Utility Functions** - Pre-built notification types

## Installation

The push notifications plugin has already been installed and configured:

```bash
npm install @capacitor/push-notifications --legacy-peer-deps
npx cap sync android
```

## Database Setup

Run the migration to create the push tokens table:

```sql
-- Run this in your Supabase SQL editor
-- File: migrations/047_add_push_notifications_table.sql
```

## Android Configuration

### 1. Firebase Setup (Required for Android)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Add an Android app with package name: `com.mekh.app`
4. Download `google-services.json` and place it in `android/app/`
5. Get your Server Key from Project Settings > Cloud Messaging

### 2. Environment Variables

Add to your Supabase Edge Functions environment:

```bash
# In Supabase Dashboard > Edge Functions > Settings
FCM_SERVER_KEY=your_firebase_server_key_here
```

## Usage in Components

### Basic Usage with Hook

```tsx
import { useNotifications } from '../src/hooks/useNotifications';

function MyComponent() {
  const { 
    isInitialized, 
    hasPermission, 
    isRegistered, 
    requestPermissions, 
    register 
  } = useNotifications();

  const handleEnableNotifications = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (granted) {
        await register();
      }
    }
  };

  return (
    <button onClick={handleEnableNotifications}>
      Enable Notifications
    </button>
  );
}
```

### Using the Settings Component

```tsx
import { NotificationSettings } from '../src/components/NotificationSettings';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <NotificationSettings />
    </div>
  );
}
```

## Sending Notifications

### From Backend (Recommended)

Use the utility functions in your backend code:

```typescript
import { sendBookingUpdateNotification } from '../src/lib/pushNotifications';

// Send booking update
await sendBookingUpdateNotification(
  userId,
  bookingId,
  'confirmed',
  'John Doe Motors'
);

// Send custom notification
await sendPushNotification({
  userId: 'user-uuid',
  title: 'Custom Title',
  body: 'Custom message',
  data: { route: '/custom-page' }
});
```

### From Supabase Edge Function

```typescript
// Call the edge function directly
const { data, error } = await supabase.functions.invoke('send-push-notification', {
  body: {
    user_id: 'user-uuid',
    title: 'Notification Title',
    body: 'Notification message',
    data: { route: '/target-page' }
  }
});
```

## Notification Types

The system includes pre-built notification types:

1. **Booking Updates** - Status changes, confirmations
2. **Messages** - Direct messages from technicians
3. **Review Requests** - Ask for feedback after completed jobs
4. **Welcome** - Onboarding for new users

## Handling Notification Actions

Notifications can include data that triggers navigation:

```typescript
// In your notification listener
window.addEventListener('push-notification-action', (event) => {
  const { route, data } = event.detail;
  
  if (route) {
    navigate(route); // Use your router
  }
});
```

## Testing

### Test on Device

1. Build and install the app on a physical device
2. Enable notifications in the app settings
3. Send a test notification using the edge function
4. Verify the notification appears and tapping navigates correctly

### Test Notification Sending

```bash
# Using curl to test the edge function
curl -X POST 'https://your-project.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "user-uuid-here",
    "title": "Test Notification",
    "body": "This is a test message",
    "data": {"route": "/"}
  }'
```

## Troubleshooting

### Common Issues

1. **Notifications not received**
   - Check if permissions are granted
   - Verify FCM server key is correct
   - Ensure device has internet connection

2. **Token not saved**
   - Check database permissions (RLS policies)
   - Verify user is authenticated when registering

3. **Android build issues**
   - Ensure `google-services.json` is in correct location
   - Run `npx cap sync android` after changes

### Debug Logs

Enable debug logging to troubleshoot:

```typescript
// In your app initialization
console.log('Push notifications initialized:', isInitialized);
console.log('Has permission:', hasPermission);
console.log('Is registered:', isRegistered);
```

## Security Considerations

- Push tokens are stored securely with RLS policies
- Only authenticated users can register tokens
- Server key should be kept secret in environment variables
- Validate notification content on the backend

## iOS Setup (Future)

For iOS support, you'll need to:
1. Set up Apple Developer account
2. Create APNS certificates or JWT tokens
3. Configure iOS app in Capacitor
4. Update the edge function to handle APNS

The current implementation includes placeholders for iOS support.

## Performance Tips

- Notifications are initialized automatically on app start
- Registration happens only once per app install
- Tokens are cached and reused
- Failed notifications are logged for debugging

## Next Steps

1. Set up Firebase project and get server key
2. Deploy the edge function to Supabase
3. Test notifications on a physical device
4. Integrate notification sending into your booking flow
5. Monitor notification delivery and engagement