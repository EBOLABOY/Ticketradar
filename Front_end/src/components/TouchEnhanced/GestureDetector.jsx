import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { touchUtils } from '../../utils/mobileUtils';

/**
 * 手势检测器组件
 * 提供滑动、捏合、长按等手势识别功能
 */
const GestureDetector = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchStart,
  onPinchMove,
  onPinchEnd,
  onLongPress,
  onDoubleTap,
  enableSwipe = true,
  enablePinch = false,
  enableLongPress = false,
  enableDoubleTap = false,
  swipeThreshold = 50,
  pinchThreshold = 10,
  longPressDelay = 500,
  doubleTapDelay = 300,
  sx = {},
  ...props
}) => {
  const containerRef = useRef(null);
  const [gestureState, setGestureState] = useState({
    isGesturing: false,
    gestureType: null,
    startTime: 0,
    lastTap: 0
  });

  // 手势状态
  const gestureData = useRef({
    touches: [],
    startDistance: 0,
    startCenter: { x: 0, y: 0 },
    longPressTimer: null,
    isLongPressing: false
  });

  // 获取触摸点之间的距离
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 获取触摸点的中心
  const getCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // 处理触摸开始
  const handleTouchStart = React.useCallback((e) => {
    const touches = Array.from(e.touches);
    gestureData.current.touches = touches;
    
    setGestureState(prev => ({
      ...prev,
      isGesturing: true,
      startTime: Date.now()
    }));

    // 单点触摸
    if (touches.length === 1) {
      const touch = touches[0];
      
      // 双击检测
      if (enableDoubleTap) {
        const now = Date.now();
        const timeSinceLastTap = now - gestureState.lastTap;
        
        if (timeSinceLastTap < doubleTapDelay) {
          onDoubleTap?.(e, { x: touch.clientX, y: touch.clientY });
          setGestureState(prev => ({ ...prev, lastTap: 0 }));
          return;
        }
        
        setGestureState(prev => ({ ...prev, lastTap: now }));
      }

      // 长按检测
      if (enableLongPress) {
        gestureData.current.longPressTimer = setTimeout(() => {
          if (gestureData.current.touches.length === 1) {
            gestureData.current.isLongPressing = true;
            onLongPress?.(e, { x: touch.clientX, y: touch.clientY });
            
            // 触觉反馈
            if (navigator.vibrate) {
              navigator.vibrate(50);
            }
          }
        }, longPressDelay);
      }
    }

    // 双点触摸（捏合手势）
    if (touches.length === 2 && enablePinch) {
      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);
      
      gestureData.current.startDistance = distance;
      gestureData.current.startCenter = center;
      
      setGestureState(prev => ({
        ...prev,
        gestureType: 'pinch'
      }));
      
      onPinchStart?.(e, { distance, center });
    }
  }, [enableDoubleTap, enableLongPress, enablePinch, gestureState.lastTap, doubleTapDelay, longPressDelay, onDoubleTap, onLongPress, onPinchStart]);

  // 处理触摸移动
  const handleTouchMove = React.useCallback((e) => {
    const touches = Array.from(e.touches);
    
    // 清除长按定时器
    if (gestureData.current.longPressTimer) {
      clearTimeout(gestureData.current.longPressTimer);
      gestureData.current.longPressTimer = null;
    }

    // 捏合手势处理
    if (touches.length === 2 && enablePinch && gestureState.gestureType === 'pinch') {
      const distance = getDistance(touches[0], touches[1]);
      const center = getCenter(touches[0], touches[1]);
      const scale = distance / gestureData.current.startDistance;
      
      onPinchMove?.(e, {
        distance,
        center,
        scale,
        deltaDistance: distance - gestureData.current.startDistance
      });
    }
  }, [enablePinch, gestureState.gestureType, onPinchMove]);

  // 处理触摸结束
  const handleTouchEnd = React.useCallback((e) => {
    const touches = Array.from(e.changedTouches);
    const remainingTouches = Array.from(e.touches);
    
    // 清除长按定时器
    if (gestureData.current.longPressTimer) {
      clearTimeout(gestureData.current.longPressTimer);
      gestureData.current.longPressTimer = null;
    }

    // 如果是长按状态，不处理其他手势
    if (gestureData.current.isLongPressing) {
      gestureData.current.isLongPressing = false;
      setGestureState(prev => ({
        ...prev,
        isGesturing: false,
        gestureType: null
      }));
      return;
    }

    // 捏合手势结束
    if (gestureState.gestureType === 'pinch' && remainingTouches.length < 2) {
      onPinchEnd?.(e);
      setGestureState(prev => ({
        ...prev,
        gestureType: null
      }));
    }

    // 滑动手势检测（单点触摸）
    if (enableSwipe && touches.length === 1 && gestureData.current.touches.length === 1) {
      const startTouch = gestureData.current.touches[0];
      const endTouch = touches[0];
      
      const deltaX = endTouch.clientX - startTouch.clientX;
      const deltaY = endTouch.clientY - startTouch.clientY;
      const deltaTime = Date.now() - gestureState.startTime;
      
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      // 检查是否满足滑动条件
      if (deltaTime < 300 && (absX > swipeThreshold || absY > swipeThreshold)) {
        if (absX > absY) {
          // 水平滑动
          if (deltaX > 0) {
            onSwipeRight?.(e, { deltaX, deltaY, deltaTime });
          } else {
            onSwipeLeft?.(e, { deltaX, deltaY, deltaTime });
          }
        } else {
          // 垂直滑动
          if (deltaY > 0) {
            onSwipeDown?.(e, { deltaX, deltaY, deltaTime });
          } else {
            onSwipeUp?.(e, { deltaX, deltaY, deltaTime });
          }
        }
      }
    }

    // 重置状态
    if (remainingTouches.length === 0) {
      setGestureState(prev => ({
        ...prev,
        isGesturing: false,
        gestureType: null
      }));
    }
  }, [enableSwipe, gestureState.gestureType, gestureState.startTime, onPinchEnd, onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeUp, swipeThreshold]);

  // 处理触摸取消
  const handleTouchCancel = React.useCallback((e) => {
    if (gestureData.current.longPressTimer) {
      clearTimeout(gestureData.current.longPressTimer);
      gestureData.current.longPressTimer = null;
    }
    
    gestureData.current.isLongPressing = false;
    
    setGestureState({
      isGesturing: false,
      gestureType: null,
      startTime: 0,
      lastTap: gestureState.lastTap
    });

    if (gestureState.gestureType === 'pinch') {
      onPinchEnd?.(e);
    }
  }, [gestureState.lastTap, gestureState.gestureType, onPinchEnd]);

  // 设置事件监听器
  useEffect(() => {
    const element = containerRef.current;
    if (!element || !touchUtils.isTouchSupported()) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: false });

    const longPressTimer = gestureData.current.longPressTimer;

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [
    enableSwipe, enablePinch, enableLongPress, enableDoubleTap,
    swipeThreshold, pinchThreshold, longPressDelay, doubleTapDelay,
    onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown,
    onPinchStart, onPinchMove, onPinchEnd,
    onLongPress, onDoubleTap, gestureState.lastTap, gestureState.gestureType, gestureState.startTime,
    handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel
  ]);

  return (
    <Box
      ref={containerRef}
      sx={{
        touchAction: 'none', // 防止浏览器默认手势
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default GestureDetector;
