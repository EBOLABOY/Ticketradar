/**
 * 移动端性能优化工具集
 * 提供懒加载、代码分割、资源优化等功能
 */

import { deviceDetection } from './mobileUtils';

/**
 * 懒加载管理器
 */
export class LazyLoadManager {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      enableIntersectionObserver: 'IntersectionObserver' in window,
      ...options
    };
    
    this.observers = new Map();
    this.loadedElements = new WeakSet();
  }

  /**
   * 懒加载图片
   */
  lazyLoadImage(img, options = {}) {
    if (this.loadedElements.has(img)) return;

    const {
      placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGNUY1RjUiLz48L3N2Zz4=',
      onLoad,
      onError,
      fadeIn = true
    } = options;

    const originalSrc = img.dataset.src || img.src;
    
    // 设置占位符
    if (!img.src || img.src === originalSrc) {
      img.src = placeholder;
    }

    if (!this.options.enableIntersectionObserver) {
      // 降级方案：直接加载
      this.loadImage(img, originalSrc, { onLoad, onError, fadeIn });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target, originalSrc, { onLoad, onError, fadeIn });
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });

    observer.observe(img);
    this.observers.set(img, observer);
  }

  /**
   * 加载图片
   */
  loadImage(img, src, options = {}) {
    const { onLoad, onError, fadeIn } = options;
    
    if (this.loadedElements.has(img)) return;

    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = src;
      this.loadedElements.add(img);
      
      if (fadeIn) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        requestAnimationFrame(() => {
          img.style.opacity = '1';
        });
      }
      
      onLoad?.(img);
    };
    
    tempImg.onerror = () => {
      onError?.(img);
    };
    
    tempImg.src = src;
  }

  /**
   * 懒加载组件
   */
  lazyLoadComponent(element, loadComponent, options = {}) {
    const {
      onLoad,
      onError
    } = options;

    if (!this.options.enableIntersectionObserver) {
      loadComponent().then(onLoad).catch(onError);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadComponent()
            .then(component => {
              onLoad?.(component);
            })
            .catch(error => {
              onError?.(error);
            });
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });

    observer.observe(element);
    this.observers.set(element, observer);
  }

  /**
   * 清理观察器
   */
  cleanup(element) {
    const observer = this.observers.get(element);
    if (observer) {
      observer.unobserve(element);
      this.observers.delete(element);
    }
  }

  /**
   * 清理所有观察器
   */
  cleanupAll() {
    this.observers.forEach((observer, element) => {
      observer.unobserve(element);
    });
    this.observers.clear();
  }
}

/**
 * 资源预加载管理器
 */
export class ResourcePreloader {
  constructor() {
    this.preloadedResources = new Set();
    this.preloadPromises = new Map();
  }

  /**
   * 预加载图片
   */
  preloadImage(src, priority = 'low') {
    if (this.preloadedResources.has(src)) {
      return Promise.resolve();
    }

    if (this.preloadPromises.has(src)) {
      return this.preloadPromises.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      
      // 设置优先级
      if ('loading' in img) {
        img.loading = priority === 'high' ? 'eager' : 'lazy';
      }
      
      img.onload = () => {
        this.preloadedResources.add(src);
        resolve(img);
      };
      
      img.onerror = reject;
      img.src = src;
    });

