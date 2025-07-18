import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
  Snackbar,
  Alert
} from '@mui/material';
import {
  GetApp,
  Close,
  PhoneIphone,
  Computer,
  Notifications,
  OfflineBolt
} from '@mui/icons-material';
import { pwaInstallManager } from '../../utils/pwaUtils';
import { useMobile } from '../../hooks/useMobile';
import { TouchButton } from '../TouchEnhanced';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * PWA安装提示组件
 */
const PWAInstallPrompt = ({
  autoShow = true,
  showDelay = 3000,
  onInstall,
  onDismiss,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [installStatus, setInstallStatus] = useState(pwaInstallManager.getInstallStatus());
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { isMobile } = useMobile();

  useEffect(() => {
    // 监听PWA安装事件
    const handleInstallEvent = (event, data) => {
      const status = pwaInstallManager.getInstallStatus();
      setInstallStatus(status);

      switch (event) {
        case 'installable':
          if (autoShow && !status.isInstalled) {
            setTimeout(() => setOpen(true), showDelay);
          }
          break;
        case 'installed':
          setOpen(false);
          setSnackbarMessage('应用已成功安装到主屏幕！');
          setShowSnackbar(true);
          onInstall?.();
          break;
        case 'accepted':
          setOpen(false);
          break;
        case 'dismissed':
          setOpen(false);
          onDismiss?.();
          break;
        default:
          break;
      }
    };

    pwaInstallManager.onInstallEvent(handleInstallEvent);

    return () => {
      pwaInstallManager.removeInstallEvent(handleInstallEvent);
    };
  }, [autoShow, showDelay, onInstall, onDismiss]);

  const handleInstall = async () => {
    try {
      const outcome = await pwaInstallManager.showInstallPrompt();
      if (outcome === 'accepted') {
        setSnackbarMessage('正在安装应用...');
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('安装失败:', error);
      setSnackbarMessage('安装失败，请稍后重试');
      setShowSnackbar(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    onDismiss?.();
  };

  const features = [
    {
      icon: <OfflineBolt />,
      title: '离线访问',
      description: '即使没有网络也能使用基本功能'
    },
    {
      icon: <Notifications />,
      title: '推送通知',
      description: '及时接收航班价格变动提醒'
    },
    {
      icon: isMobile ? <PhoneIphone /> : <Computer />,
      title: '原生体验',
      description: '像原生应用一样流畅的使用体验'
    }
  ];

  if (installStatus.isInstalled || !installStatus.isInstallable) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            mx: 2
          }
        }}
        {...props}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <GetApp color="primary" />
              <Typography variant="h6" component="div">
                安装票达雷达
              </Typography>
            </Box>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: 'grey.500' }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            将票达雷达添加到主屏幕，享受更好的使用体验
          </Typography>

          <Box sx={{ mb: 3 }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  borderBottom: index < features.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {feature.icon}
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {isMobile && (
            <Box
              sx={{
                p: 2,
                backgroundColor: 'info.light',
                borderRadius: 2,
                mb: 2
              }}
            >
              <Typography variant="body2" color="info.dark">
                💡 安装后可以像原生应用一样从主屏幕直接打开
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            color="inherit"
            sx={{ mr: 1 }}
          >
            稍后再说
          </Button>
          <TouchButton
            onClick={handleInstall}
            variant="contained"
            startIcon={<GetApp />}
            disabled={!installStatus.canPrompt}
            sx={{ minWidth: 120 }}
          >
            立即安装
          </TouchButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

/**
 * PWA安装按钮组件
 */
const PWAInstallButton = ({
  variant = 'outlined',
  size = 'medium',
  showIcon = true,
  children,
  onInstall,
  onError,
  sx = {},
  ...props
}) => {
  const [installStatus, setInstallStatus] = useState(pwaInstallManager.getInstallStatus());
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handleInstallEvent = (event, data) => {
      const status = pwaInstallManager.getInstallStatus();
      setInstallStatus(status);

      if (event === 'installed') {
        setInstalling(false);
        onInstall?.();
      } else if (event === 'accepted') {
        setInstalling(true);
      } else if (event === 'dismissed') {
        setInstalling(false);
      }
    };

    pwaInstallManager.onInstallEvent(handleInstallEvent);

    return () => {
      pwaInstallManager.removeInstallEvent(handleInstallEvent);
    };
  }, [onInstall]);

  const handleClick = async () => {
    try {
      await pwaInstallManager.showInstallPrompt();
    } catch (error) {
      console.error('安装失败:', error);
      onError?.(error);
    }
  };

  if (installStatus.isInstalled || !installStatus.isInstallable) {
    return null;
  }

  return (
    <TouchButton
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={!installStatus.canPrompt || installing}
      startIcon={showIcon ? <GetApp /> : null}
      sx={sx}
      {...props}
    >
      {children || (installing ? '安装中...' : '安装应用')}
    </TouchButton>
  );
};

/**
 * PWA状态指示器
 */
const PWAStatusIndicator = ({ sx = {} }) => {
  const [installStatus, setInstallStatus] = useState(pwaInstallManager.getInstallStatus());

  useEffect(() => {
    const handleInstallEvent = () => {
      setInstallStatus(pwaInstallManager.getInstallStatus());
    };

    pwaInstallManager.onInstallEvent(handleInstallEvent);

    return () => {
      pwaInstallManager.removeInstallEvent(handleInstallEvent);
    };
  }, []);

  if (!installStatus.isInstalled) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1,
        backgroundColor: 'success.light',
        color: 'success.dark',
        borderRadius: 2,
        fontSize: '0.875rem',
        ...sx
      }}
    >
      <GetApp fontSize="small" />
      <Typography variant="body2">
        已安装为应用
      </Typography>
    </Box>
  );
};

export { PWAInstallPrompt, PWAInstallButton, PWAStatusIndicator };
export default PWAInstallPrompt;
