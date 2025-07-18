import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  IconButton,
  Chip,
  Slide,
  Fade
} from '@mui/material';
import {
  WifiOff,
  Wifi,
  CloudOff,
  Refresh,
  SignalWifi4Bar,
  SignalWifi2Bar,
  SignalWifi1Bar
} from '@mui/icons-material';
import { networkStatusManager } from '../../utils/pwaUtils';

/**
 * 离线状态指示器组件
 */
const OfflineIndicator = ({
  position = { vertical: 'top', horizontal: 'center' },
  autoHideDuration = 6000,
  showConnectionType = true,
  onRetry,
  sx = {},
  ...props
}) => {
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  useEffect(() => {
    const handleNetworkChange = (event, data) => {
      switch (event) {
        case 'online':
          setShowOnlineAlert(true);
          setShowOfflineAlert(false);
          break;
        case 'offline':
          setShowOfflineAlert(true);
          setShowOnlineAlert(false);
          break;
        case 'connection-change':
          break;
        default:
          break;
      }
    };

    networkStatusManager.onNetworkChange(handleNetworkChange);

    return () => {
      networkStatusManager.removeNetworkChange(handleNetworkChange);
    };
  }, []);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* 离线提示 */}
      <Snackbar
        open={showOfflineAlert}
        anchorOrigin={position}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
        sx={sx}
        {...props}
      >
        <Alert
          severity="error"
          variant="filled"
          icon={<WifiOff />}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={handleRetry}
            >
              <Refresh />
            </IconButton>
          }
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography variant="body2" fontWeight={600}>
              网络连接已断开
            </Typography>
            <Typography variant="caption">
              您现在处于离线模式，部分功能可能无法使用
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      {/* 重新连接提示 */}
      <Snackbar
        open={showOnlineAlert}
        autoHideDuration={autoHideDuration}
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={position}
        TransitionComponent={Fade}
      >
        <Alert
          severity="success"
          variant="filled"
          icon={<Wifi />}
          onClose={() => setShowOnlineAlert(false)}
          sx={{ width: '100%' }}
        >
          网络连接已恢复
        </Alert>
      </Snackbar>
    </>
  );
};

/**
 * 网络状态芯片组件
 */
const NetworkStatusChip = ({
  size = 'small',
  variant = 'outlined',
  showIcon = true,
  showText = true,
  onClick,
  sx = {},
  ...props
}) => {
  const [isOnline, setIsOnline] = useState(networkStatusManager.isOnline);
  const [connectionType, setConnectionType] = useState(networkStatusManager.connectionType);

  useEffect(() => {
    const handleNetworkChange = (event, data) => {
      switch (event) {
        case 'online':
          setIsOnline(true);
          break;
        case 'offline':
          setIsOnline(false);
          break;
        case 'connection-change':
          setConnectionType(data);
          break;
        default:
          break;
      }
    };

    networkStatusManager.onNetworkChange(handleNetworkChange);

    return () => {
      networkStatusManager.removeNetworkChange(handleNetworkChange);
    };
  }, [setIsOnline, setConnectionType]);

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff />;
    
    if (!connectionType) return <Wifi />;
    
    switch (connectionType.effectiveType) {
      case 'slow-2g':
      case '2g':
        return <SignalWifi1Bar />;
      case '3g':
        return <SignalWifi2Bar />;
      case '4g':
      default:
        return <SignalWifi4Bar />;
    }
  };

  const getConnectionText = () => {
    if (!isOnline) return '离线';
    
    if (!connectionType) return '在线';
    
    const { effectiveType, saveData } = connectionType;
    
    if (saveData) return '省流量';
    
    switch (effectiveType) {
      case 'slow-2g':
        return '慢速';
      case '2g':
        return '2G';
      case '3g':
        return '3G';
      case '4g':
        return '4G';
      default:
        return '在线';
    }
  };

  const getConnectionColor = () => {
    if (!isOnline) return 'error';
    
    if (!connectionType) return 'success';
    
    const { effectiveType, saveData } = connectionType;
    
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'warning';
    }
    
    return 'success';
  };

  return (
    <Chip
      size={size}
      variant={variant}
      color={getConnectionColor()}
      icon={showIcon ? getConnectionIcon() : undefined}
      label={showText ? getConnectionText() : undefined}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        ...sx
      }}
      {...props}
    />
  );
};

/**
 * 离线模式横幅组件
 */
const OfflineBanner = ({
  show = true,
  onRetry,
  onDismiss,
  sx = {},
  ...props
}) => {
  const [isOnline, setIsOnline] = useState(networkStatusManager.isOnline);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleNetworkChange = (event) => {
      switch (event) {
        case 'online':
          setIsOnline(true);
          setDismissed(false);
          break;
        case 'offline':
          setIsOnline(false);
          setDismissed(false);
          break;
        default:
          break;
      }
    };

    networkStatusManager.onNetworkChange(handleNetworkChange);

    return () => {
      networkStatusManager.removeNetworkChange(handleNetworkChange);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  if (isOnline || !show || dismissed) {
    return null;
  }

  return (
    <Box
      sx={{
        backgroundColor: 'error.main',
        color: 'error.contrastText',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...sx
      }}
      {...props}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <CloudOff />
        <Box>
          <Typography variant="body2" fontWeight={600}>
            离线模式
          </Typography>
          <Typography variant="caption">
            网络连接不可用，正在使用缓存数据
          </Typography>
        </Box>
      </Box>
      
      <Box display="flex" gap={1}>
        <IconButton
          size="small"
          color="inherit"
          onClick={handleRetry}
        >
          <Refresh />
        </IconButton>
        {onDismiss && (
          <IconButton
            size="small"
            color="inherit"
            onClick={handleDismiss}
          >
            <WifiOff />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export { OfflineIndicator, NetworkStatusChip, OfflineBanner };
export default OfflineIndicator;
