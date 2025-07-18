import React, { useRef, forwardRef } from 'react';
import { Button, IconButton } from '@mui/material';
import { useTouch, useMobilePerformance } from '../../hooks/useMobile';
import { mobileStyles } from '../../utils/mobileUtils';

/**
 * 触摸增强按钮组件
 * 提供移动端优化的触摸反馈和交互体验
 */
const TouchButton = forwardRef(({
  children,
  variant = 'contained',
  size = 'medium',
  disabled = false,
  onClick,
  onTouchStart,
  onTouchEnd,
  enableHaptic = true,
  enableRipple = true,
  touchScale = 0.95,
  sx = {},
  ...props
}, ref) => {
  const buttonRef = useRef(null);
  const { getOptimizedConfig } = useMobilePerformance();
  
  // 获取性能优化配置
  const config = getOptimizedConfig({
    enableTransitions: true,
    animationDuration: 200
  });

  // 使用触摸Hook
  const { isPressed } = useTouch(buttonRef, {
    onTouchStart: (e) => {
      // 触觉反馈
      if (enableHaptic && navigator.vibrate) {
        navigator.vibrate(10);
      }
      onTouchStart?.(e);
    },
    onTouchEnd,
    enableFeedback: true
  });

  // 处理点击事件
  const handleClick = (e) => {
    // 防止快速连续点击
    if (disabled) return;
    
    // 触觉反馈
    if (enableHaptic && navigator.vibrate) {
      navigator.vibrate(20);
    }
    
    onClick?.(e);
  };

  // 获取按钮样式
  const getButtonStyles = () => {
    const touchStyles = mobileStyles.getTouchButtonStyles(size);
    
    return {
      ...touchStyles,
      transition: config.enableTransitions 
        ? `all ${config.animationDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`
        : 'none',
      transform: isPressed ? `scale(${touchScale})` : 'scale(1)',
      // 移动端优化
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      // 自定义样式
      ...sx
    };
  };

  return (
    <Button
      ref={(node) => {
        buttonRef.current = node;
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      disableRipple={!enableRipple || !config.enableTransitions}
      sx={getButtonStyles()}
      {...props}
    >
      {children}
    </Button>
  );
});

TouchButton.displayName = 'TouchButton';

/**
 * 触摸增强图标按钮组件
 */
const TouchIconButton = forwardRef(({
  children,
  size = 'medium',
  disabled = false,
  onClick,
  onTouchStart,
  onTouchEnd,
  enableHaptic = true,
  enableRipple = true,
  touchScale = 0.9,
  sx = {},
  ...props
}, ref) => {
  const buttonRef = useRef(null);
  const { getOptimizedConfig } = useMobilePerformance();
  
  const config = getOptimizedConfig({
    enableTransitions: true,
    animationDuration: 150
  });

  const { isPressed } = useTouch(buttonRef, {
    onTouchStart: (e) => {
      if (enableHaptic && navigator.vibrate) {
        navigator.vibrate(8);
      }
      onTouchStart?.(e);
    },
    onTouchEnd,
    enableFeedback: true
  });

  const handleClick = (e) => {
    if (disabled) return;
    
    if (enableHaptic && navigator.vibrate) {
      navigator.vibrate(15);
    }
    
    onClick?.(e);
  };

  const getIconButtonStyles = () => {
    const touchStyles = mobileStyles.getTouchButtonStyles(size);
    
    return {
      ...touchStyles,
      borderRadius: '50%',
      transition: config.enableTransitions 
        ? `all ${config.animationDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`
        : 'none',
      transform: isPressed ? `scale(${touchScale})` : 'scale(1)',
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      ...sx
    };
  };

  return (
    <IconButton
      ref={(node) => {
        buttonRef.current = node;
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      disableRipple={!enableRipple || !config.enableTransitions}
      sx={getIconButtonStyles()}
      {...props}
    >
      {children}
    </IconButton>
  );
});

TouchIconButton.displayName = 'TouchIconButton';

/**
 * 触摸增强卡片组件
 */
const TouchCard = forwardRef(({
  children,
  onClick,
  onTouchStart,
  onTouchEnd,
  onSwipeLeft,
  onSwipeRight,
  enableSwipe = false,
  enableHaptic = false,
  touchScale = 0.98,
  sx = {},
  ...props
}, ref) => {
  const cardRef = useRef(null);
  const { getOptimizedConfig } = useMobilePerformance();
  
  const config = getOptimizedConfig({
    enableTransitions: true,
    animationDuration: 200
  });

  const { isPressed } = useTouch(cardRef, {
    onTouchStart: (e) => {
      if (enableHaptic && navigator.vibrate) {
        navigator.vibrate(5);
      }
      onTouchStart?.(e);
    },
    onTouchEnd,
    onSwipeLeft,
    onSwipeRight,
    enableFeedback: true,
    enableSwipe
  });

  const handleClick = (e) => {
    if (enableHaptic && navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick?.(e);
  };

  const getCardStyles = () => {
    return {
      cursor: onClick ? 'pointer' : 'default',
      transition: config.enableTransitions 
        ? `all ${config.animationDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`
        : 'none',
      transform: isPressed && onClick ? `scale(${touchScale})` : 'scale(1)',
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none',
      ...sx
    };
  };

  return (
    <div
      ref={(node) => {
        cardRef.current = node;
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
      onClick={handleClick}
      style={getCardStyles()}
      {...props}
    >
      {children}
    </div>
  );
});

TouchCard.displayName = 'TouchCard';

export { TouchButton, TouchIconButton, TouchCard };
export default TouchButton;
