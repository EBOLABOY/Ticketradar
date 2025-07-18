/**
 * Service Worker for TicketRadar PWA
 * 提供离线缓存、推送通知等功能
 */

const CACHE_NAME = 'ticketradar-cache-v1';
const API_CACHE_NAME = 'ticketradar-api-cache-v1';
const STATIC_CACHE_NAME = 'ticketradar-static-cache-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// API缓存策略配置
const API_CACHE_CONFIG = {
  '/api/flights': { strategy: 'networkFirst', ttl: 5 * 60 * 1000 }, // 5分钟
  '/api/airports': { strategy: 'cacheFirst', ttl: 24 * 60 * 60 * 1000 }, // 24小时
  '/api/user': { strategy: 'networkFirst', ttl: 10 * 60 * 1000 }, // 10分钟
  '/api/monitor': { strategy: 'networkFirst', ttl: 2 * 60 * 1000 } // 2分钟
};

/**
 * 安装事件 - 缓存静态资源
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.error('静态资源缓存失败:', error);
          // 即使部分资源缓存失败，也继续安装
          return Promise.resolve();
        });
      }),
      // 跳过等待，立即激活
      self.skipWaiting()
    ])
  );
});

/**
 * 激活事件 - 清理旧缓存
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME) {
              console.log('删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即控制所有客户端
      self.clients.claim()
    ])
  );
});

/**
 * 网络请求拦截
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }
  
  // API请求处理
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 静态资源请求处理
  event.respondWith(handleStaticRequest(request));
});

/**
 * 处理API请求
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 查找匹配的缓存配置
  let config = null;
  for (const [pattern, cfg] of Object.entries(API_CACHE_CONFIG)) {
    if (pathname.startsWith(pattern)) {
      config = cfg;
      break;
    }
  }
  
  // 如果没有配置，使用默认的网络优先策略
  if (!config) {
    config = { strategy: 'networkFirst', ttl: 5 * 60 * 1000 };
  }
  
  switch (config.strategy) {
    case 'networkFirst':
      return networkFirst(request, API_CACHE_NAME, config.ttl);
    case 'cacheFirst':
      return cacheFirst(request, API_CACHE_NAME, config.ttl);
    case 'networkOnly':
      return fetch(request);
    case 'cacheOnly':
      return caches.match(request);
    default:
      return networkFirst(request, API_CACHE_NAME, config.ttl);
  }
}

/**
 * 处理静态资源请求
 */
async function handleStaticRequest(request) {
  // 对于导航请求，返回缓存的index.html
  if (request.mode === 'navigate') {
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // 其他静态资源使用缓存优先策略
  return cacheFirst(request, STATIC_CACHE_NAME, 24 * 60 * 60 * 1000);
}

/**
 * 网络优先策略
 */
async function networkFirst(request, cacheName, ttl) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      // 缓存成功的响应
      const cache = await caches.open(cacheName);
      const responseToCache = response.clone();
      
      // 添加时间戳
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      headers.set('sw-cache-ttl', ttl.toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return response;
  } catch (error) {
    console.log('网络请求失败，尝试从缓存获取:', request.url);
    
    const cachedResponse = await getCachedResponse(request, cacheName);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果是API请求且没有缓存，返回离线响应
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: '网络不可用', 
          offline: true,
          message: '当前处于离线模式，请检查网络连接'
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

/**
 * 缓存优先策略
 */
async function cacheFirst(request, cacheName, ttl) {
  const cachedResponse = await getCachedResponse(request, cacheName);
  
  if (cachedResponse) {
    // 后台更新缓存
    updateCacheInBackground(request, cacheName, ttl);
    return cachedResponse;
  }
  
  // 缓存中没有，从网络获取
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = response.clone();
      
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      headers.set('sw-cache-ttl', ttl.toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    
    return response;
  } catch (error) {
    console.error('网络请求失败:', error);
    throw error;
  }
}

/**
 * 获取缓存响应（检查TTL）
 */
async function getCachedResponse(request, cacheName) {
  const cache = await caches.open(cacheName);
  const response = await cache.match(request);
  
  if (!response) return null;
  
  // 检查TTL
  const timestamp = response.headers.get('sw-cache-timestamp');
  const ttl = response.headers.get('sw-cache-ttl');
  
  if (timestamp && ttl) {
    const age = Date.now() - parseInt(timestamp);
    if (age > parseInt(ttl)) {
      // 缓存已过期，删除
      await cache.delete(request);
      return null;
    }
  }
  
  return response;
}

/**
 * 后台更新缓存
 */
async function updateCacheInBackground(request, cacheName, ttl) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = response.clone();
      
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-timestamp', Date.now().toString());
      headers.set('sw-cache-ttl', ttl.toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
  } catch (error) {
    console.log('后台缓存更新失败:', error);
  }
}

/**
 * 推送通知处理
 */
self.addEventListener('push', (event) => {
  console.log('收到推送消息:', event);
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: '票达雷达', body: event.data.text() };
    }
  }
  
  const options = {
    body: data.body || '您有新的航班价格提醒',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: '查看详情',
        icon: '/icon-view.png'
      },
      {
        action: 'dismiss',
        title: '忽略',
        icon: '/icon-dismiss.png'
      }
    ],
    requireInteraction: true,
    tag: data.tag || 'default'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '票达雷达', options)
  );
});

/**
 * 通知点击处理
 */
self.addEventListener('notificationclick', (event) => {
  console.log('通知被点击:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // 打开应用
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // 忽略通知
    return;
  } else {
    // 默认行为：打开应用
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * 后台同步
 */
self.addEventListener('sync', (event) => {
  console.log('后台同步:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * 执行后台同步
 */
async function doBackgroundSync() {
  try {
    // 这里可以执行一些后台任务
    // 比如同步离线时的操作、更新缓存等
    console.log('执行后台同步任务');
  } catch (error) {
    console.error('后台同步失败:', error);
  }
}
