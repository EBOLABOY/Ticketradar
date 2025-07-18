/**
 * PWA (Progressive Web App) 工具集
 * 提供PWA相关功能，包括安装提示、离线缓存、推送通知等
 */

/**
 * PWA安装管理器
 */
export class PWAInstallManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isInstallable = false;
    this.installCallbacks = [];
    
    this.init();
  }

  /**
   * 初始化PWA安装管理器
   */
  init() {
    // 监听beforeinstallprompt事件
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallable = true;
      this.notifyCallbacks('installable', true);
    });

    // 监听appinstalled事件
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.isInstallable = false;
      this.notifyCallbacks('installed', true);
    });

    // 检查是否已安装
    this.checkIfInstalled();
  }

  /**
   * 检查是否已安装为PWA
   */
  checkIfInstalled() {
    // 检查是否在独立模式下运行
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return true;
    }

    // 检查是否在iOS Safari的主屏幕模式下
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      return true;
    }

    return false;
  }

  /**
   * 显示安装提示
   */
  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      throw new Error('PWA安装提示不可用');
    }

    const result = await this.deferredPrompt.prompt();
    const outcome = await result.userChoice;
    
    if (outcome === 'accepted') {
      this.notifyCallbacks('accepted', true);
    } else {
      this.notifyCallbacks('dismissed', true);
    }

    this.deferredPrompt = null;
    this.isInstallable = false;
    
    return outcome;
  }

  /**
   * 添加事件回调
   */
  onInstallEvent(callback) {
    this.installCallbacks.push(callback);
  }

  /**
   * 移除事件回调
   */
  removeInstallEvent(callback) {
    const index = this.installCallbacks.indexOf(callback);
    if (index > -1) {
      this.installCallbacks.splice(index, 1);
    }
  }

  /**
   * 通知回调函数
   */
  notifyCallbacks(event, data) {
    this.installCallbacks.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('PWA安装回调错误:', error);
      }
    });
  }

  /**
   * 获取安装状态
   */
  getInstallStatus() {
    return {
      isInstalled: this.isInstalled,
      isInstallable: this.isInstallable,
      canPrompt: !!this.deferredPrompt
    };
  }
}

/**
 * 离线缓存管理器
 */
export class OfflineCacheManager {
  constructor(options = {}) {
    this.cacheName = options.cacheName || 'ticketradar-cache-v1';
    this.staticAssets = options.staticAssets || [];
    this.apiCacheTime = options.apiCacheTime || 5 * 60 * 1000; // 5分钟
    this.maxCacheSize = options.maxCacheSize || 50; // 最大缓存条目数
  }

  /**
   * 初始化缓存
   */
  async init() {
    if ('serviceWorker' in navigator) {
      try {
        await this.registerServiceWorker();
        await this.cacheStaticAssets();
      } catch (error) {
        console.error('离线缓存初始化失败:', error);
      }
    }
  }

