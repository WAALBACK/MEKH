import { useEffect, useState, useCallback } from 'react';
import { notificationService } from '../lib/notifications';
import { PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';

export interface UseNotificationsReturn {
  isInitialized: boolean;
  hasPermission: boolean;
  isRegistered: boolean;
  requestPermissions: () => Promise<boolean>;
  register: () => Promise<void>;
  unregister: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Initialize notifications on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await notificationService.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initialize();
  }, []);

  // Listen for notification events
  useEffect(() => {
    const handleNotificationReceived = (event: CustomEvent<PushNotificationSchema>) => {
      console.log('Notification received in component:', event.detail);
      // You can handle the notification here (show toast, update state, etc.)
    };

    const handleNotificationAction = (event: CustomEvent<{ route: string; data: any }>) => {
      console.log('Notification action in component:', event.detail);
      // Handle navigation or other actions
      const { route, data } = event.detail;
      
      // Example: Navigate to specific route
      if (route) {
        // You can use your router here
        // navigate(route);
      }
    };

    window.addEventListener('push-notification-received', handleNotificationReceived as EventListener);
    window.addEventListener('push-notification-action', handleNotificationAction as EventListener);

    return () => {
      window.removeEventListener('push-notification-received', handleNotificationReceived as EventListener);
      window.removeEventListener('push-notification-action', handleNotificationAction as EventListener);
    };
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (): Promise<void> => {
    try {
      await notificationService.registerForPushNotifications();
      setIsRegistered(true);
    } catch (error) {
      console.error('Failed to register for notifications:', error);
    }
  }, []);

  const unregister = useCallback(async (): Promise<void> => {
    try {
      await notificationService.unregisterFromPushNotifications();
      setIsRegistered(false);
      setHasPermission(false);
    } catch (error) {
      console.error('Failed to unregister from notifications:', error);
    }
  }, []);

  return {
    isInitialized,
    hasPermission,
    isRegistered,
    requestPermissions,
    register,
    unregister,
  };
};