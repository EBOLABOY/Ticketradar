/**
 * 前端性能优化工具
 * 包括图片懒加载、资源预加载、缓存管理等
 */

// 图片懒加载
export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = null;
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.options
      );
    }
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.classList.add('loaded');
          this.observer.unobserve(img);
        }
      }
    });
  }
  
  observe(element) {
    if (this.observer) {
      this.observer.observe(element);
    } else {
      // 降级处理
      const src = element.dataset.src;
      if (src) {
        element.src = src;
      }
    }
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 资源预加载
export class ResourcePreloader {
  constructor() {
    this.preloadedResources = new Set();
  }
  
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(src)) {
        resolve(src);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve(src);
      };
      img.onerror = reject;
      img.src = src;
    });
  }
  
  preloadImages(srcArray) {
    return Promise.all(srcArray.map(src => this.preloadImage(src)));
  }
  
  preloadScript(src) {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(src)) {
        resolve(src);
        return;
      }
      
      const script = document.createElement('script');
      script.onload = () => {
        this.preloadedResources.add(src);
        resolve(src);
      };
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }
  
  preloadCSS(href) {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(href)) {
        resolve(href);
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => {
        this.preloadedResources.add(href);
        resolve(href);
      };
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  }
}

// 缓存管理
export class CacheManager {
  constructor(options = {}) {
    this.options = {
      maxAge: 5 * 60 * 1000, // 5分钟
      maxSize: 100, // 最大缓存条目数
      ...options
    };
    
    this.cache = new Map();
    this.accessTimes = new Map();
  }
  
  set(key, value, maxAge = this.options.maxAge) {
    // 清理过期缓存
    this.cleanup();
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.options.maxSize) {
      this.evictOldest();
    }
    
    const item = {
      value,
      timestamp: Date.now(),
      maxAge
    };
    
    this.cache.set(key, item);
    this.accessTimes.set(key, Date.now());
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.maxAge) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      return null;
    }
    
    // 更新访问时间
    this.accessTimes.set(key, Date.now());
    return item.value;
  }
  
  has(key) {
    return this.get(key) !== null;
  }
  
  delete(key) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
  }
  
  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }
  
  cleanup() {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.maxAge) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
      }
    }
  }
  
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, time] of this.accessTimes.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 防抖函数
export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 虚拟滚动
export class VirtualScroller {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemHeight: 50,
      buffer: 5,
      ...options
    };
    
    this.items = [];
    this.visibleItems = [];
    this.scrollTop = 0;
    this.containerHeight = 0;
    
    this.init();
  }
  
  init() {
    this.containerHeight = this.container.clientHeight;
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  setItems(items) {
    this.items = items;
    this.updateVisibleItems();
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.updateVisibleItems();
  }
  
  handleResize() {
    this.containerHeight = this.container.clientHeight;
    this.updateVisibleItems();
  }
  
  updateVisibleItems() {
    const { itemHeight, buffer } = this.options;
    const visibleCount = Math.ceil(this.containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeight) - buffer);
    const endIndex = Math.min(this.items.length, startIndex + visibleCount + buffer * 2);
    
    this.visibleItems = this.items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight
    }));
    
    // 触发更新事件
    if (this.onUpdate) {
      this.onUpdate(this.visibleItems, {
        startIndex,
        endIndex,
        totalHeight: this.items.length * itemHeight
      });
    }
  }
  
  scrollToIndex(index) {
    const top = index * this.options.itemHeight;
    this.container.scrollTop = top;
  }
  
  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }
}

// 性能监控
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      firstPaintTime: 0,
      firstContentfulPaintTime: 0,
      largestContentfulPaintTime: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };
    
    // 存储观察者实例以便清理
    this.observers = [];
    this.eventListeners = [];
    
    this.init();
  }
  
  init() {
    // 页面加载时间
    const loadHandler = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    };
    window.addEventListener('load', loadHandler);
    this.eventListeners.push({ target: window, event: 'load', handler: loadHandler });
    
    // Paint 时间
    if ('PerformanceObserver' in window) {
      // First Paint & First Contentful Paint
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            this.metrics.firstPaintTime = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaintTime = entry.startTime;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
      
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaintTime = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
      
      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            this.metrics.cumulativeLayoutShift += entry.value;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  logMetrics() {
    console.table(this.metrics);
  }
  
  sendMetrics(endpoint) {
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metrics: this.metrics,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(console.error);
  }
  
  cleanup() {
    // 断开所有 PerformanceObserver 连接
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting PerformanceObserver:', error);
      }
    });
    this.observers = [];
    
    // 移除所有事件监听器
    this.eventListeners.forEach(({ target, event, handler }) => {
      try {
        target.removeEventListener(event, handler);
      } catch (error) {
        console.warn('Error removing event listener:', error);
      }
    });
    this.eventListeners = [];
    
    // 清理指标数据
    this.metrics = {
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      firstPaintTime: 0,
      firstContentfulPaintTime: 0,
      largestContentfulPaintTime: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };
  }
}

