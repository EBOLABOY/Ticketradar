import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import {
  Schedule,
  PlayArrow,
  FlightTakeoff,
  AttachMoney
} from '@mui/icons-material';
import { createAppleGlass, createGlassCard } from '../../utils/glassmorphism';

/**
 * Dashboard统计面板组件
 * 负责显示监控任务统计信息和系统概览
 */
const DashboardStats = React.memo(({ stats, user }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 统计卡片数据
  const statCards = [
    {
      title: t('dashboard.stats.totalTasks'),
      value: stats.totalTasks,
      icon: Schedule,
      color: 'primary.main'
    },
    {
      title: t('dashboard.stats.activeTasks'),
      value: stats.activeTasks,
      icon: PlayArrow,
      color: 'success.main'
    },
    {
      title: t('dashboard.stats.foundFlights'),
      value: stats.totalFlights,
      icon: FlightTakeoff,
      color: 'info.main'
    },
    {
      title: t('dashboard.stats.lowestPrice'),
      value: stats.minPrice > 0 ? `¥${stats.minPrice}` : '--',
      icon: AttachMoney,
      color: 'warning.main'
    }
  ];

  return (
    <>
      {/* 主要统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  ...createGlassCard(isDark ? 'dark' : 'light'),
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: isDark
                      ? '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                      : '0 12px 32px rgba(31, 38, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3, position: 'relative' }}>
                  {/* 图标区域使用tertiary级别嵌套效果 */}
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                    }}
                  >
                    <IconComponent
                      sx={{
                        fontSize: 32,
                        background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      }}
                    />
                  </Box>
                  
                  {/* 数字使用渐变色突出显示 */}
                  <Typography
                    variant="h4"
                    fontWeight="700"
                    gutterBottom
                    sx={{
                      background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 系统概览 - Control Center风格模块化设计 */}
      {(stats.totalTasks > 0 || stats.totalFlights > 0) && (
        <Card
          sx={{
            ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
            borderRadius: '20px',
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              fontWeight="700"
              gutterBottom
              sx={{
                mb: 3,
                color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                letterSpacing: '0.5px',
              }}
            >
              {t('dashboard.stats.systemOverview')}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '16px',
                    ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                        : '0 8px 24px rgba(31, 38, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                    }
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    sx={{
                      background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 1,
                    }}
                  >
                    {stats.lowPriceCount}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                    }}
                  >
                    {t('dashboard.stats.lowPriceAlerts')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '16px',
                    ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                        : '0 8px 24px rgba(31, 38, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                    }
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    sx={{
                      background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 1,
                    }}
                  >
                    {Math.round((stats.activeTasks / Math.max(stats.totalTasks, 1)) * 100)}%
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                    }}
                  >
                    {t('dashboard.stats.taskActiveRate')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '16px',
                    ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                        : '0 8px 24px rgba(31, 38, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                    }
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight="700"
                    sx={{
                      background: 'linear-gradient(135deg, #0288d1, #0277bd)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 1,
                    }}
                  >
                    {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : '--'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                    }}
                  >
                    {t('dashboard.stats.lastUpdate')}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '16px',
                    ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: isDark
                        ? '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                        : '0 8px 24px rgba(31, 38, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                    }
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight="700"
                    sx={{
                      background: 'linear-gradient(135deg, #f57c00, #ef6c00)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      mb: 1,
                    }}
                  >
                    {user?.username || 'Guest'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                    }}
                  >
                    {t('dashboard.stats.currentUser')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </>
  );
});

DashboardStats.displayName = 'DashboardStats';

export default DashboardStats;