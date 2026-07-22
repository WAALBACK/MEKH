import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

export interface NotificationService {
  initialize: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<string | null>;
  unregisterFromPushNotifications: () => Promise<void>;
}

class CapacitorNotificationService implements NotificationService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized || !Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Request permission to use push notifications
      await PushNotifications.requestPermissions();

      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        this.savePushToken(token.value);
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        // You can show a local notification or update the UI here
        this.handleNotificationReceived(notification);
      });

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        this.handleNotificationAction(notification);
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
      return false;
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      await PushNotifications.register();
      // The token will be received in the 'registration' listener
      return null; // Token is handled in the listener
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async unregisterFromPushNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Remove the device token from your backend
      await this.removePushToken();
      
      // Remove all listeners
      await PushNotifications.removeAllListeners();
    } catch (error) {
      console.error('Error unregistering from push notifications:', error);
    }
  }

  private async savePushToken(token: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Save the push token to your backend
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: session.user.id,
          push_token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error in savePushToken:', error);
    }
  }

  private async removePushToken(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_push_tokens')
        .delete()
        .eq('user_id', session.user.id)
        .eq('platform', Capacitor.getPlatform());

      if (error) {
        console.error('Error removing push token:', error);
      }
    } catch (error) {
      console.error('Error in removePushToken:', error);
    }
  }

  private handleNotificationReceived(notification: PushNotificationSchema): void {
    // Handle notification received while app is in foreground
    // You can show a toast, update UI, etc.
    console.log('Notification received in foreground:', notification);
    
    // Dispatch a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('push-notification-received', {
      detail: notification
    }));
  }

  private handleNotificationAction(notification: ActionPerformed): void {
    // Handle notification tap/action
    console.log('Notification action performed:', notification);
    
    // Navigate to specific screen based on notification data
    const data = notification.notification.data;
    if (data?.route) {
      // You can use your router to navigate
      window.dispatchEvent(new CustomEvent('push-notification-action', {
        detail: { route: data.route, data }
      }));
    }
  }
}

// Web fallback (does nothing on web)
class WebNotificationService implements NotificationService {
  async initialize(): Promise<void> {
    console.log('Push notifications not supported on web');
  }

  async requestPermissions(): Promise<boolean> {
    return false;
  }

  async registerForPushNotifications(): Promise<string | null> {
    return null;
  }

  async unregisterFromPushNotifications(): Promise<void> {
    // No-op
  }
}

// Export the appropriate service based on platform
export const notificationService: NotificationService = Capacitor.isNativePlatform() 
  ? new CapacitorNotificationService()
  : new WebNotificationService();

// Convenience functions
export const initializeNotifications = () => notificationService.initialize();
export const requestNotificationPermissions = () => notificationService.requestPermissions();
export const registerForNotifications = () => notificationService.registerForPushNotifications();
export const unregisterFromNotifications = () => notificationService.unregisterFromPushNotifications();