// 全局实例
export const lazyImageLoader = new LazyImageLoader();
export const resourcePreloader = new ResourcePreloader();
export const cacheManager = new CacheManager();
export const performanceMonitor = new PerformanceMonitor();

// 错误监控设置
export function setupErrorMonitoring() {
  // 全局错误处理
  window.addEventListener('error', (event) => {
    console.error('Global error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });

    // 可以发送到错误监控服务
    // sendErrorToService(event);
  });

  // Promise 错误处理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    // 可以发送到错误监控服务
    // sendErrorToService(event);
  });

  // 资源加载错误
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('Resource loading error:', {
        type: event.target.tagName,
        source: event.target.src || event.target.href,
        message: event.message
      });
    }
  }, true);
}

// 浏览器兼容性检查
export function checkBrowserCompatibility() {
  const features = {
    intersectionObserver: 'IntersectionObserver' in window,
    performanceObserver: 'PerformanceObserver' in window,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    })(),
    serviceWorker: 'serviceWorker' in navigator,
    webWorker: typeof Worker !== 'undefined',
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    fetch: 'fetch' in window,
    promises: 'Promise' in window,
    es6: (() => {
      try {
        // eslint-disable-next-line no-new-func
        new Function('(a = 0) => a');
        return true;
      } catch (e) {
        return false;
      }
    })()
  };

  const unsupportedFeatures = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  if (unsupportedFeatures.length > 0) {
    console.warn('Unsupported browser features:', unsupportedFeatures);

    // 显示浏览器升级提示
    if (unsupportedFeatures.includes('es6') || unsupportedFeatures.includes('promises')) {
      showBrowserUpgradeNotice();
    }
  }

  return {
    isSupported: unsupportedFeatures.length === 0,
    features,
    unsupportedFeatures
  };
}

// 设备性能检测
export function detectDevicePerformance() {
  const performance = {
    level: 'high', // high, medium, low
    score: 100,
    details: {}
  };

  // CPU 核心数检测
  const cores = navigator.hardwareConcurrency || 4;
  performance.details.cores = cores;

  // 内存检测（如果支持）
  if ('memory' in performance) {
    const memory = performance.memory;
    performance.details.memory = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit
    };

    // 根据内存使用情况调整性能等级
    const memoryUsageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    if (memoryUsageRatio > 0.8) {
      performance.score -= 30;
    }
  }

  // 设备类型检测
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  performance.details.isMobile = isMobile;

  // 网络连接检测
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    performance.details.connection = {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    };

    // 根据网络状况调整性能等级
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      performance.score -= 40;
    } else if (connection.effectiveType === '3g') {
      performance.score -= 20;
    }
  }

  // 屏幕分辨率检测
  const screenArea = window.screen.width * window.screen.height;
  performance.details.screen = {
    width: window.screen.width,
    height: window.screen.height,
    area: screenArea,
    pixelRatio: window.devicePixelRatio || 1
  };

  // 根据屏幕分辨率调整性能等级
  if (screenArea > 2073600) { // 1920x1080
    performance.score += 10;
  } else if (screenArea < 921600) { // 1280x720
    performance.score -= 10;
  }

  // 移动设备性能调整
  if (isMobile) {
    performance.score -= 20;
  }

  // CPU 核心数调整
  if (cores >= 8) {
    performance.score += 20;
  } else if (cores <= 2) {
    performance.score -= 20;
  }

  // 确定最终性能等级
  if (performance.score >= 80) {
    performance.level = 'high';
  } else if (performance.score >= 50) {
    performance.level = 'medium';
  } else {
    performance.level = 'low';
  }

  console.log('Device performance detected:', performance);
  return performance;
}

// 显示浏览器升级提示
function showBrowserUpgradeNotice() {
  const notice = document.createElement('div');
  notice.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff9800;
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    ">
      <strong>浏览器版本过旧</strong> - 为了获得最佳体验，请升级到最新版本的浏览器
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none;
        border: 1px solid white;
        color: white;
        margin-left: 10px;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 3px;
      ">关闭</button>
    </div>
  `;
  document.body.appendChild(notice);

  // 10秒后自动关闭
  setTimeout(() => {
    if (notice.parentElement) {
      notice.remove();
    }
  }, 10000);
}

// 工具函数
export const utils = {
  debounce,
  throttle,

  // 检查是否为移动设备
  isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

  // 检查网络连接
  getConnectionType: () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? connection.effectiveType : 'unknown';
  },

  // 格式化文件大小
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 生成唯一ID
  generateId: () => Math.random().toString(36).substr(2, 9),

  // 深拷贝
  deepClone: (obj) => JSON.parse(JSON.stringify(obj))
};

const performanceOptimizer = {
  LazyImageLoader,
  ResourcePreloader,
  CacheManager,
  VirtualScroller,
  PerformanceMonitor,
  lazyImageLoader,
  resourcePreloader,
  cacheManager,
  performanceMonitor,
  setupErrorMonitoring,
  checkBrowserCompatibility,
  detectDevicePerformance,
  utils
};

export default performanceOptimizer;
