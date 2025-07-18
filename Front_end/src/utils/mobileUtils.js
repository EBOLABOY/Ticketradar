/**
 * 移动端工具函数集合
 * 提供移动端特有的功能和优化
 */

/**
 * 设备检测工具
 */
export const deviceDetection = {
  /**
   * 检测是否为移动设备
   */
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * 检测是否为iOS设备
   */
  isIOS: () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  /**
   * 检测是否为Android设备
   */
  isAndroid: () => {
    if (typeof window === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  },

  /**
   * 检测是否为平板设备
   */
  isTablet: () => {
    if (typeof window === 'undefined') return false;
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  },

  /**
   * 获取设备像素比
   */
  getPixelRatio: () => {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  },

  /**
   * 获取屏幕尺寸信息
   */
  getScreenInfo: () => {
    if (typeof window === 'undefined') return { width: 0, height: 0, orientation: 'portrait' };
    
    const width = window.screen.width;
    const height = window.screen.height;
    const orientation = width > height ? 'landscape' : 'portrait';
    
    return {
      width,
      height,
      orientation,
      pixelRatio: deviceDetection.getPixelRatio(),
      availableWidth: window.screen.availWidth,
      availableHeight: window.screen.availHeight
    };
  },

  /**
   * 检测设备性能等级
   */
  getPerformanceLevel: () => {
    if (typeof window === 'undefined') return 'medium';
    
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const pixelRatio = deviceDetection.getPixelRatio();
    
    let score = 0;
    
    // CPU核心数评分
    if (cores >= 8) score += 30;
    else if (cores >= 4) score += 20;
    else score += 10;
    
    // 内存评分
    if (memory >= 8) score += 30;
    else if (memory >= 4) score += 20;
    else score += 10;
    
    // 像素比评分（高像素比设备通常性能更好）
    if (pixelRatio >= 3) score += 20;
    else if (pixelRatio >= 2) score += 15;
    else score += 10;
    
    // 移动设备性能调整
    if (deviceDetection.isMobile()) score -= 20;
    
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
};

/**
 * 触摸交互工具
 */
export const touchUtils = {
  /**
   * 检测是否支持触摸
   */
  isTouchSupported: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * 添加触摸反馈效果
   */
  addTouchFeedback: (element, options = {}) => {
    if (!element || !touchUtils.isTouchSupported()) return;
    
    const {
      activeClass = 'touch-active',
      duration = 150,
      scale = 0.95
    } = options;
    
    const handleTouchStart = () => {
      element.classList.add(activeClass);
      element.style.transform = `scale(${scale})`;
      element.style.transition = 'transform 0.1s ease';
    };
    
    const handleTouchEnd = () => {
      setTimeout(() => {
        element.classList.remove(activeClass);
        element.style.transform = '';
        element.style.transition = '';
      }, duration);
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    
    // 返回清理函数
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  },

  /**
   * 防止双击缩放
   */
  preventDoubleClickZoom: (element) => {
    if (!element) return;
    
    let lastTouchEnd = 0;
    
    const handleTouchEnd = (e) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      element.removeEventListener('touchend', handleTouchEnd);
    };
  },

  /**
   * 简单的手势检测
   */
  addSwipeGesture: (element, callbacks = {}) => {
    if (!element || !touchUtils.isTouchSupported()) return;
    
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };
    
    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      // 最小滑动距离和最大时间
      const minDistance = 50;
      const maxTime = 300;
      
      if (deltaTime > maxTime) return;
      
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > minDistance && absX > absY) {
        // 水平滑动
        if (deltaX > 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight(e);
        } else if (deltaX < 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft(e);
        }
      } else if (absY > minDistance && absY > absX) {
        // 垂直滑动
        if (deltaY > 0 && callbacks.onSwipeDown) {
          callbacks.onSwipeDown(e);
        } else if (deltaY < 0 && callbacks.onSwipeUp) {
          callbacks.onSwipeUp(e);
        }
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
};

/**
 * 视口工具
 */
export const viewportUtils = {
  /**
   * 获取视口尺寸
   */
  getViewportSize: () => {
    if (typeof window === 'undefined') return { width: 0, height: 0 };
    
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  },

  /**
   * 检测视口方向
   */
  getOrientation: () => {
    const { width, height } = viewportUtils.getViewportSize();
    return width > height ? 'landscape' : 'portrait';
  },

  /**
   * 监听视口变化
   */
  onViewportChange: (callback) => {
    if (typeof window === 'undefined') return () => {};
    
    const handleResize = () => {
      callback({
        size: viewportUtils.getViewportSize(),
        orientation: viewportUtils.getOrientation()
      });
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  },

  /**
   * 检测是否为小屏设备
   */
  isSmallScreen: () => {
    const { width } = viewportUtils.getViewportSize();
    return width < 768;
  },

  /**
   * 获取安全区域信息（用于处理刘海屏等）
   */
  getSafeAreaInsets: () => {
    if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 };
    
    const style = getComputedStyle(document.documentElement);
    
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
    };
  }
};

/**
 * 性能优化工具
 */
export const mobilePerformance = {
  /**
   * 节流函数（移动端优化版）
   */
  throttle: (func, limit = 16) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 防抖函数（移动端优化版）
   */
  debounce: (func, delay = 300) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * 懒加载图片
   */
  lazyLoadImage: (img, options = {}) => {
    if (!img || !('IntersectionObserver' in window)) return;
    
    const {
      rootMargin = '50px',
      threshold = 0.1,
      placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGNUY1RjUiLz48L3N2Zz4='
    } = options;
    
    // 设置占位符
    const originalSrc = img.src || img.dataset.src;
    img.src = placeholder;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = originalSrc;
          image.onload = () => {
            image.classList.add('loaded');
          };
          observer.unobserve(image);
        }
      });
    }, {
      rootMargin,
      threshold
    });
    
    observer.observe(img);
    
    return () => observer.unobserve(img);
  }
};

/**
 * 移动端样式工具
 */
export const mobileStyles = {
  /**
   * 获取移动端优化的样式对象
   */
  getMobileStyles: (baseStyles = {}) => {
    const isMobile = deviceDetection.isMobile();
    const isSmallScreen = viewportUtils.isSmallScreen();
    
    if (!isMobile && !isSmallScreen) return baseStyles;
    
    return {
      ...baseStyles,
      // 移动端通用优化
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      // 字体优化
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      // 滚动优化
      WebkitOverflowScrolling: 'touch',
      overflowScrolling: 'touch'
    };
  },

  /**
   * 获取触摸友好的按钮样式
   */
  getTouchButtonStyles: (size = 'medium') => {
    const sizes = {
      small: { minHeight: '36px', minWidth: '36px', padding: '8px 12px' },
      medium: { minHeight: '44px', minWidth: '44px', padding: '12px 16px' },
      large: { minHeight: '52px', minWidth: '52px', padding: '16px 20px' }
    };
    
    return {
      ...sizes[size],
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent',
      transition: 'all 0.2s ease',
      '&:active': {
        transform: 'scale(0.95)',
        opacity: 0.8
      }
    };
  }
};

// 默认导出
const mobileUtils = {
  deviceDetection,
  touchUtils,
  viewportUtils,
  mobilePerformance,
  mobileStyles
};

export default mobileUtils;
