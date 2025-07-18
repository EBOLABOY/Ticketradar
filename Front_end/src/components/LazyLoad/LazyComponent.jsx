import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Box, CircularProgress, Skeleton, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useMobile } from '../../hooks/useMobile';

/**
 * 懒加载组件包装器
 * 支持代码分割、错误边界、重试机制等功能
 */
const LazyComponent = ({
  importFunc,
  fallback,
  errorFallback,
  retryable = true,
  maxRetries = 3,
  retryDelay = 1000,
  onLoad,
  onError,
  children,
  ...props
}) => {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { isMobile, performanceLevel } = useMobile();

  // 加载组件
  const loadComponent = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const module = await importFunc();
      const LoadedComponent = module.default || module;
      
      setComponent(() => LoadedComponent);
      setLoading(false);
      onLoad?.(LoadedComponent);
    } catch (err) {
      setError(err);
      setLoading(false);
      onError?.(err);
    }
  }, [importFunc, onLoad, onError]);

  // 重试加载
  const retry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setTimeout(loadComponent, retryDelay * (retryCount + 1));
    }
  };

  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  // 渲染加载状态
  const renderLoading = () => {
    if (fallback) {
      return fallback;
    }

    // 根据设备性能选择不同的加载指示器
    if (performanceLevel === 'low') {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
          }}
        >
          <Typography variant="body2" color="text.secondary">
            加载中...
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          gap: 2
        }}
      >
        <CircularProgress size={isMobile ? 24 : 32} />
        <Typography variant="body2" color="text.secondary">
          正在加载组件...
        </Typography>
      </Box>
    );
  };

  // 渲染错误状态
  const renderError = () => {
    if (errorFallback) {
      return errorFallback(error, retry);
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          gap: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="error">
          组件加载失败
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error?.message || '未知错误'}
        </Typography>
        {retryable && retryCount < maxRetries && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={retry}
          >
            重试 ({retryCount + 1}/{maxRetries})
          </Button>
        )}
      </Box>
    );
  };

  if (loading) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  if (!Component) {
    return null;
  }

  return <Component {...props}>{children}</Component>;
};

/**
 * 创建懒加载组件的高阶函数
 */
export const createLazyComponent = (importFunc, options = {}) => {
  const {
    fallback,
    errorFallback,
    retryable = true,
    maxRetries = 3,
    retryDelay = 1000,
    ...otherOptions
  } = options;

  return (props) => (
    <LazyComponent
      importFunc={importFunc}
      fallback={fallback}
      errorFallback={errorFallback}
      retryable={retryable}
      maxRetries={maxRetries}
      retryDelay={retryDelay}
      {...otherOptions}
      {...props}
    />
  );
};

/**
 * 懒加载路由组件
 */
export const LazyRoute = ({
  component: importFunc,
  loading: LoadingComponent,
  error: ErrorComponent,
  ...props
}) => {
  const LazyRouteComponent = lazy(importFunc);

  const defaultLoading = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}
    >
      <CircularProgress />
    </Box>
  );

  return (
    <Suspense fallback={LoadingComponent || defaultLoading}>
      <LazyRouteComponent {...props} />
    </Suspense>
  );
};

/**
 * 懒加载列表项组件
 */
export const LazyListItem = ({
  importFunc,
  itemData,
  index,
  style,
  onLoad,
  onError,
  ...props
}) => {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        const module = await importFunc();
        const LoadedComponent = module.default || module;
        
        if (mounted) {
          setComponent(() => LoadedComponent);
          setLoading(false);
          onLoad?.(LoadedComponent, index);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setLoading(false);
          onError?.(err, index);
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [importFunc, index, onLoad, onError]);

  if (loading) {
    return (
      <div style={style}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={60}
          sx={{ borderRadius: 1 }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={style}>
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            color: 'error.main',
            fontSize: '12px'
          }}
        >
          加载失败
        </Box>
      </div>
    );
  }

  if (!Component) {
    return <div style={style} />;
  }

  return (
    <div style={style}>
      <Component data={itemData} index={index} {...props} />
    </div>
  );
};

/**
 * 预加载组件
 */
export const preloadComponent = (importFunc) => {
  return importFunc().catch(() => {
    // 静默处理预加载失败
  });
};

/**
 * 批量预加载组件
 */
export const preloadComponents = (importFuncs) => {
  return Promise.allSettled(
    importFuncs.map(importFunc => preloadComponent(importFunc))
  );
};

export default LazyComponent;
