/**
 * Background sync utilities for offline functionality
 */

interface SyncAction {
  id: string;
  type: 'booking' | 'profile' | 'notification';
  data: any;
  timestamp: number;
  retries: number;
}

const SYNC_QUEUE_KEY = 'mekh_sync_queue';
const MAX_RETRIES = 3;

/**
 * Get sync queue from localStorage
 */
const getSyncQueue = (): SyncAction[] => {
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.warn('Failed to get sync queue:', error);
    return [];
  }
};

/**
 * Save sync queue to localStorage
 */
const saveSyncQueue = (queue: SyncAction[]) => {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('Failed to save sync queue:', error);
  }
};

/**
 * Add action to sync queue
 */
export const queueSyncAction = (type: SyncAction['type'], data: any): string => {
  const action: SyncAction = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  const queue = getSyncQueue();
  queue.push(action);
  saveSyncQueue(queue);

  console.log('[Sync] Action queued:', action.id);

  // Try to process immediately if online
  if (navigator.onLine) {
    processSyncQueue();
  }

  return action.id;
};

/**
 * Remove action from sync queue
 */
export const removeSyncAction = (id: string) => {
  const queue = getSyncQueue();
  const filteredQueue = queue.filter(action => action.id !== id);
  saveSyncQueue(filteredQueue);
};

/**
 * Process sync queue
 */
export const processSyncQueue = async () => {
  if (!navigator.onLine) {
    console.log('[Sync] Offline, skipping queue processing');
    return;
  }

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  console.log('[Sync] Processing queue with', queue.length, 'actions');

  const processedActions: string[] = [];
  const failedActions: SyncAction[] = [];

  for (const action of queue) {
    try {
      const success = await processAction(action);
      
      if (success) {
        processedActions.push(action.id);
        console.log('[Sync] Action processed successfully:', action.id);
      } else {
        // Increment retry count
        action.retries++;
        
        if (action.retries >= MAX_RETRIES) {
          console.warn('[Sync] Action failed after max retries:', action.id);
          processedActions.push(action.id); // Remove from queue
        } else {
          failedActions.push(action);
          console.log('[Sync] Action failed, will retry:', action.id);
        }
      }
    } catch (error) {
      console.error('[Sync] Error processing action:', action.id, error);
      action.retries++;
      
      if (action.retries >= MAX_RETRIES) {
        processedActions.push(action.id); // Remove from queue
      } else {
        failedActions.push(action);
      }
    }
  }

  // Update queue - remove processed actions, keep failed ones for retry
  const updatedQueue = queue.filter(action => 
    !processedActions.includes(action.id)
  );
  
  saveSyncQueue(updatedQueue);

  if (processedActions.length > 0) {
    console.log('[Sync] Processed', processedActions.length, 'actions');
  }
};

/**
 * Process individual sync action
 */
const processAction = async (action: SyncAction): Promise<boolean> => {
  switch (action.type) {
    case 'booking':
      return await processBookingAction(action.data);
    case 'profile':
      return await processProfileAction(action.data);
    case 'notification':
      return await processNotificationAction(action.data);
    default:
      console.warn('[Sync] Unknown action type:', action.type);
      return false;
  }
};

/**
 * Process booking-related actions
 */
const processBookingAction = async (data: any): Promise<boolean> => {
  try {
    // Import Supabase dynamically to avoid circular dependencies
    const { supabase } = await import('./supabase');
    
    if (data.action === 'create') {
      const { error } = await supabase
        .from('bookings')
        .insert(data.booking);
      
      return !error;
    }
    
    if (data.action === 'update') {
      const { error } = await supabase
        .from('bookings')
        .update(data.updates)
        .eq('id', data.bookingId);
      
      return !error;
    }
    
    return false;
  } catch (error) {
    console.error('[Sync] Booking action failed:', error);
    return false;
  }
};

/**
 * Process profile-related actions
 */
const processProfileAction = async (data: any): Promise<boolean> => {
  try {
    const { supabase } = await import('./supabase');
    
    if (data.action === 'update_client') {
      const { error } = await supabase
        .from('clients')
        .update(data.updates)
        .eq('user_id', data.userId);
      
      return !error;
    }
    
    if (data.action === 'update_technician') {
      const { error } = await supabase
        .from('technicians')
        .update(data.updates)
        .eq('user_id', data.userId);
      
      return !error;
    }
    
    return false;
  } catch (error) {
    console.error('[Sync] Profile action failed:', error);
    return false;
  }
};

/**
 * Process notification-related actions
 */
const processNotificationAction = async (data: any): Promise<boolean> => {
  try {
    const { supabase } = await import('./supabase');
    
    if (data.action === 'mark_read') {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', data.notificationId);
      
      return !error;
    }
    
    return false;
  } catch (error) {
    console.error('[Sync] Notification action failed:', error);
    return false;
  }
};

/**
 * Setup background sync listeners
 */
export const setupBackgroundSync = () => {
  // Process queue when coming back online
  window.addEventListener('online', () => {
    console.log('[Sync] Back online, processing queue');
    setTimeout(processSyncQueue, 1000); // Small delay to ensure connection is stable
  });

  // Process queue periodically when online
  const processInterval = setInterval(() => {
    if (navigator.onLine) {
      processSyncQueue();
    }
  }, 30000); // Every 30 seconds

  // Process queue on page visibility change (when user returns to app)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.onLine) {
      processSyncQueue();
    }
  });

  // Return cleanup function
  return () => {
    clearInterval(processInterval);
  };
};

/**
 * Get sync queue status
 */
export const getSyncStatus = () => {
  const queue = getSyncQueue();
  return {
    pending: queue.length,
    actions: queue.map(action => ({
      id: action.id,
      type: action.type,
      timestamp: action.timestamp,
      retries: action.retries,
    })),
  };
};