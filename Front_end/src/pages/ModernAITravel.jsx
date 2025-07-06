import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  Fade,
  Grow,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Stack,
  IconButton
} from '@mui/material';
import {
  SmartToy,
  AutoAwesome,
  Psychology,
  Rocket,
  CheckCircle,
  PlayArrow,
  TrendingUp,
  Speed,
  Security
} from '@mui/icons-material';
import StructuredTravelPlanner from '../components/StructuredTravelPlanner.jsx';
// 移除了不再使用的组件导入
import {
  PerformanceMonitor,
  checkBrowserCompatibility,
  detectDevicePerformance,
  setupErrorMonitoring,
  throttle
} from '../utils/performanceOptimizer.js';

const ModernAITravel = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  // 移除showPlanner状态和mcpStatus状态，直接显示表单
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 移除fetchMcpStatus调用

    // 第六阶段：性能优化与测试
    // 初始化性能监控
    const performanceMonitor = new PerformanceMonitor();
    setupErrorMonitoring();

    // 检测浏览器兼容性和设备性能
    checkBrowserCompatibility();
    const devicePerf = detectDevicePerformance();

    // 根据设备性能调整加载时间
    const loadTime = devicePerf.level === 'low' ? 2000 : 1200;
    setTimeout(() => {
      setLoading(false);
    }, loadTime);

    // 第五阶段：交互体验增强
    // 鼠标跟踪效果（节流优化）
    const handleMouseMove = throttle((e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }, 16); // 60fps

    // 键盘快捷键
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K 快速聚焦搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // 这里可以添加快速搜索功能
      }
      // ESC 键关闭模态框（已移除）
      if (e.key === 'Escape') {
        // 不再需要关闭模态框
      }
    };

    // 滚动监听（节流优化）
    const handleScroll = throttle(() => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > 100);
    }, 100);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      performanceMonitor.cleanup();
    };
  }, []);

  // 移除了fetchMcpStatus函数

  // 第一阶段：现代化英雄区域
  const renderHeroSection = () => (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.1)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
          ${alpha(theme.palette.info.main, 0.1)} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* 左侧内容 */}
          <Grid item xs={12} md={6}>
            <Fade in={!loading} timeout={1000}>
              <Box>
                {/* 标签 */}
                <Chip
                  icon={<AutoAwesome />}
                  label="AI 驱动的智能规划"
                  sx={{
                    mb: 3,
                    px: 2,
                    py: 1,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />

                {/* 主标题 */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    mb: 3,
                    background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  重新定义
                  <br />
                  <Box component="span" sx={{ color: theme.palette.primary.main }}>
                    旅行规划
                  </Box>
                </Typography>

                {/* 副标题 */}
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{
                    mb: 4,
                    lineHeight: 1.6,
                    fontWeight: 400,
                    maxWidth: 500
                  }}
                >
                  基于AI的智能旅行助手，整合多数据源，为您量身定制完美的旅行体验
                </Typography>

                {/* 特性标签 */}
                <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={<Psychology />}
                    label="AI智能分析"
                    variant="outlined"
                    sx={{ borderRadius: 3 }}
                  />
                  <Chip
                    icon={<Speed />}
                    label="秒级生成"
                    variant="outlined"
                    sx={{ borderRadius: 3 }}
                  />
                  <Chip
                    icon={<Security />}
                    label="数据安全"
                    variant="outlined"
                    sx={{ borderRadius: 3 }}
                  />
                </Stack>

                {/* 行动按钮 */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Rocket />}
                    onClick={() => {
                      // 滚动到表单区域
                      const plannerElement = document.querySelector('#travel-planner-form');
                      if (plannerElement) {
                        plannerElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    立即开始规划
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    观看演示
                  </Button>
                </Stack>
              </Box>
            </Fade>
          </Grid>

          {/* 右侧视觉元素 */}
          <Grid item xs={12} md={6}>
            <Grow in={!loading} timeout={1200}>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                {/* 主要图标 */}
                <Avatar
                  sx={{
                    width: { xs: 200, md: 280 },
                    height: { xs: 200, md: 280 },
                    mx: 'auto',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    fontSize: { xs: '4rem', md: '6rem' },
                    boxShadow: `0 20px 60px ${alpha(theme.palette.primary.main, 0.3)}`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -10,
                      left: -10,
                      right: -10,
                      bottom: -10,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                      borderRadius: '50%',
                      zIndex: -1,
                      animation: 'pulse 2s infinite'
                    }
                  }}
                >
                  🤖
                </Avatar>

                {/* 浮动元素 */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    right: '10%',
                    animation: 'float 3s ease-in-out infinite'
                  }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircle color="success" />
                      <Typography variant="body2" fontWeight={600}>
                        AI 已就绪
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '10%',
                    animation: 'float 3s ease-in-out infinite 1s'
                  }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUp color="info" />
                      <Typography variant="body2" fontWeight={600}>
                        智能分析
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Grow>
          </Grid>
        </Grid>
      </Container>

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
            ${alpha(theme.palette.info.main, 0.1)} 100%)`
        }}
      >
        <Box textAlign="center">
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              animation: 'pulse 1.5s infinite'
            }}
          >
            <SmartToy sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Typography variant="h6" color="text.secondary">
            AI 正在初始化...
          </Typography>
        </Box>
      </Box>
    );
  }

  // 移除了功能特性展示区域

  // 移除了系统状态仪表板

  // 第五阶段：交互体验增强组件
  const renderEnhancedInteractions = () => (
    <>
      {/* 鼠标跟踪光标效果 */}
      <Box
        sx={{
          position: 'fixed',
          left: mousePosition.x - 10,
          top: mousePosition.y - 10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'all 0.1s ease',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* 浮动回到顶部按钮 */}
      <Fade in={isVisible}>
        <IconButton
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 56,
            height: 56,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
            zIndex: 1000,
            '&:hover': {
              transform: 'translateY(-4px) scale(1.1)',
              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          aria-label="回到顶部"
        >
          <Rocket />
        </IconButton>
      </Fade>

      {/* 键盘快捷键提示 */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 32,
          left: 32,
          zIndex: 1000
        }}
      >
        <Fade in={isVisible}>
          <Paper
            elevation={8}
            sx={{
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              💡 快捷键提示
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Ctrl/Cmd + K: 快速搜索
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              ESC: 关闭弹窗
            </Typography>
          </Paper>
        </Fade>
      </Box>

      {/* 页面加载进度条 */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            zIndex: 10000,
            animation: 'loading-bar 2s ease-in-out infinite'
          }}
        />
      )}

      {/* CSS动画定义 */}
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px ${alpha(theme.palette.primary.main, 0.3)};
          }
          50% {
            box-shadow: 0 0 40px ${alpha(theme.palette.primary.main, 0.6)};
          }
        }

        @keyframes float-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {renderEnhancedInteractions()}

      {renderHeroSection()}

      {/* 直接显示结构化旅行计划表单 */}
      <Container maxWidth="xl" sx={{ py: 6 }} id="travel-planner-form">
        <StructuredTravelPlanner />
      </Container>
    </Box>
  );
};

export default ModernAITravel;
