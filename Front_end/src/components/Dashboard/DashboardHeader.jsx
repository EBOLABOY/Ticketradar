import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Paper,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
  Chip
} from '@mui/material';
import {
  Add,
  Refresh,
  FlightTakeoff,
  Notifications,
  TrendingUp,
  Schedule
} from '@mui/icons-material';
import { createAppleGlass, createGlassButton } from '../../utils/glassmorphism';

/**
 * Dashboard头部组件
 * 负责显示页面标题、用户信息、语言切换和主要操作按钮
 */
const DashboardHeader = React.memo(({
  user,
  refreshing,
  onRefresh,
  onCreateTask
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        ...createAppleGlass('secondary', isDark ? 'dark' : 'light', {
          // 更透明的背景，与主页搜索栏风格一致
          background: isDark
            ? 'rgba(16, 16, 16, 0.6)'
            : 'rgba(255, 255, 255, 0.5)',
          // 增强模糊效果
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }),
        p: 4,
        mb: 4,
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        // 悬停效果
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark
            ? '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 12px 40px rgba(31, 38, 135, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        },
        // 装饰性渐变覆盖层
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        },
      }}
    >
      <Box position="relative" zIndex={2}>
        {/* 顶部区域：用户信息和操作按钮 */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* 左侧：欢迎信息和功能亮点 */}
          <Box>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                  fontSize: '24px',
                  fontWeight: 700,
                  boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight="800"
                  sx={{
                    background: isDark
                      ? 'linear-gradient(135deg, #ffffff, #e0e0e0)'
                      : 'linear-gradient(135deg, #1a1a1a, #333333)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '0.5px',
                    mb: 0.5,
                  }}
                >
                  欢迎回来，{user?.username || '用户'}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    fontWeight: 500,
                  }}
                >
                  管理您的机票价格监控任务
                </Typography>
              </Box>
            </Box>

            {/* 功能亮点 */}
            <Box display="flex" alignItems="center" gap={2} sx={{ mt: 3 }}>
              <Chip
                icon={<FlightTakeoff fontSize="small" />}
                label="智能机票监控"
                variant="outlined"
                size="medium"
                sx={{
                  color: isDark ? 'primary.light' : 'primary.dark',
                  borderColor: isDark ? 'primary.light' : 'primary.dark',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<TrendingUp />}
                label="实时价格追踪"
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  fontWeight: 500,
                }}
              />
              <Chip
                icon={<Notifications />}
                label="智能提醒"
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  fontWeight: 500,
                }}
              />
              <Chip
                icon={<Schedule />}
                label="24/7监控"
                size="small"
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>

          {/* 右侧：操作按钮 */}
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="刷新数据">
              <IconButton
                onClick={onRefresh}
                disabled={refreshing}
                sx={{
                  ...createGlassButton(isDark ? 'dark' : 'light'),
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0, 0, 0, 0.6)'
                      : '0 8px 32px rgba(31, 38, 135, 0.4)',
                  },
                }}
              >
                {refreshing ? <CircularProgress size={24} color="inherit" /> : <Refresh sx={{ fontSize: 24 }} />}
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onCreateTask}
              sx={{
                borderRadius: '16px',
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '16px',
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                boxShadow: '0 8px 32px rgba(25, 118, 210, 0.4)',
                border: 'none',
                color: 'white',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(25, 118, 210, 0.5)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              创建监控任务
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* 装饰性光效 - 适应主题 */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          background: isDark
            ? 'radial-gradient(circle, rgba(144, 202, 249, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(66, 165, 245, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          background: isDark
            ? 'radial-gradient(circle, rgba(100, 181, 246, 0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(33, 150, 243, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </Paper>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;