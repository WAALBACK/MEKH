import { supabase } from './supabase';

export interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushNotification({
  userId,
  title,
  body,
  data,
  badge
}: SendNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: result, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        user_id: userId,
        title,
        body,
        data,
        badge
      }
    });

    if (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Push notification sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send a booking update notification
 */
export async function sendBookingUpdateNotification(
  userId: string,
  bookingId: string,
  status: string,
  technicianName: string
): Promise<{ success: boolean; error?: string }> {
  const statusMessages = {
    contacted: `${technicianName} has responded to your booking request`,
    confirmed: `Your booking with ${technicianName} has been confirmed`,
    in_progress: `${technicianName} has started working on your vehicle`,
    job_done: `${technicianName} has completed the work on your vehicle`,
    cancelled: `Your booking with ${technicianName} has been cancelled`
  };

  const title = 'Booking Update';
  const body = statusMessages[status as keyof typeof statusMessages] || 'Your booking status has been updated';

  return sendPushNotification({
    userId,
    title,
    body,
    data: {
      booking_id: bookingId,
      route: '/bookings',
      type: 'booking_update'
    },
    badge: 1
  });
}

/**
 * Send a new message notification
 */
export async function sendMessageNotification(
  userId: string,
  senderName: string,
  message: string,
  bookingId?: string
): Promise<{ success: boolean; error?: string }> {
  return sendPushNotification({
    userId,
    title: `Message from ${senderName}`,
    body: message.length > 100 ? message.substring(0, 97) + '...' : message,
    data: {
      booking_id: bookingId,
      route: bookingId ? '/bookings' : '/messages',
      type: 'new_message'
    },
    badge: 1
  });
}

/**
 * Send a review request notification
 */
export async function sendReviewRequestNotification(
  userId: string,
  technicianName: string,
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  return sendPushNotification({
    userId,
    title: 'How was your experience?',
    body: `Please rate your experience with ${technicianName}`,
    data: {
      booking_id: bookingId,
      route: '/bookings?tab=completed',
      type: 'review_request'
    },
    badge: 1
  });
}

/**
 * Send a welcome notification to new users
 */
export async function sendWelcomeNotification(
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  return sendPushNotification({
    userId,
    title: `Welcome to Mekh, ${userName}!`,
    body: 'Find the best automotive technicians in Kenya. Start by browsing our verified professionals.',
    data: {
      route: '/',
      type: 'welcome'
    }
  });
}