import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { getConfirmDialogPosition } from '../../utils/dialogPositioning';
import {
  Box,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Warning,
  Delete,
  Refresh
} from '@mui/icons-material';
import { createAppleGlass, createGlassButton } from '../../utils/glassmorphism';

/**
 * Dashboard操作组件
 * 负责浮动操作按钮、删除确认对话框和通知显示
 */
const DashboardActions = React.memo(({
  // 删除对话框相关
  deleteDialogOpen,
  currentTask,
  onDeleteConfirm,
  onDeleteCancel,
  deleteButtonRef, // 新增：删除按钮的引用

  // 通知相关
  snackbar,
  onSnackbarClose,

  // 错误显示相关
  error,
  refreshing,
  onRefresh,

  // 创建任务相关
  onCreateTask,
  onCreateButtonRef // 新增：用于获取创建按钮的引用
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';



  return (
    <>
      {/* 错误提示 */}
      {error && (
        <Alert
          severity="error"
          sx={{ 
            mb: 3, 
            borderRadius: '16px',
            ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
            border: '1px solid rgba(211, 47, 47, 0.3)',
            color: '#d32f2f',
            '& .MuiAlert-icon': {
              color: '#d32f2f',
            },
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onRefresh}
              disabled={refreshing}
              startIcon={<Refresh />}
              sx={{
                ...createGlassButton(isDark ? 'dark' : 'light'),
                borderRadius: '8px',
                px: 2,
                py: 0.5,
                fontWeight: 600,
                border: '1px solid rgba(211, 47, 47, 0.3)',
                color: '#d32f2f',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isDark 
                    ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                },
                '&:disabled': {
                  opacity: 0.6,
                  transform: 'none',
                },
              }}
            >
              {t('common.refresh')}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* 浮动操作按钮 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000
        }}
      >
        <Tooltip title="创建新任务 (Ctrl+N)" placement="left">
          <Button
            ref={onCreateButtonRef} // 添加ref
            variant="contained"
            size="large"
            onClick={onCreateTask}
            sx={{
              ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
              borderRadius: '50%',
              width: 72,
              height: 72,
              minWidth: 72,
              background: 'linear-gradient(135deg, #1976d2, #1565c0)',
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.15) translateY(-2px)',
                background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
                boxShadow: isDark
                  ? '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 16px 40px rgba(31, 38, 135, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              },
              '&:active': {
                transform: 'scale(1.1) translateY(-1px)',
              },
            }}
          >
            <Add sx={{ fontSize: 36 }} />
          </Button>
        </Tooltip>
      </Box>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
            minWidth: '400px',
            ...(deleteButtonRef ? getConfirmDialogPosition(deleteButtonRef) : {}), // 如果有删除按钮引用，使用自定义位置
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                borderRadius: '12px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Warning sx={{ color: '#d32f2f', fontSize: 28 }} />
            </Box>
            <Typography 
              variant="h6" 
              fontWeight="700"
              sx={{
                background: isDark 
                  ? 'linear-gradient(135deg, #ffffff, #e0e0e0)'
                  : 'linear-gradient(135deg, #1a1a1a, #333333)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.5px',
              }}
            >
              确认删除
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography
            sx={{
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              fontWeight: 500,
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            确定要删除监控任务 <strong>"{currentTask?.name}"</strong> 吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={onDeleteCancel}
            sx={{
              ...createGlassButton(isDark ? 'dark' : 'light'),
              borderRadius: '12px',
              px: 3,
              py: 1,
              fontWeight: 600,
              border: isDark 
                ? '1px solid rgba(255, 255, 255, 0.2)' 
                : '1px solid rgba(0, 0, 0, 0.1)',
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: isDark 
                  ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              },
            }}
          >
            取消
          </Button>
          <Button
            onClick={onDeleteConfirm}
            variant="contained"
            startIcon={<Delete />}
            sx={{
              ...createGlassButton(isDark ? 'dark' : 'light'),
              borderRadius: '12px',
              px: 3,
              py: 1,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #d32f2f, #b71c1c)',
              border: 'none',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #b71c1c, #8e0000)',
                transform: 'translateY(-1px)',
                boxShadow: isDark 
                  ? '0 6px 16px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  : '0 6px 16px rgba(183, 28, 28, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={onSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={onSnackbarClose}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
            border: snackbar.severity === 'error' 
              ? '1px solid rgba(211, 47, 47, 0.3)'
              : snackbar.severity === 'success'
                ? '1px solid rgba(46, 125, 50, 0.3)'
                : snackbar.severity === 'warning'
                  ? '1px solid rgba(245, 124, 0, 0.3)'
                  : '1px solid rgba(25, 118, 210, 0.3)',
            fontWeight: 600,
            '& .MuiAlert-icon': {
              fontSize: '1.2rem',
            },
            '& .MuiAlert-action': {
              '& .MuiIconButton-root': {
                ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                borderRadius: '8px',
                width: 32,
                height: 32,
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: isDark 
                    ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                },
              },
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
});

DashboardActions.displayName = 'DashboardActions';

export default DashboardActions;