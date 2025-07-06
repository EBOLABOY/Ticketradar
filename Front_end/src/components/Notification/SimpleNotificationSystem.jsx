import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// 通知上下文
const NotificationContext = createContext();

// 通知类型配置
const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle,
    color: '#4caf50'
  },
  error: {
    icon: Error,
    color: '#f44336'
  },
  warning: {
    icon: Warning,
    color: '#ff9800'
  },
  info: {
    icon: Info,
    color: '#2196f3'
  }
};

// 简化的通知组件
const SimpleNotification = ({ 
  notification, 
  onClose, 
  isDark 
}) => {
  const typeConfig = NOTIFICATION_TYPES[notification.severity] || NOTIFICATION_TYPES.info;
  
  return (
    <Alert
      severity={notification.severity}
      onClose={onClose}
      sx={{
        borderRadius: '12px',
        minWidth: '300px',
        maxWidth: '500px',
        boxShadow: isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4)'
          : '0 8px 32px rgba(0, 0, 0, 0.1)',
        '& .MuiAlert-icon': {
          color: typeConfig.color,
          fontSize: '1.25rem'
        },
        '& .MuiAlert-message': {
          padding: 0,
          width: '100%'
        }
      }}
      action={
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      }
    >
      <Box>
        {notification.title && (
          <AlertTitle sx={{ 
            fontWeight: 600, 
            fontSize: '0.95rem',
            marginBottom: '4px'
          }}>
            {notification.title}
          </AlertTitle>
        )}
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            lineHeight: 1.4
          }}
        >
          {notification.message}
        </Typography>
      </Box>
    </Alert>
  );
};

// 通知提供者组件
export const SimpleNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 隐藏通知
  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // 显示通知
  const showNotification = useCallback((options) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      severity: 'info',
      autoHideDuration: 6000,
      ...options
    };

    setNotifications(prev => [...prev, notification]);

    // 自动隐藏
    if (notification.autoHideDuration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, notification.autoHideDuration);
    }

    return id;
  }, [hideNotification]);

  // 清除所有通知
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 便捷方法
  const success = useCallback((message, options = {}) => {
    return showNotification({
      severity: 'success',
      message,
      title: options.title || '成功',
      ...options
    });
  }, [showNotification]);

  const error = useCallback((message, options = {}) => {
    return showNotification({
      severity: 'error',
      message,
      title: options.title || '错误',
      autoHideDuration: 8000,
      ...options
    });
  }, [showNotification]);

  const warning = useCallback((message, options = {}) => {
    return showNotification({
      severity: 'warning',
      message,
      title: options.title || '警告',
      ...options
    });
  }, [showNotification]);

  const info = useCallback((message, options = {}) => {
    return showNotification({
      severity: 'info',
      message,
      title: options.title || '信息',
      ...options
    });
  }, [showNotification]);

  const value = {
    notifications,
    showNotification,
    hideNotification,
    clearNotifications,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* 渲染通知 - 使用固定定位避免Snackbar的scrollTop问题 */}
      {notifications.map((notification, index) => {
        return (
          <Box
            key={notification.id}
            sx={{
              position: 'fixed',
              top: `${80 + index * 80}px`,
              right: '16px',
              zIndex: 9999,
              maxWidth: '400px',
              minWidth: '300px'
            }}
          >
            <SimpleNotification
              notification={notification}
              onClose={() => hideNotification(notification.id)}
              isDark={isDark}
            />
          </Box>
        );
      })}
    </NotificationContext.Provider>
  );
};

// Hook for using notifications
export const useSimpleNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useSimpleNotification must be used within a SimpleNotificationProvider');
  }
  return context;
};

export default SimpleNotificationProvider;