  /**
   * 注册Service Worker
   */
  async registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 有新版本可用
          this.notifyUpdate();
        }
      });
    });

    return registration;
  }

  /**
   * 缓存静态资源
   */
  async cacheStaticAssets() {
    const cache = await caches.open(this.cacheName);
    
    try {
      await cache.addAll(this.staticAssets);
    } catch (error) {
      console.error('静态资源缓存失败:', error);
    }
  }

  /**
   * 缓存API响应
   */
  async cacheApiResponse(url, response, options = {}) {
    const cache = await caches.open(this.cacheName);
    const { ttl = this.apiCacheTime } = options;
    
    // 添加时间戳到响应头
    const responseToCache = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'cache-timestamp': Date.now().toString(),
        'cache-ttl': ttl.toString()
      }
    });

    await cache.put(url, responseToCache);
    
    // 清理过期缓存
    await this.cleanupExpiredCache();
  }

  /**
   * 获取缓存的API响应
   */
  async getCachedApiResponse(url) {
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(url);
    
    if (!response) return null;

    // 检查是否过期
    const timestamp = response.headers.get('cache-timestamp');
    const ttl = response.headers.get('cache-ttl');
    
    if (timestamp && ttl) {
      const age = Date.now() - parseInt(timestamp);
      if (age > parseInt(ttl)) {
        await cache.delete(url);
        return null;
      }
    }

    return response;
  }

  /**
   * 清理过期缓存
   */
  async cleanupExpiredCache() {
    const cache = await caches.open(this.cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;
      
      const timestamp = response.headers.get('cache-timestamp');
      const ttl = response.headers.get('cache-ttl');
      
      if (timestamp && ttl) {
        const age = Date.now() - parseInt(timestamp);
        if (age > parseInt(ttl)) {
          await cache.delete(request);
        }
      }
    }

    // 如果缓存条目过多，删除最旧的
    const remainingRequests = await cache.keys();
    if (remainingRequests.length > this.maxCacheSize) {
      const toDelete = remainingRequests.slice(0, remainingRequests.length - this.maxCacheSize);
      await Promise.all(toDelete.map(request => cache.delete(request)));
    }
  }

  /**
   * 清空所有缓存
   */
  async clearCache() {
    await caches.delete(this.cacheName);
  }

  /**
   * 获取缓存大小
   */
  async getCacheSize() {
    const cache = await caches.open(this.cacheName);
    const requests = await cache.keys();
    return requests.length;
  }

  /**
   * 通知有更新可用
   */
  notifyUpdate() {
    // 可以通过事件或回调通知应用有更新
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }
}

/**
 * 推送通知管理器
 */
export class PushNotificationManager {
  constructor(options = {}) {
    this.vapidPublicKey = options.vapidPublicKey;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = Notification.permission;
  }

  /**
   * 请求通知权限
   */
  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('浏览器不支持推送通知');
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    
    return permission === 'granted';
  }

  /**
   * 订阅推送通知
   */
  async subscribe() {
    if (!this.isSupported || this.permission !== 'granted') {
      throw new Error('无法订阅推送通知：权限不足或不支持');
    }

    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
    });

    return subscription;
  }

  /**
   * 取消订阅推送通知
   */
  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    
    return false;
  }

  /**
   * 显示本地通知
   */
  async showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      throw new Error('无法显示通知：权限不足或不支持');
    }

    const registration = await navigator.serviceWorker.ready;
    
    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        timestamp: Date.now()
      },
      actions: []
    };

    await registration.showNotification(title, {
      ...defaultOptions,
      ...options
    });
  }

  /**
   * 转换VAPID密钥格式
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * 检查是否已订阅
   */
  async isSubscribed() {
    if (!this.isSupported) return false;
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return !!subscription;
  }
}

/**
 * 网络状态管理器
 */
export class NetworkStatusManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.callbacks = [];
    this.connectionType = this.getConnectionType();
    
    this.init();
  }

  /**
   * 初始化网络状态监听
   */
  init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks('online', true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks('offline', true);
    });

    // 监听连接类型变化
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.connectionType = this.getConnectionType();
        this.notifyCallbacks('connection-change', this.connectionType);
      });
    }
  }

  /**
   * 获取连接类型
   */
  getConnectionType() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }

  /**
   * 添加网络状态回调
   */
  onNetworkChange(callback) {
    this.callbacks.push(callback);
  }

  /**
   * 移除网络状态回调
   */
  removeNetworkChange(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 通知回调函数
   */
  notifyCallbacks(event, data) {
    this.callbacks.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('网络状态回调错误:', error);
      }
    });
  }

  /**
   * 检查是否为慢速连接
   */
  isSlowConnection() {
    if (!this.connectionType) return false;
    
    return this.connectionType.effectiveType === 'slow-2g' || 
           this.connectionType.effectiveType === '2g' ||
           this.connectionType.saveData;
  }
}

// 创建全局实例
export const pwaInstallManager = new PWAInstallManager();
export const offlineCacheManager = new OfflineCacheManager();
export const pushNotificationManager = new PushNotificationManager();
export const networkStatusManager = new NetworkStatusManager();

// 默认导出
const pwaUtils = {
  PWAInstallManager,
  OfflineCacheManager,
  PushNotificationManager,
  NetworkStatusManager,
  pwaInstallManager,
  offlineCacheManager,
  pushNotificationManager,
  networkStatusManager
};

export default pwaUtils;
