// ===== SERVICE WORKER ДЛЯ PWA =====

const CACHE_NAME = 'arconique-v7.7.0';
const STATIC_CACHE = 'arconique-static-v7.7.0';
const DYNAMIC_CACHE = 'arconique-dynamic-v7.7.0';

// Файлы для кэширования
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/components.js',
  '/utils.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Стратегии кэширования
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'stale-while-revalidate',
  API: 'network-first',
  FALLBACK: 'cache-only'
};

// ===== УСТАНОВКА SERVICE WORKER =====

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static files:', error);
      })
  );
});

// ===== АКТИВАЦИЯ SERVICE WORKER =====

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// ===== ПЕРЕХВАТ СЕТЕВЫХ ЗАПРОСОВ =====

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Определяем стратегию кэширования
  let strategy = CACHE_STRATEGIES.DYNAMIC;
  
  if (STATIC_FILES.includes(request.url)) {
    strategy = CACHE_STRATEGIES.STATIC;
  } else if (url.pathname.startsWith('/api/')) {
    strategy = CACHE_STRATEGIES.API;
  }
  
  // Применяем стратегию
  switch (strategy) {
    case CACHE_STRATEGIES.STATIC:
      event.respondWith(cacheFirst(request));
      break;
    case CACHE_STRATEGIES.DYNAMIC:
      event.respondWith(staleWhileRevalidate(request));
      break;
    case CACHE_STRATEGIES.API:
      event.respondWith(networkFirst(request));
      break;
    default:
      event.respondWith(staleWhileRevalidate(request));
  }
});

// ===== СТРАТЕГИИ КЭШИРОВАНИЯ =====

// Cache First - для статических файлов
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Stale While Revalidate - для динамического контента
async function staleWhileRevalidate(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Возвращаем кэшированный ответ немедленно
    const fetchPromise = fetch(request).then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
  } catch (error) {
    console.error('Stale While Revalidate strategy failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network First - для API запросов
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Network First strategy failed:', error);
    
    // Пытаемся получить из кэша
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline content not available', { status: 503 });
  }
}

// ===== ФОНЕВЫЕ СИНХРОНИЗАЦИИ =====

self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Синхронизация данных при восстановлении соединения
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_DATA',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// ===== PUSH УВЕДОМЛЕНИЯ =====

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от Arconique',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Arconique', options)
  );
});

// ===== ОБРАБОТКА КЛИКОВ ПО УВЕДОМЛЕНИЯМ =====

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ===== ОБРАБОТКА СООБЩЕНИЙ =====

self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: '7.7.0' });
      break;
      
    case 'CACHE_DATA':
      cacheUserData(data);
      break;
      
    case 'GET_CACHED_DATA':
      getCachedUserData(event.ports[0]);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

// ===== РАБОТА С ДАННЫМИ ПОЛЬЗОВАТЕЛЯ =====

async function cacheUserData(data) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put('/user-data', response);
    console.log('Service Worker: User data cached');
  } catch (error) {
    console.error('Service Worker: Failed to cache user data:', error);
  }
}

async function getCachedUserData(port) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match('/user-data');
    
    if (response) {
      const data = await response.json();
      port.postMessage({ success: true, data });
    } else {
      port.postMessage({ success: false, message: 'No cached data' });
    }
  } catch (error) {
    console.error('Service Worker: Failed to get cached user data:', error);
    port.postMessage({ success: false, error: error.message });
  }
}

async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('Service Worker: All caches cleared');
  } catch (error) {
    console.error('Service Worker: Failed to clear caches:', error);
  }
}

// ===== ОБРАБОТКА ОШИБОК =====

self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection:', event.reason);
});

// ===== ПЕРИОДИЧЕСКАЯ СИНХРОНИЗАЦИЯ =====

// Проверяем обновления каждые 24 часа
setInterval(async () => {
  try {
    const response = await fetch('/manifest.json');
    if (response.ok) {
      const manifest = await response.json();
      if (manifest.version !== '7.7.0') {
        console.log('Service Worker: New version available:', manifest.version);
        // Уведомляем клиент о доступности обновления
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'UPDATE_AVAILABLE',
            version: manifest.version
          });
        });
      }
    }
  } catch (error) {
    console.log('Service Worker: Version check failed:', error);
  }
}, 24 * 60 * 60 * 1000);

// ===== ОФФЛАЙН ФУНКЦИОНАЛЬНОСТЬ =====

// Кэшируем важные данные для офлайн работы
const OFFLINE_DATA = {
  defaultStages: [
    { id: 1, label: 'Договор', pct: 30, month: 0 },
    { id: 2, label: '50% готовности', pct: 30, month: 6 },
    { id: 3, label: '70% готовности', pct: 20, month: 9 },
    { id: 4, label: '90% готовности', pct: 15, month: 11 },
    { id: 5, label: 'Ключи', pct: 5, month: 12 }
  ],
  defaultCatalog: [
    {
      projectId: 'demo',
      projectName: 'Демо проект',
      villas: [
        {
          villaId: 'demo-villa',
          name: 'Демо вилла',
          area: 100,
          ppsm: 2500,
          baseUSD: 250000
        }
      ]
    }
  ]
};

// Сохраняем офлайн данные при установке
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      const response = new Response(JSON.stringify(OFFLINE_DATA), {
        headers: { 'Content-Type': 'application/json' }
      });
      return cache.put('/offline-data', response);
    })
  );
});

// ===== АНАЛИТИКА И МОНИТОРИНГ =====

// Отслеживаем производительность кэширования
const CACHE_STATS = {
  hits: 0,
  misses: 0,
  errors: 0
};

function updateCacheStats(hit) {
  if (hit) {
    CACHE_STATS.hits++;
  } else {
    CACHE_STATS.misses++;
  }
  
  // Отправляем статистику клиенту каждые 100 запросов
  if ((CACHE_STATS.hits + CACHE_STATS.misses) % 100 === 0) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CACHE_STATS',
          stats: CACHE_STATS
        });
      });
    });
  }
}

// ===== УТИЛИТЫ =====

// Проверка доступности сети
function isOnline() {
  return navigator.onLine;
}

// Задержка для retry логики
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry логика для сетевых запросов
async function fetchWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(request);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // Экспоненциальная задержка
    }
  }
}

console.log('Service Worker: Loaded successfully');
