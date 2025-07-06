/**
 * Apple风格液态玻璃效果工具库
 * 提供完整的玻璃形态效果实现和浏览器兼容性支持
 */

// 浏览器兼容性检测
export const browserSupport = {
  /**
   * 检测浏览器是否支持backdrop-filter
   */
  supportsBackdropFilter: () => {
    if (typeof window === 'undefined') return false;
    
    const testElement = document.createElement('div');
    testElement.style.backdropFilter = 'blur(1px)';
    const supported = testElement.style.backdropFilter !== '';
    
    // 检查webkit前缀支持
    if (!supported) {
      testElement.style.webkitBackdropFilter = 'blur(1px)';
      return testElement.style.webkitBackdropFilter !== '';
    }
    
    return supported;
  },

  /**
   * 检测是否为Safari浏览器
   */
  isSafari: () => {
    if (typeof window === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  /**
   * 检测是否为移动设备
   */
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * 获取浏览器性能等级 - 缓存结果避免重复创建WebGL上下文
   */
  getPerformanceLevel: (() => {
    let cachedLevel = null;
    
    return () => {
      if (cachedLevel !== null) return cachedLevel;
      if (typeof window === 'undefined') return 'low';
      
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const gl = canvas.getContext('webgl', {
          failIfMajorPerformanceCaveat: true,
          antialias: false,
          alpha: false,
          depth: false,
          stencil: false,
          preserveDrawingBuffer: false,
          powerPreference: 'default'
        }) || canvas.getContext('experimental-webgl');
        
        if (!gl) {
          cachedLevel = 'low';
          return cachedLevel;
        }
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          // 简单的GPU性能检测
          if (renderer.includes('Intel') || renderer.includes('AMD')) {
            cachedLevel = 'medium';
          } else if (renderer.includes('NVIDIA') || renderer.includes('Apple')) {
            cachedLevel = 'high';
          } else {
            cachedLevel = 'medium';
          }
        } else {
          cachedLevel = 'medium';
        }
        
        // 清理WebGL上下文
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
        
        return cachedLevel;
      } catch (error) {
        console.warn('WebGL性能检测失败:', error);
        cachedLevel = 'medium';
        return cachedLevel;
      }
    };
  })()
};

// Apple风格玻璃效果预设
export const glassPresets = {
  // 主要玻璃效果 - 用于重要的UI元素
  primary: {
    light: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '0.5px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      borderRadius: '12px',
    },
    dark: {
      background: 'rgba(16, 16, 16, 0.8)',
      backdropFilter: 'blur(20px) saturate(180%)',
      border: '0.5px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
    }
  },

  // 次要玻璃效果 - 用于卡片和面板
  secondary: {
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(16px) saturate(160%)',
      border: '0.5px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 4px 16px rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      borderRadius: '12px',
    },
    dark: {
      background: 'rgba(16, 16, 16, 0.7)',
      backdropFilter: 'blur(16px) saturate(160%)',
      border: '0.5px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
    }
  },

  // 三级玻璃效果 - 用于悬浮提示和小组件
  tertiary: {
    light: {
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(12px) saturate(140%)',
      border: '0.5px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 2px 8px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
    },
    dark: {
      background: 'rgba(16, 16, 16, 0.6)',
      backdropFilter: 'blur(12px) saturate(140%)',
      border: '0.5px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
    }
  },

  // 导航栏专用玻璃效果
  navbar: {
    light: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(24px) saturate(200%)',
      border: 'none',
      borderBottom: '0.5px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      borderRadius: '0',
    },
    dark: {
      background: 'rgba(16, 16, 16, 0.85)',
      backdropFilter: 'blur(24px) saturate(200%)',
      border: 'none',
      borderBottom: '0.5px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      borderRadius: '0',
    }
  }
};

