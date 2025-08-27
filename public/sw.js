/**
 * Pointer Quest PWA Service Worker
 * Implements caching strategies for offline functionality and performance
 */

const CACHE_NAME = 'pointer-quest-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Critical resources to cache immediately
const CORE_CACHE_RESOURCES = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/offline.html'
];

// Lesson content to cache for offline learning
const LESSON_CACHE_RESOURCES = [
  '/lessons/1',
  '/lessons/2',
  '/lessons/3',
  '/lessons/4',
  '/lessons/5'
];

// Assets that can be cached on demand
const CACHE_STRATEGIES = {
  // Static assets - cache first
  STATIC_ASSETS: /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/,
  // API calls - network first with fallback
  API_CALLS: /\/api\//,
  // Lesson content - stale while revalidate
  LESSON_CONTENT: /\/lessons\//,
  // 3D assets - cache first (large files)
  THREEJS_ASSETS: /\.(gltf|glb|bin|hdr)$/
};

/**
 * Service Worker Installation
 * Pre-cache critical resources for offline functionality
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cache core resources
        await cache.addAll(CORE_CACHE_RESOURCES);
        console.log('[SW] Core resources cached');
        
        // Pre-cache first 5 lessons for offline learning
        try {
          await cache.addAll(LESSON_CACHE_RESOURCES);
          console.log('[SW] Lesson content pre-cached');
        } catch (lessonError) {
          console.warn('[SW] Some lessons failed to cache:', lessonError);
        }
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Installation failed:', error);
      }
    })()
  );
});

/**
 * Service Worker Activation
 * Clean up old caches and claim all clients
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
        
        // Take control of all clients immediately
        await self.clients.claim();
        console.log('[SW] Service worker activated and claimed clients');
        
        // Notify clients about update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            payload: { cacheVersion: CACHE_NAME }
          });
        });
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

/**
 * Fetch Event Handler
 * Implement different caching strategies based on resource type
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Only handle GET requests
  if (method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension requests
  if (url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

/**
 * Main fetch handler with different strategies
 */
async function handleFetch(request) {
  const { url } = request;
  
  try {
    // Static assets: Cache First
    if (CACHE_STRATEGIES.STATIC_ASSETS.test(url)) {
      return await cacheFirst(request);
    }
    
    // 3D assets: Cache First (important for performance)
    if (CACHE_STRATEGIES.THREEJS_ASSETS.test(url)) {
      return await cacheFirst(request);
    }
    
    // Lesson content: Stale While Revalidate
    if (CACHE_STRATEGIES.LESSON_CONTENT.test(url)) {
      return await staleWhileRevalidate(request);
    }
    
    // API calls: Network First
    if (CACHE_STRATEGIES.API_CALLS.test(url)) {
      return await networkFirst(request);
    }
    
    // Navigation requests: Network First with offline fallback
    if (request.mode === 'navigate') {
      return await handleNavigation(request);
    }
    
    // Default: Network First
    return await networkFirst(request);
    
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return await handleOfflineResponse(request);
  }
}

/**
 * Cache First Strategy
 * Good for static assets that rarely change
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  
  return response;
}

/**
 * Network First Strategy
 * Good for dynamic content
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update in background
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);
  
  return cached || await fetchPromise;
}

/**
 * Handle Navigation Requests
 * Show offline page when network fails
 */
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    console.log('[SW] Navigation failed, serving offline page');
  }
  
  // Try to serve from cache first
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  // Serve offline page
  return await caches.match(OFFLINE_URL);
}

/**
 * Handle offline responses
 */
async function handleOfflineResponse(request) {
  // Try cache first
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  // For HTML requests, serve offline page
  if (request.headers.get('accept').includes('text/html')) {
    return await caches.match(OFFLINE_URL);
  }
  
  // For other requests, return a generic offline response
  return new Response('Offline', {
    status: 408,
    headers: { 'Content-Type': 'text/plain' }
  });
}

/**
 * Message Handler
 * Handle messages from the main app
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION_INFO',
        payload: { version: CACHE_NAME }
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          payload: { success: true }
        });
      }).catch(error => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          payload: { success: false, error: error.message }
        });
      });
      break;
      
    case 'CACHE_LESSON':
      if (payload && payload.lessonUrl) {
        cacheLesson(payload.lessonUrl);
      }
      break;
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
}

/**
 * Cache a specific lesson for offline access
 */
async function cacheLesson(lessonUrl) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(lessonUrl);
    console.log('[SW] Cached lesson:', lessonUrl);
  } catch (error) {
    console.error('[SW] Failed to cache lesson:', lessonUrl, error);
  }
}

/**
 * Background Sync for lesson progress
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'lesson-progress-sync') {
    event.waitUntil(syncLessonProgress());
  }
});

/**
 * Sync lesson progress when back online
 */
async function syncLessonProgress() {
  try {
    // Get stored progress from IndexedDB
    const progress = await getStoredProgress();
    if (progress && progress.length > 0) {
      // Send to server when online
      await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });
      
      // Clear local storage after successful sync
      await clearStoredProgress();
      console.log('[SW] Progress synced successfully');
    }
  } catch (error) {
    console.error('[SW] Failed to sync progress:', error);
  }
}

/**
 * Placeholder functions for progress sync
 * These would integrate with your actual storage system
 */
async function getStoredProgress() {
  // Implement IndexedDB or localStorage logic
  return [];
}

async function clearStoredProgress() {
  // Implement cleanup logic
}