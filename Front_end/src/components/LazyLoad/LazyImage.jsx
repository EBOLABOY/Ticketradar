import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton, CircularProgress } from '@mui/material';
import { lazyLoadManager } from '../../utils/mobilePerformanceOptimizer';
import { useMobile } from '../../hooks/useMobile';

/**
 * 懒加载图片组件
 * 支持占位符、加载状态、错误处理等功能
 */
const LazyImage = ({
  src,
  alt = '',
  placeholder,
  fallback,
  width,
  height,
  objectFit = 'cover',
  borderRadius = 0,
  showSkeleton = true,
  showProgress = false,
  fadeIn = true,
  onLoad,
  onError,
  sx = {},
  ...props
}) => {
  const [loadState, setLoadState] = useState('loading'); // loading, loaded, error
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const imgRef = useRef(null);
  const { isMobile, performanceLevel } = useMobile();

  // 根据设备性能调整加载策略
  const shouldOptimize = isMobile || performanceLevel === 'low';

  useEffect(() => {
    if (!src || !imgRef.current) return;

    const imgElement = imgRef.current;
    // 设置初始状态
    setLoadState('loading');
    
    // 使用懒加载管理器
    lazyLoadManager.lazyLoadImage(imgElement, {
      placeholder: placeholder || generatePlaceholder(width, height),
      fadeIn: fadeIn && !shouldOptimize, // 低性能设备禁用淡入效果
      onLoad: (loadedImg) => {
        setLoadState('loaded');
        setImageSrc(src);
        onLoad?.(loadedImg);
      },
      onError: (errorImg) => {
        setLoadState('error');
        if (fallback) {
          setImageSrc(fallback);
        }
        onError?.(errorImg);
      }
    });

    // 设置data-src属性供懒加载使用
    imgElement.dataset.src = src;

    return () => {
      lazyLoadManager.cleanup(imgElement);
    };
  }, [src, placeholder, fallback, fadeIn, shouldOptimize, width, height, onLoad, onError]);

  // 生成占位符
  const generatePlaceholder = (w, h) => {
    if (!w || !h) return '';
    
    const color = '#f5f5f5';
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${w}" height="${h}" fill="${color}"/>
      </svg>`
    )}`;
  };

  // 渲染加载状态
  const renderLoadingState = () => {
    if (showSkeleton) {
      return (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{
            borderRadius,
            ...sx
          }}
        />
      );
    }

    if (showProgress) {
      return (
        <Box
          sx={{
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'grey.100',
            borderRadius,
            ...sx
          }}
        >
          <CircularProgress size={24} />
        </Box>
      );
    }

    return null;
  };

  // 渲染错误状态
  const renderErrorState = () => (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey.200',
        color: 'grey.500',
        borderRadius,
        fontSize: '12px',
        ...sx
      }}
    >
      加载失败
    </Box>
  );

  // 如果正在加载且有占位符组件，显示占位符
  if (loadState === 'loading' && (showSkeleton || showProgress)) {
    return renderLoadingState();
  }

  // 如果加载错误且没有fallback，显示错误状态
  if (loadState === 'error' && !fallback) {
    return renderErrorState();
  }

  return (
    <Box
      component="img"
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      sx={{
        width,
        height,
        objectFit,
        borderRadius,
        display: 'block',
        opacity: loadState === 'loaded' && fadeIn && !shouldOptimize ? 1 : undefined,
        transition: fadeIn && !shouldOptimize ? 'opacity 0.3s ease' : 'none',
        ...sx
      }}
      {...props}
    />
  );
};

/**
 * 懒加载背景图片组件
 */
const LazyBackgroundImage = ({
  src,
  children,
  placeholder,
  fallback,
  width = '100%',
  height = 200,
  backgroundSize = 'cover',
  backgroundPosition = 'center',
  borderRadius = 0,
  onLoad,
  onError,
  sx = {},
  ...props
}) => {
  const [loadState, setLoadState] = useState('loading');
  const [backgroundImage, setBackgroundImage] = useState('');
  const containerRef = useRef(null);
  const { isMobile, performanceLevel } = useMobile();

  const shouldOptimize = isMobile || performanceLevel === 'low';

  useEffect(() => {
    if (!src) return;

    // 预加载图片
    const img = new Image();
    
    img.onload = () => {
      setLoadState('loaded');
      setBackgroundImage(`url(${src})`);
      onLoad?.(img);
    };
    
    img.onerror = () => {
      setLoadState('error');
      if (fallback) {
        setBackgroundImage(`url(${fallback})`);
      }
      onError?.(img);
    };
    
    // 使用懒加载
    const container = containerRef.current;
    if (container) {
      lazyLoadManager.lazyLoadComponent(
        container,
        () => {
          return new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          });
        },
        {
          onLoad: (img) => {
            setLoadState('loaded');
            setBackgroundImage(`url(${src})`);
            onLoad?.(img);
          },
          onError: (error) => {
            setLoadState('error');
            if (fallback) {
              setBackgroundImage(`url(${fallback})`);
            }
            onError?.(error);
          }
        }
      );
    }

    return () => {
      if (container) {
        lazyLoadManager.cleanup(container);
      }
    };
  }, [src, fallback, onLoad, onError]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width,
        height,
        borderRadius,
        backgroundImage: loadState === 'loaded' ? backgroundImage : placeholder ? `url(${placeholder})` : 'none',
        backgroundSize,
        backgroundPosition,
        backgroundRepeat: 'no-repeat',
        backgroundColor: loadState === 'loading' ? 'grey.100' : 'transparent',
        transition: shouldOptimize ? 'none' : 'background-image 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        ...sx
      }}
      {...props}
    >
      {/* 加载状态覆盖层 */}
      {loadState === 'loading' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            backdropFilter: 'blur(2px)'
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      
      {/* 错误状态覆盖层 */}
      {loadState === 'error' && !fallback && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(245, 245, 245, 0.9)',
            color: 'grey.500',
            fontSize: '12px'
          }}
        >
          背景加载失败
        </Box>
      )}
      
      {children}
    </Box>
  );
};

export { LazyImage, LazyBackgroundImage };
export default LazyImage;