// 降级方案配置
const fallbackStyles = {
  primary: {
    light: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
    },
    dark: {
      background: 'rgba(32, 32, 32, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
    }
  },
  secondary: {
    light: {
      background: 'rgba(248, 249, 250, 0.9)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      borderRadius: '12px',
    },
    dark: {
      background: 'rgba(48, 49, 52, 0.9)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
    }
  }
};

/**
 * 创建Apple风格玻璃效果
 * @param {string} level - 效果级别 ('primary', 'secondary', 'tertiary', 'navbar')
 * @param {string} mode - 主题模式 ('light', 'dark')
 * @param {Object} customOptions - 自定义选项
 * @returns {Object} CSS样式对象
 */
export const createAppleGlass = (level = 'primary', mode = 'light', customOptions = {}) => {
  const supportsBackdrop = browserSupport.supportsBackdropFilter();
  const performanceLevel = browserSupport.getPerformanceLevel();
  const isMobile = browserSupport.isMobile();
  
  // 获取基础预设
  let baseStyle = glassPresets[level]?.[mode] || glassPresets.primary[mode];
  
  // 性能优化：移动设备或低性能设备使用简化效果
  if (isMobile || performanceLevel === 'low') {
    baseStyle = {
      ...baseStyle,
      backdropFilter: baseStyle.backdropFilter.replace('blur(20px)', 'blur(10px)'),
    };
  }
  
  // 如果不支持backdrop-filter，使用降级方案
  if (!supportsBackdrop) {
    const fallback = fallbackStyles[level]?.[mode] || fallbackStyles.primary[mode];
    baseStyle = {
      ...fallback,
      // 移除不支持的属性
      backdropFilter: undefined,
      WebkitBackdropFilter: undefined,
    };
  }
  
  // 添加webkit前缀支持
  if (supportsBackdrop && baseStyle.backdropFilter) {
    baseStyle.WebkitBackdropFilter = baseStyle.backdropFilter;
  }
  
  // 添加过渡动画
  const transitions = [
    'background-color 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    'border-color 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    'box-shadow 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
  ];
  
  if (supportsBackdrop) {
    transitions.push('backdrop-filter 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)');
  }
  
  // 合并自定义选项
  return {
    ...baseStyle,
    transition: transitions.join(', '),
    // 确保在支持的浏览器中启用硬件加速
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
    ...customOptions,
  };
};

/**
 * 创建玻璃按钮效果
 * @param {string} mode - 主题模式
 * @param {Object} customOptions - 自定义选项
 */
export const createGlassButton = (mode = 'light', customOptions = {}) => {
  const baseGlass = createAppleGlass('secondary', mode);
  
  return {
    ...baseGlass,
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': {
      transform: 'translateY(-1px) translateZ(0)',
      boxShadow: mode === 'light' 
        ? '0 6px 20px rgba(31, 38, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        : '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    },
    '&:active': {
      transform: 'translateY(0) translateZ(0)',
      boxShadow: mode === 'light'
        ? '0 2px 8px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        : '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    },
    ...customOptions,
  };
};

/**
 * 创建玻璃卡片效果
 * @param {string} mode - 主题模式
 * @param {Object} customOptions - 自定义选项
 */
export const createGlassCard = (mode = 'light', customOptions = {}) => {
  const baseGlass = createAppleGlass('secondary', mode);
  
  return {
    ...baseGlass,
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px) translateZ(0)',
      boxShadow: mode === 'light'
        ? '0 8px 24px rgba(31, 38, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
        : '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    },
    ...customOptions,
  };
};

/**
 * 获取当前浏览器支持信息
 */
export const getSupportInfo = () => {
  return {
    backdropFilter: browserSupport.supportsBackdropFilter(),
    isSafari: browserSupport.isSafari(),
    isMobile: browserSupport.isMobile(),
    performanceLevel: browserSupport.getPerformanceLevel(),
  };
};

// 导出默认配置
const glassmorphism = {
  createAppleGlass,
  createGlassButton,
  createGlassCard,
  glassPresets,
  browserSupport,
  getSupportInfo,
};

export default glassmorphism;