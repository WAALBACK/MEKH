/**
 * Service Worker registration and management
 */

/**
 * Register service worker with enhanced features
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service Worker registered successfully');

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is available
          console.log('[SW] New service worker available');
          
          // Notify user about update
          window.dispatchEvent(new CustomEvent('sw-update-available', {
            detail: { registration }
          }));
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('[SW] Cache updated:', event.data.url);
      }
    });

    return registration;
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
  }
};

/**
 * Skip waiting and activate new service worker
 */
export const skipWaiting = () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};

/**
 * Cache critical URLs
 */
export const cacheUrls = (urls: string[]) => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls,
    });
  }
};

/**
 * Check if app is running offline
 */
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

/**
 * Setup offline/online event listeners
 */
export const setupNetworkListeners = () => {
  const handleOnline = () => {
    console.log('[Network] Back online');
    window.dispatchEvent(new CustomEvent('network-online'));
  };

  const handleOffline = () => {
    console.log('[Network] Gone offline');
    window.dispatchEvent(new CustomEvent('network-offline'));
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};