    this.preloadPromises.set(src, promise);
    return promise;
  }

  /**
   * 预加载多个图片
   */
  preloadImages(srcs, priority = 'low') {
    return Promise.all(srcs.map(src => this.preloadImage(src, priority)));
  }

  /**
   * 预加载字体
   */
  preloadFont(fontUrl, fontFamily) {
    if (this.preloadedResources.has(fontUrl)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const font = new FontFace(fontFamily, `url(${fontUrl})`);
      
      font.load().then(() => {
        document.fonts.add(font);
        this.preloadedResources.add(fontUrl);
        resolve();
      }).catch(reject);
    });
  }

  /**
   * 预加载CSS
   */
  preloadCSS(href) {
    if (this.preloadedResources.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      
      link.onload = () => {
        // 转换为实际的样式表
        link.rel = 'stylesheet';
        this.preloadedResources.add(href);
        resolve();
      };
      
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
}

/**
 * 内存管理器
 */
export class MemoryManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = this.getOptimalCacheSize();
    this.cleanupInterval = null;
    
    this.startPeriodicCleanup();
  }

  /**
   * 获取最优缓存大小
   */
  getOptimalCacheSize() {
    const memory = navigator.deviceMemory || 4;
    const isMobile = deviceDetection.isMobile();
    
    if (isMobile) {
      return memory < 2 ? 50 : memory < 4 ? 100 : 200;
    }
    
    return memory < 4 ? 200 : memory < 8 ? 500 : 1000;
  }

  /**
   * 设置缓存
   */
  setCache(key, value, ttl = 300000) { // 默认5分钟
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0
    });
  }

  /**
   * 获取缓存
   */
  getCache(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // 更新访问计数
    item.accessCount++;
    item.timestamp = Date.now();
    
    return item.value;
  }

  /**
   * 清除过期缓存
   */
  clearExpired() {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 驱逐最旧的缓存项
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 开始定期清理
   */
  startPeriodicCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.clearExpired();
    }, 60000); // 每分钟清理一次
  }

  /**
   * 停止定期清理
   */
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage() {
    return {
      cacheSize: this.cache.size,
      maxCacheSize: this.maxCacheSize,
      usage: (this.cache.size / this.maxCacheSize * 100).toFixed(2) + '%'
    };
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTimes: [],
      memoryUsage: [],
      networkRequests: [],
      userInteractions: []
    };
    
    this.startMonitoring();
  }

  /**
   * 开始监控
   */
  startMonitoring() {
    // 监控渲染性能
    this.monitorRenderPerformance();
    
    // 监控内存使用
    this.monitorMemoryUsage();
    
    // 监控网络请求
    this.monitorNetworkRequests();
  }

  /**
   * 监控渲染性能
   */
  monitorRenderPerformance() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.metrics.renderTimes.push({
              name: entry.name,
              duration: entry.duration,
              timestamp: entry.startTime
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
    }
  }

  /**
   * 监控内存使用
   */
  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.metrics.memoryUsage.push({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        });
        
        // 保持最近100条记录
        if (this.metrics.memoryUsage.length > 100) {
          this.metrics.memoryUsage.shift();
        }
      }, 5000); // 每5秒记录一次
    }
  }

  /**
   * 监控网络请求
   */
  monitorNetworkRequests() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.networkRequests.push({
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
            timestamp: entry.startTime
          });
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }

  /**
   * 记录用户交互
   */
  recordInteraction(type, duration) {
    this.metrics.userInteractions.push({
      type,
      duration,
      timestamp: Date.now()
    });
    
    // 保持最近50条记录
    if (this.metrics.userInteractions.length > 50) {
      this.metrics.userInteractions.shift();
    }
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    const avgRenderTime = this.metrics.renderTimes.length > 0
      ? this.metrics.renderTimes.reduce((sum, item) => sum + item.duration, 0) / this.metrics.renderTimes.length
      : 0;
    
    const currentMemory = this.metrics.memoryUsage.length > 0
      ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]
      : null;
    
    return {
      averageRenderTime: avgRenderTime.toFixed(2) + 'ms',
      currentMemoryUsage: currentMemory ? {
        used: (currentMemory.used / 1024 / 1024).toFixed(2) + 'MB',
        total: (currentMemory.total / 1024 / 1024).toFixed(2) + 'MB',
        usage: ((currentMemory.used / currentMemory.total) * 100).toFixed(2) + '%'
      } : null,
      networkRequestsCount: this.metrics.networkRequests.length,
      userInteractionsCount: this.metrics.userInteractions.length
    };
  }
}

// 创建全局实例
export const lazyLoadManager = new LazyLoadManager();
export const resourcePreloader = new ResourcePreloader();
export const memoryManager = new MemoryManager();
export const performanceMonitor = new PerformanceMonitor();

// 默认导出
const mobilePerformanceOptimizer = {
  LazyLoadManager,
  ResourcePreloader,
  MemoryManager,
  PerformanceMonitor,
  lazyLoadManager,
  resourcePreloader,
  memoryManager,
  performanceMonitor
};

export default mobilePerformanceOptimizer;
