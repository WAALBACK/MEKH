import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeNotificationsOptions {
  userId: string | null;
  userType: 'technician' | 'client' | null;
  onNotificationUpdate: (count: number) => void;
  enabled?: boolean;
}

/**
 * Hook to manage real-time notifications with automatic fallback to polling
 * on slow connections
 */
export const useRealtimeNotifications = ({
  userId,
  userType,
  onNotificationUpdate,
  enabled = true,
}: UseRealtimeNotificationsOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'polling' | 'disconnected'>('disconnected');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    if (!userId || !userType) return;

    try {
      const column = userType === 'technician' ? 'technician_id' : 'client_id';
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq(column, userId)
        .eq('is_read', false);

      if (!error && count !== null) {
        onNotificationUpdate(count);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }, [userId, userType, onNotificationUpdate]);

  // Start polling fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;

    setConnectionStatus('polling');
    console.log('[Notifications] Using polling mode (60s interval)');

    // Initial fetch
    fetchNotificationCount();

    // Poll every 60 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchNotificationCount();
    }, 60000);
  }, [fetchNotificationCount]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Setup WebSocket connection
  const setupRealtimeConnection = useCallback(() => {
    if (!userId || !userType || !enabled) return;

    const column = userType === 'technician' ? 'technician_id' : 'client_id';

    // Create channel
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `${column}=eq.${userId}`,
        },
        () => {
          // Notification changed, refetch count
          fetchNotificationCount();
        }
      );

    // Set timeout for connection (5 seconds)
    connectionTimeoutRef.current = setTimeout(() => {
      console.warn('[Notifications] WebSocket connection timeout, falling back to polling');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      startPolling();
    }, 5000);

    // Subscribe
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Connection successful, clear timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        setConnectionStatus('connected');
        console.log('[Notifications] WebSocket connected');
        
        // Fetch initial count
        fetchNotificationCount();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn('[Notifications] WebSocket error, falling back to polling');
        startPolling();
      }
    });

    channelRef.current = channel;
  }, [userId, userType, enabled, fetchNotificationCount, startPolling]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    stopPolling();
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, [stopPolling]);

  // Check connection quality and decide on strategy
  useEffect(() => {
    if (!enabled || !userId || !userType) {
      cleanup();
      return;
    }

    // Check if navigator.connection API is available (for detecting slow connections)
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.saveData === true
    );

    if (isSlowConnection) {
      console.log('[Notifications] Slow connection detected, using polling mode');
      startPolling();
    } else {
      // Try WebSocket first
      setupRealtimeConnection();
    }

    return cleanup;
  }, [enabled, userId, userType, setupRealtimeConnection, startPolling, cleanup]);

  return {
    connectionStatus,
    refetch: fetchNotificationCount,
  };
};
