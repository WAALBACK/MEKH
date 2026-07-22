// Mekh PWA Service Worker - Enhanced with advanced caching strategies
const CACHE_NAME = 'mekh-v7';
const RUNTIME_CACHE = 'mekh-runtime-v7';
const IMAGE_CACHE = 'mekh-images-v7';
const API_CACHE = 'mekh-api-v7';

// Assets to pre-cache for offline support
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/mekh.png',
  '/assets/Blue logo.png',
  '/assets/favicon-32.png',
  '/assets/favicon-48.png',
  '/assets/favicon-64.png',
  '/assets/apple-touch-icon.png',
  '/assets/tiktok.png',
  '/assets/tiktok-placeholder.png'
];

// Background sync queue for offline actions
const BACKGROUND_SYNC_TAG = 'mekh-background-sync';
let syncQueue = [];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Pre-caching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      }),
      // Initialize other caches
      caches.open(RUNTIME_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE),
    ])
      .then(() => self.skipWaiting())
      .catch(err => console.log('[SW] Pre-cache failed:', err))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => 
              key !== CACHE_NAME && 
              key !== RUNTIME_CACHE && 
              key !== IMAGE_CACHE && 
              key !== API_CACHE
            )
            .map(key => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - advanced caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Handle images with cache-first strategy and longer TTL
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle API requests with network-first and background sync
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests (HTML pages) with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets with stale-while-revalidate
  event.respondWith(handleStaticAssets(request));
});

// Image handling with cache-first strategy
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Return cached image and update in background
    updateImageInBackground(request, cache);
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful responses with longer TTL for images
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline placeholder for images
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Update image in background (stale-while-revalidate)
async function updateImageInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// API handling with network-first and background sync
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful API responses with shorter TTL
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return cached response if network fails
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Queue for background sync if it's a POST/PUT/DELETE
    if (request.method !== 'GET') {
      queueBackgroundSync(request);
    }
    
    throw error;
  }
}

// Navigation handling with network-first
async function handleNavigationRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return cached page or fallback to index.html
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return cache.match('/index.html');
  }
}

// Static assets with stale-while-revalidate
async function handleStaticAssets(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cachedResponse || new Response('', { status: 503, statusText: 'Service Unavailable' }));

  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
function queueBackgroundSync(request) {
  syncQueue.push({
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: request.body,
    timestamp: Date.now(),
  });
  
  // Register background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    self.registration.sync.register(BACKGROUND_SYNC_TAG);
  }
}

// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(processBackgroundSync());
  }
});

// Process background sync queue
async function processBackgroundSync() {
  const queue = [...syncQueue];
  syncQueue = [];
  
  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: new Headers(item.headers),
        body: item.body,
      });
      
      if (!response.ok) {
        // Re-queue failed requests
        syncQueue.push(item);
      }
    } catch (error) {
      // Re-queue failed requests
      syncQueue.push(item);
    }
  }
}

// Push notification handling
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/192.png',
    badge: '/assets/64.png',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const data = event.notification.data;
  if (data && data.url) {
    event.waitUntil(
      clients.openWindow(data.url)
    );
  }
});

// Handle messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
