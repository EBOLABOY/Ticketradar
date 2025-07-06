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
  IconButton
} from '@mui/material';
import {
  Add,
  Edit,
  PlayArrow,
  Pause,
  Delete
} from '@mui/icons-material';
import { getShortAirportName } from '../../utils/flightLocalizer';
import { createAppleGlass, createGlassCard, createGlassButton } from '../../utils/glassmorphism';

/**
 * 监控任务列表组件
 * 负责显示所有监控任务的列表和基本操作
 */
const MonitorTaskList = React.memo(({
  monitorTasks,
  currentTask,
  onTaskSelect,
  onCreateTask,
  onEditTask,
  onToggleStatus,
  onDeleteTask
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 将机场代码转换为显示名称的辅助函数
  const getAirportDisplayName = (airportCode) => {
    if (!airportCode) return '';

    // 创建一个临时的机场对象
    const airportObj = {
      displayCode: airportCode,
      code: airportCode,
      name: '',
      city: ''
    };

    return getShortAirportName(airportObj);
  };

  // 添加调试信息
  console.log('MonitorTaskList - monitorTasks:', monitorTasks);
  console.log('MonitorTaskList - monitorTasks type:', typeof monitorTasks);
  console.log('MonitorTaskList - monitorTasks length:', monitorTasks?.length);

  if (!monitorTasks || monitorTasks.length === 0) {
    // 显示空状态而不是返回null
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
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
              我的监控任务
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={onCreateTask}
              sx={{
                ...createGlassButton(isDark ? 'dark' : 'light'),
                borderRadius: '12px',
                px: 2,
                py: 1,
                fontWeight: 600,
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              }}
            >
              创建任务
            </Button>
          </Box>

          <Box
            textAlign="center"
            py={6}
            sx={{
              ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
              borderRadius: '16px',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                fontWeight: 600,
                mb: 1,
              }}
            >
              暂无监控任务
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                fontWeight: 500,
                mb: 3,
              }}
            >
              创建您的第一个监控任务开始使用
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onCreateTask}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
                },
              }}
            >
              创建监控任务
            </Button>
          </Box>
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
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
            我的监控任务
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={onCreateTask}
            sx={{
              ...createGlassButton(isDark ? 'dark' : 'light'),
              borderRadius: '12px',
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
                  ? '0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  : '0 6px 20px rgba(31, 38, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              },
            }}
          >
            {t('dashboard.flights.newTask')}
          </Button>
        </Box>

        <Grid container spacing={3}>
          {Array.isArray(monitorTasks) ? monitorTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card
                sx={{
                  ...createGlassCard(isDark ? 'dark' : 'light'),
                  borderRadius: '16px',
                  border: currentTask?.id === task.id
                    ? '2px solid #1976d2'
                    : isDark
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: isDark
                      ? '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                      : '0 12px 32px rgba(31, 38, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                    borderColor: '#1976d2',
                  },
                  ...(currentTask?.id === task.id && {
                    boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
                  }),
                }}
                onClick={() => onTaskSelect(task)}
              >
                <CardContent sx={{ p: 3, position: 'relative' }}>
                  {/* 选中状态指示器 */}
                  {currentTask?.id === task.id && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #1976d2, #1565c0)',
                      }}
                    />
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography
                      variant="subtitle1"
                      fontWeight="700"
                      noWrap
                      sx={{
                        color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                        flex: 1,
                        mr: 1,
                      }}
                    >
                      {task.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={task.is_active ? t('dashboard.task.running') : t('dashboard.task.paused')}
                      sx={{
                        ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: '24px',
                        color: task.is_active
                          ? '#2e7d32'
                          : isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    {getAirportDisplayName(task.departure_code)} → {task.destination_code ? getAirportDisplayName(task.destination_code) : t('dashboard.task.allDestinations')}
                  </Typography>

                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    出发: {task.depart_date}
                  </Typography>

                  <Typography
                    variant="body2"
                    gutterBottom
                    sx={{
                      fontSize: '0.75rem',
                      color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                      fontWeight: 500,
                      mb: 2,
                    }}
                  >
                    最后检查: {task.last_check ? new Date(task.last_check).toLocaleString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '未检查'}
                  </Typography>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography
                      variant="body1"
                      fontWeight="700"
                      sx={{
                        background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: '1.1rem',
                      }}
                    >
                      ¥{task.price_threshold}
                    </Typography>
                    <Box display="flex" gap={0.5}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        sx={{
                          ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                          borderRadius: '8px',
                          width: 32,
                          height: 32,
                          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            color: '#1976d2',
                            boxShadow: isDark
                              ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(task.id, task.is_active);
                        }}
                        sx={{
                          ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                          borderRadius: '8px',
                          width: 32,
                          height: 32,
                          color: task.is_active ? '#f57c00' : '#2e7d32',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: isDark
                              ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                          },
                        }}
                      >
                        {task.is_active ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task);
                        }}
                        sx={{
                          ...createAppleGlass('tertiary', isDark ? 'dark' : 'light'),
                          borderRadius: '8px',
                          width: 32,
                          height: 32,
                          color: '#d32f2f',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: isDark
                              ? '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              : '0 4px 12px rgba(31, 38, 135, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )) : (
            <Grid item xs={12}>
              <Box
                textAlign="center"
                py={6}
                sx={{
                  ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                  borderRadius: '16px',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                    fontWeight: 500,
                  }}
                >
                  任务数据格式错误
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
});

MonitorTaskList.displayName = 'MonitorTaskList';

export default MonitorTaskList;