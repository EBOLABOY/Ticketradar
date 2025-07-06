import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Refresh,
  PlayArrow,
  Pause,
  Delete,
  NotificationsActive,
  Flight
} from '@mui/icons-material';
import { getShortAirportName } from '../../utils/flightLocalizer';
import { createAppleGlass, createGlassCard, createGlassButton } from '../../utils/glassmorphism';

/**
 * 当前任务详情组件
 * 负责显示当前选中任务的详细信息和操作按钮
 */
const CurrentTaskDetail = React.memo(({
  currentTask,
  stats,
  refreshing,
  onEdit,
  onToggleStatus,
  onDelete,
  onTriggerCheck,
  onEditButtonRef, // 新增：用于获取编辑按钮的引用
  onDeleteButtonRef // 新增：用于获取删除按钮的引用
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 将机场代码转换为显示名称的辅助函数
  const getAirportDisplayName = (airportCode) => {
    if (!airportCode) return '';

    const airportObj = {
      displayCode: airportCode,
      code: airportCode,
      name: '',
      city: ''
    };

    return getShortAirportName(airportObj);
  };

  if (!currentTask) {
    // 无监控任务时的创建提示
    return (
      <Card 
        sx={{
          ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
          borderRadius: '20px',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          <Flight 
            sx={{ 
              fontSize: 80, 
              color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)', 
              mb: 3 
            }} 
          />
          <Typography 
            variant="h5" 
            fontWeight="700" 
            gutterBottom
            sx={{
              background: isDark 
                ? 'linear-gradient(135deg, #ffffff, #e0e0e0)'
                : 'linear-gradient(135deg, #1a1a1a, #333333)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.5px',
              mb: 2,
            }}
          >
            {t('dashboard.noTasks.title')}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              fontWeight: 500,
              mb: 3,
            }}
          >
            {t('dashboard.noTasks.description')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{
        ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
        borderRadius: '20px',
        mb: 3,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box>
            <Typography 
              variant="h5" 
              fontWeight="700" 
              gutterBottom
              sx={{
                background: isDark 
                  ? 'linear-gradient(135deg, #ffffff, #e0e0e0)'
                  : 'linear-gradient(135deg, #1a1a1a, #333333)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.5px',
                mb: 2,
              }}
            >
              {currentTask.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
              <Chip
                label={currentTask.is_active ? t('dashboard.task.running') : t('dashboard.task.paused')}
                icon={currentTask.is_active ? <PlayArrow /> : <Pause />}
                sx={{
                  ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                  border: 'none',
                  fontWeight: 600,
                  color: currentTask.is_active ? '#2e7d32' : isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  },
                }}
              />
              <Chip
                label={`${t('dashboard.stats.totalTasks')}: ${stats.totalTasks}`}
                size="small"
                sx={{
                  ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                  border: isDark 
                    ? '1px solid rgba(255,255,255,0.2)' 
                    : '1px solid rgba(0,0,0,0.1)',
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  fontWeight: 500,
                }}
              />
              <Chip
                label={`${t('dashboard.stats.activeTasks')}: ${stats.activeTasks}`}
                size="small"
                sx={{
                  ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                  border: '1px solid #2e7d32',
                  color: '#2e7d32',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              ref={onEditButtonRef} // 添加ref
              variant="outlined"
              size="small"
              startIcon={<Edit />}
              onClick={onEdit}
              sx={{
                ...createGlassButton(isDark ? 'dark' : 'light'),
                borderRadius: '10px',
                px: 2,
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
              {t('dashboard.task.edit')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
              onClick={() => onTriggerCheck(currentTask.id)}
              disabled={refreshing || !currentTask.is_active}
              sx={{
                ...createGlassButton(isDark ? 'dark' : 'light'),
                borderRadius: '10px',
                px: 2,
                py: 1,
                fontWeight: 600,
                border: '1px solid #1976d2',
                color: '#1976d2',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isDark 
                    ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                },
                '&:disabled': {
                  opacity: 0.5,
                  transform: 'none',
                },
              }}
            >
              {t('dashboard.task.check')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={currentTask.is_active ? <Pause /> : <PlayArrow />}
              onClick={() => onToggleStatus(currentTask.id, currentTask.is_active)}
              sx={{
                ...createGlassButton(isDark ? 'dark' : 'light'),
                borderRadius: '10px',
                px: 2,
                py: 1,
                fontWeight: 600,
                border: currentTask.is_active ? '1px solid #f57c00' : '1px solid #2e7d32',
                color: currentTask.is_active ? '#f57c00' : '#2e7d32',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isDark 
                    ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                },
              }}
            >
              {currentTask.is_active ? t('dashboard.task.pause') : t('dashboard.task.start')}
            </Button>
            <Button
              ref={onDeleteButtonRef} // 添加ref
              variant="outlined"
              size="small"
              startIcon={<Delete />}
              onClick={onDelete}
              sx={{
                ...createGlassButton(isDark ? 'dark' : 'light'),
                borderRadius: '10px',
                px: 2,
                py: 1,
                fontWeight: 600,
                border: '1px solid #d32f2f',
                color: '#d32f2f',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                },
              }}
            >
              {t('dashboard.task.delete')}
            </Button>
          </Box>
        </Box>

        {/* 任务详情 - 紧凑型单行布局 */}
        <Box
          sx={{
            ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
            borderRadius: '12px',
            p: 2.5,
            mb: 3,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* 路线信息 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  路线
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="700"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.9rem',
                  }}
                >
                  <span style={{ color: '#1976d2' }}>{getAirportDisplayName(currentTask.departure_code)}</span>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}>→</span>
                  <span style={{ color: '#1976d2' }}>{currentTask.destination_code ? getAirportDisplayName(currentTask.destination_code) : 'ANY'}</span>
                </Typography>
              </Box>
            </Grid>

            {/* 出行日期 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  出行日期
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="600"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    fontSize: '0.9rem',
                  }}
                >
                  {currentTask.depart_date}
                </Typography>
              </Box>
            </Grid>

            {/* 价格阈值 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  价格阈值
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="700"
                  sx={{
                    background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '0.9rem',
                  }}
                >
                  ¥{currentTask.price_threshold}
                </Typography>
              </Box>
            </Grid>

            {/* 创建时间 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  创建时间
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="600"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    fontSize: '0.9rem',
                  }}
                >
                  {new Date(currentTask.created_at).toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* 任务统计信息 - 紧凑型布局 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* 检查次数 */}
          <Grid item xs={4}>
            <Box
              sx={{
                ...createGlassCard(isDark ? 'dark' : 'light'),
                textAlign: 'center',
                p: 2,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80px', // 确保高度一致
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(31, 38, 135, 0.2)',
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="700"
                sx={{
                  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 0.5,
                  lineHeight: 1,
                }}
              >
                {currentTask.total_checks || 0}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                检查次数
              </Typography>
            </Box>
          </Grid>

          {/* 通知次数 */}
          <Grid item xs={4}>
            <Box
              sx={{
                ...createGlassCard(isDark ? 'dark' : 'light'),
                textAlign: 'center',
                p: 2,
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80px', // 确保高度一致
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(31, 38, 135, 0.2)',
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="700"
                sx={{
                  background: 'linear-gradient(135deg, #2e7d32, #1b5e20)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 0.5,
                  lineHeight: 1,
                }}
              >
                {currentTask.total_notifications || 0}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                通知次数
              </Typography>
            </Box>
          </Grid>

          {/* 最后检查 */}
          <Grid item xs={4}>
            <Box
              sx={{
                ...createGlassCard(isDark ? 'dark' : 'light'),
                textAlign: 'center',
                p: 2.2, // 稍微减小内边距
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '82px', // 稍微减小高度
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(31, 38, 135, 0.2)',
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight="700"
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                  mb: 0.6, // 稍微减小间距
                  fontSize: '0.9rem',
                  lineHeight: 1.2,
                }}
              >
                {currentTask.last_check ? new Date(currentTask.last_check).toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '无检查'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                最后检查
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 任务配置信息 */}
        {(currentTask.blacklist_cities || currentTask.blacklist_countries || currentTask.pushplus_token) && (
          <Box 
            sx={{ 
              mt: 3, 
              p: 3, 
              ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
              borderRadius: '16px',
            }}
          >
            <Typography 
              variant="subtitle2" 
              fontWeight="700" 
              gutterBottom
              sx={{
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                mb: 2,
              }}
            >
              {t('dashboard.task.advancedConfig')}
            </Typography>
            <Grid container spacing={2}>
              {currentTask.blacklist_cities && (
                <Grid item xs={12} sm={6}>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                    }}
                  >
                    {t('dashboard.task.blacklistCities')}: {currentTask.blacklist_cities}
                  </Typography>
                </Grid>
              )}
              {currentTask.blacklist_countries && (
                <Grid item xs={12} sm={6}>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                    }}
                  >
                    {t('dashboard.task.blacklistCountries')}: {currentTask.blacklist_countries}
                  </Typography>
                </Grid>
              )}
              {currentTask.pushplus_token && (
                <Grid item xs={12}>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <NotificationsActive 
                      fontSize="small" 
                      sx={{ 
                        mr: 1, 
                        color: '#2e7d32',
                      }} 
                    />
                    {t('dashboard.task.pushplusConfigured')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

CurrentTaskDetail.displayName = 'CurrentTaskDetail';

export default CurrentTaskDetail;