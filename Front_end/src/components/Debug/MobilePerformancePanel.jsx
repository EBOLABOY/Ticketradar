import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Speed,
  NetworkCheck,
  ExpandMore,
  ExpandLess,
  Close,
  Refresh
} from '@mui/icons-material';

import { useMobile, useMobilePerformance } from '../../hooks/useMobile';
import { performanceMonitor, memoryManager } from '../../utils/mobilePerformanceOptimizer';
import { networkStatusManager } from '../../utils/pwaUtils';
import { createAppleGlass } from '../../utils/glassmorphism';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

/**
 * 移动端性能监控面板
 * 仅在开发环境下显示
 */
const MobilePerformancePanel = ({ onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const [performanceData, setPerformanceData] = useState({});
  const [memoryData, setMemoryData] = useState({});
  const [networkData, setNetworkData] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { 
    isMobile, 
    isTablet, 
    viewport, 
    performanceLevel, 
    isSmallScreen 
  } = useMobile();
  
  const { 
    shouldReduceAnimations, 
    shouldReduceEffects
  } = useMobilePerformance();
  
  const { isDarkMode, theme: themeMode } = useCustomTheme();

  // 更新性能数据
  const updatePerformanceData = () => {
    // 获取性能报告
    const report = performanceMonitor.getPerformanceReport();
    setPerformanceData(report);

    // 获取内存使用情况
    const memory = memoryManager.getMemoryUsage();
    setMemoryData(memory);

    // 获取网络状态
    const network = {
      isOnline: networkStatusManager.isOnline,
      connectionType: networkStatusManager.connectionType,
      isSlowConnection: networkStatusManager.isSlowConnection()
    };
    setNetworkData(network);
  };

  // 自动刷新
  useEffect(() => {
    updatePerformanceData();

    if (autoRefresh) {
      const interval = setInterval(updatePerformanceData, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // 创建玻璃效果样式
  const createGlassPanel = () => {
    const baseGlass = createAppleGlass('secondary', themeMode);
    return {
      ...baseGlass,
      borderRadius: 2,
      backdropFilter: 'blur(20px)',
      border: isDarkMode 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(0, 0, 0, 0.1)'
    };
  };

  // 获取性能等级颜色
  const getPerformanceColor = (level) => {
    switch (level) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  // 获取网络状态颜色
  const getNetworkColor = () => {
    if (!networkData.isOnline) return 'error';
    if (networkData.isSlowConnection) return 'warning';
    return 'success';
  };

  // 如果不是开发环境，不显示面板
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        width: expanded ? 320 : 200,
        maxHeight: expanded ? '80vh' : 'auto',
        overflow: 'auto',
        zIndex: 9999,
        ...createGlassPanel()
      }}
      elevation={8}
    >
      {/* 面板头部 */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Speed color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            性能监控
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              updatePerformanceData();
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
          >
            <Close fontSize="small" />
          </IconButton>
          
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* 基础信息（始终显示） */}
      <Box sx={{ px: 2, pb: expanded ? 1 : 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Chip
              label={isMobile ? '移动端' : '桌面端'}
              size="small"
              color={isMobile ? 'primary' : 'default'}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <Chip
              label={performanceLevel}
              size="small"
              color={getPerformanceColor(performanceLevel)}
              variant="filled"
            />
          </Grid>
        </Grid>
      </Box>

      {/* 详细信息（展开时显示） */}
      <Collapse in={expanded}>
        <Divider />
        
        <Box sx={{ p: 2 }}>
          {/* 自动刷新开关 */}
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                size="small"
              />
            }
            label="自动刷新"
            sx={{ mb: 2 }}
          />

          {/* 设备信息 */}
          <Typography variant="subtitle2" gutterBottom>
            设备信息
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="屏幕尺寸"
                secondary={`${viewport.width} × ${viewport.height}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="设备类型"
                secondary={isTablet ? '平板' : isMobile ? '手机' : '桌面'}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="小屏模式"
                secondary={isSmallScreen ? '是' : '否'}
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* 性能优化状态 */}
          <Typography variant="subtitle2" gutterBottom>
            优化状态
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="减少动画"
                secondary={shouldReduceAnimations ? '已启用' : '未启用'}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="减少特效"
                secondary={shouldReduceEffects ? '已启用' : '未启用'}
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          {/* 内存使用情况 */}
          <Typography variant="subtitle2" gutterBottom>
            内存使用
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption">
                缓存: {memoryData.cacheSize}/{memoryData.maxCacheSize}
              </Typography>
              <Typography variant="caption">
                {memoryData.usage}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={parseFloat(memoryData.usage) || 0}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* 性能指标 */}
          {performanceData.averageRenderTime && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                性能指标
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="平均渲染时间"
                    secondary={performanceData.averageRenderTime}
                  />
                </ListItem>
                {performanceData.currentMemoryUsage && (
                  <ListItem>
                    <ListItemText
                      primary="内存使用"
                      secondary={performanceData.currentMemoryUsage.used}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemText
                    primary="网络请求"
                    secondary={`${performanceData.networkRequestsCount} 个`}
                  />
                </ListItem>
              </List>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* 网络状态 */}
          <Typography variant="subtitle2" gutterBottom>
            网络状态
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <NetworkCheck 
              color={getNetworkColor()} 
              fontSize="small" 
            />
            <Chip
              label={networkData.isOnline ? '在线' : '离线'}
              size="small"
              color={getNetworkColor()}
              variant="filled"
            />
          </Box>
          
          {networkData.connectionType && (
            <List dense>
              <ListItem>
                <ListItemText
                  primary="连接类型"
                  secondary={networkData.connectionType.effectiveType?.toUpperCase()}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="下载速度"
                  secondary={`${networkData.connectionType.downlink} Mbps`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="延迟"
                  secondary={`${networkData.connectionType.rtt} ms`}
                />
              </ListItem>
              {networkData.connectionType.saveData && (
                <ListItem>
                  <ListItemText
                    primary="省流量模式"
                    secondary="已启用"
                  />
                </ListItem>
              )}
            </List>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MobilePerformancePanel;
