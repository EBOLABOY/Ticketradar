import { useState, useEffect, useCallback, useRef } from 'react';
import { deviceDetection, viewportUtils, touchUtils } from '../utils/mobileUtils';

/**
 * 移动端专用Hook
 * 提供移动端设备检测、视口管理、触摸交互等功能
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0, orientation: 'portrait' });
  const [performanceLevel, setPerformanceLevel] = useState('medium');
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

  // 初始化设备信息
  useEffect(() => {
    const updateDeviceInfo = () => {
      setIsMobile(deviceDetection.isMobile());
      setIsTablet(deviceDetection.isTablet());
      setViewport({
        ...viewportUtils.getViewportSize(),
        orientation: viewportUtils.getOrientation()
      });
      setPerformanceLevel(deviceDetection.getPerformanceLevel());
      setSafeAreaInsets(viewportUtils.getSafeAreaInsets());
    };

    updateDeviceInfo();

    // 监听视口变化
    const cleanup = viewportUtils.onViewportChange(({ size, orientation }) => {
      setViewport({ ...size, orientation });
    });

    return cleanup;
  }, []);

  return {
    isMobile,
    isTablet,
    viewport,
    performanceLevel,
    safeAreaInsets,
    isSmallScreen: viewport.width < 768,
    isLandscape: viewport.orientation === 'landscape',
    isPortrait: viewport.orientation === 'portrait'
  };
};

/**
 * 触摸交互Hook
 */
export const useTouch = (elementRef, options = {}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [touchInfo, setTouchInfo] = useState(null);
  const cleanupRef = useRef(null);

  const {
    onTouchStart,
    onTouchEnd,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    enableFeedback = true,
    enableSwipe = false
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !touchUtils.isTouchSupported()) return;

    const cleanupFunctions = [];

    // 添加触摸反馈
    if (enableFeedback) {
      const feedbackCleanup = touchUtils.addTouchFeedback(element, {
        activeClass: 'touch-active',
        duration: 150,
        scale: 0.95
      });
      cleanupFunctions.push(feedbackCleanup);
    }

    // 添加滑动手势
    if (enableSwipe) {
      const swipeCleanup = touchUtils.addSwipeGesture(element, {
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown
      });
      cleanupFunctions.push(swipeCleanup);
    }

    // 自定义触摸事件处理
    const handleTouchStart = (e) => {
      setIsPressed(true);
      const touch = e.touches[0];
      setTouchInfo({
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now()
      });
      onTouchStart?.(e);
    };

    const handleTouchEnd = (e) => {
      setIsPressed(false);
      setTouchInfo(null);
      onTouchEnd?.(e);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    cleanupFunctions.push(() => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    });

    cleanupRef.current = () => {
      cleanupFunctions.forEach(cleanup => cleanup?.());
    };

    return cleanupRef.current;
  }, [elementRef, onTouchStart, onTouchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, enableFeedback, enableSwipe]);

  return {
    isPressed,
    touchInfo,
    isTouchSupported: touchUtils.isTouchSupported()
  };
};

/**
 * 移动端性能优化Hook
 */
export const useMobilePerformance = () => {
  const [performanceLevel, setPerformanceLevel] = useState('medium');
  const [shouldReduceAnimations, setShouldReduceAnimations] = useState(false);
  const [shouldReduceEffects, setShouldReduceEffects] = useState(false);

  useEffect(() => {
    const level = deviceDetection.getPerformanceLevel();
    setPerformanceLevel(level);
    
    // 根据性能等级调整体验
    setShouldReduceAnimations(level === 'low');
    setShouldReduceEffects(level === 'low');

    // 检测用户偏好
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShouldReduceAnimations(true);
    }
  }, []);

  const getOptimizedConfig = useCallback((config = {}) => {
    const baseConfig = {
      animationDuration: shouldReduceAnimations ? 0 : (config.animationDuration || 300),
      enableBlur: !shouldReduceEffects && (config.enableBlur !== false),
      enableShadows: !shouldReduceEffects && (config.enableShadows !== false),
      enableTransitions: !shouldReduceAnimations && (config.enableTransitions !== false),
      ...config
    };

    // 低性能设备进一步优化
    if (performanceLevel === 'low') {
      return {
        ...baseConfig,
        animationDuration: 0,
        enableBlur: false,
        enableShadows: false,
        enableTransitions: false
      };
    }

    return baseConfig;
  }, [performanceLevel, shouldReduceAnimations, shouldReduceEffects]);

  return {
    performanceLevel,
    shouldReduceAnimations,
    shouldReduceEffects,
    getOptimizedConfig
  };
};

/**
 * 移动端导航Hook
 */
export const useMobileNavigation = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { isMobile } = useMobile();

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(prev => !prev);
  }, []);

  const changeTab = useCallback((tabIndex) => {
    setActiveTab(tabIndex);
  }, []);

  // 移动端返回键处理
  useEffect(() => {
    if (!isMobile) return;

    const handlePopState = (e) => {
      if (isDrawerOpen) {
        e.preventDefault();
        closeDrawer();
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (isDrawerOpen) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMobile, isDrawerOpen, closeDrawer]);

  return {
    isDrawerOpen,
    activeTab,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    changeTab,
    isMobile
  };
};

/**
 * 移动端表单Hook
 */
export const useMobileForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isMobile } = useMobile();

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const validateField = useCallback((name, value, validator) => {
    if (!validator) return null;
    
    const error = validator(value);
    setFieldError(name, error);
    return error;
  }, [setFieldError]);

  // 移动端特有的表单优化
  const getMobileFieldProps = useCallback((name, options = {}) => {
    const {
      validator,
      autoComplete = 'off',
      inputMode,
      ...otherOptions
    } = options;

    return {
      name,
      value: values[name] || '',
      error: Boolean(errors[name] && touched[name]),
      helperText: touched[name] ? errors[name] : '',
      onChange: (e) => {
        const value = e.target.value;
        setValue(name, value);
        
        // 实时验证（移动端延迟验证以提升性能）
        if (validator && touched[name]) {
          setTimeout(() => validateField(name, value, validator), 300);
        }
      },
      onBlur: () => {
        setFieldTouched(name, true);
        if (validator) {
          validateField(name, values[name], validator);
        }
      },
      // 移动端优化属性
      autoComplete: isMobile ? autoComplete : 'off',
      inputMode: isMobile ? inputMode : undefined,
      ...otherOptions
    };
  }, [values, errors, touched, isMobile, setValue, setFieldTouched, validateField]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    validateField,
    getMobileFieldProps,
    setIsSubmitting
  };
};

// 默认导出主要的Hook
export default useMobile;
