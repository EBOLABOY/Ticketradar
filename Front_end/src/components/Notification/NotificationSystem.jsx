import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography,
  LinearProgress
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
  Notifications
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { createAppleGlass } from '../../utils/glassmorphism';

// 通知上下文
const NotificationContext = createContext();

// 通知类型配置
const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle,
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'rgba(76, 175, 80, 0.3)'
  },
  error: {
    icon: Error,
    color: '#f44336',
    bgColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: 'rgba(244, 67, 54, 0.3)'
  },
  warning: {
    icon: Warning,
    color: '#ff9800',
    bgColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: 'rgba(255, 152, 0, 0.3)'
  },
  info: {
    icon: Info,
    color: '#2196f3',
    bgColor: 'rgba(33, 150, 243, 0.1)',
    borderColor: 'rgba(33, 150, 243, 0.3)'
  }
};



// 增强的通知组件
const EnhancedNotification = ({ 
  notification, 
  onClose, 
  isDark 
}) => {
  const typeConfig = NOTIFICATION_TYPES[notification.severity] || NOTIFICATION_TYPES.info;
  const IconComponent = typeConfig.icon;
  
  return (
    <Alert
      severity={notification.severity}
      onClose={onClose}
      sx={{
        ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
        borderRadius: '16px',
        border: `1px solid ${typeConfig.borderColor}`,
        backgroundColor: isDark 
          ? `rgba(0, 0, 0, 0.8)` 
          : `rgba(255, 255, 255, 0.9)`,
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px ${typeConfig.borderColor}`
          : `0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px ${typeConfig.borderColor}`,
        minWidth: '320px',
        maxWidth: '500px',
        '& .MuiAlert-icon': {
          color: typeConfig.color,
          fontSize: '1.5rem',
          marginTop: '2px'
        },
        '& .MuiAlert-message': {
          padding: 0,
          width: '100%'
        },
        '& .MuiAlert-action': {
          padding: 0,
          marginRight: '-8px'
        }
      }}
      icon={<IconComponent />}
      action={
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      }
    >
      <Box>
        {notification.title && (
          <AlertTitle sx={{ 
            fontWeight: 700, 
            fontSize: '1rem',
            color: typeConfig.color,
            marginBottom: '4px'
          }}>
            {notification.title}
          </AlertTitle>
        )}
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            lineHeight: 1.4,
            color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'
          }}
        >
          {notification.message}
        </Typography>
        
        {notification.showProgress && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress 
              variant="indeterminate"
              sx={{
                height: 3,
                borderRadius: 2,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: typeConfig.color,
                  borderRadius: 2
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Alert>
  );
};

// 通知提供者组件
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
  }, []);

  // 隐藏通知
  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

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
      autoHideDuration: 8000, // 错误消息显示更长时间
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

  const loading = useCallback((message, options = {}) => {
    return showNotification({
      severity: 'info',
      message,
      title: options.title || '加载中',
      showProgress: true,
      autoHideDuration: 0, // 不自动隐藏
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
    info,
    loading
  };



  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* 渲染通知 */}
      {notifications.map((notification) => {
        return (
          <Snackbar
            key={notification.id}
            open={true}
            anchorOrigin={{
              vertical: notification.position?.vertical || 'top',
              horizontal: notification.position?.horizontal || 'right'
            }}
            sx={{
              '& .MuiSnackbar-root': {
                position: 'relative'
              }
            }}
          >
            <EnhancedNotification
              notification={notification}
              onClose={() => hideNotification(notification.id)}
              isDark={isDark}
            />
          </Snackbar>
        );
      })}
    </NotificationContext.Provider>
  );
};

// Hook for using notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
