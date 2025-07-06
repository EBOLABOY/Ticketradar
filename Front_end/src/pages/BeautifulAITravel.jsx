import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Fade,
  Grow,
  Avatar,
  LinearProgress,
  Skeleton,
  Chip,
  IconButton,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  SmartToy,
  TravelExplore,
  AutoAwesome,
  Explore,
  Map,
  WbSunny,
  Psychology,
  Timeline,
  TipsAndUpdates,
  Rocket,
  CheckCircle,
  Error,
  Warning,
  PlayArrow,
  Star,
  Favorite,
  Share,
  MoreVert
} from '@mui/icons-material';
import EnhancedTravelPlanner from '../components/EnhancedTravelPlanner.jsx';

const BeautifulAITravel = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [mcpStatus, setMcpStatus] = useState({});
  const [showPlanner, setShowPlanner] = useState(false);

  useEffect(() => {
    fetchMcpStatus();
    // 模拟加载动画
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const fetchMcpStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/travel/api/mcp-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setMcpStatus(data.data);
      }
    } catch (error) {
      console.error('获取MCP状态失败:', error);
    }
  };

  const getServiceStatusIcon = (status) => {
    if (status.running) {
      return <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} />;
    } else if (status.enabled) {
      return <Warning sx={{ color: 'warning.main', fontSize: 16 }} />;
    } else {
      return <Error sx={{ color: 'error.main', fontSize: 16 }} />;
    }
  };

  const getServiceStatusColor = (status) => {
    if (status.running) return 'success';
    if (status.enabled) return 'warning';
    return 'error';
  };

  // 渐变背景样式
  const gradientBg = {
    background: `linear-gradient(135deg, 
      ${alpha(theme.palette.primary.main, 0.1)} 0%, 
      ${alpha(theme.palette.secondary.main, 0.1)} 50%, 
      ${alpha(theme.palette.info.main, 0.1)} 100%)`,
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden'
  };

  // 装饰性背景元素
  const decorativeElements = (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.success.main, 0.1)})`,
          filter: 'blur(30px)',
          zIndex: 0
        }}
      />
    </>
  );

  // 英雄区域
  const renderHeroSection = () => (
    <Fade in={!loading} timeout={1000}>
      <Box sx={{ textAlign: 'center', mb: 6, position: 'relative', zIndex: 1 }}>
        <Grow in={!loading} timeout={1200}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              fontSize: '3rem'
            }}
          >
            🤖
          </Avatar>
        </Grow>
        
        <Typography 
          variant="h2" 
          fontWeight="700" 
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          AI 旅行规划师
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
        >
          基于多数据源的智能旅行规划系统，为您提供个性化的旅行建议
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Rocket />}
            onClick={() => setShowPlanner(true)}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              transition: 'all 0.3s ease'
            }}
          >
            开始规划旅行
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<PlayArrow />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            观看演示
          </Button>
        </Box>
      </Box>
    </Fade>
  );

  // 特性卡片
  const renderFeatureCards = () => {
    const features = [
      {
        icon: <Psychology />,
        title: 'AI智能规划',
        description: '基于大语言模型的智能行程规划',
        color: theme.palette.primary.main,
        delay: 200
      },
      {
        icon: <Explore />,
        title: '真实用户体验',
        description: '整合小红书真实用户旅行笔记',
        color: theme.palette.secondary.main,
        delay: 400
      },
      {
        icon: <Map />,
        title: '精准POI推荐',
        description: '基于高德地图的景点餐厅推荐',
        color: theme.palette.success.main,
        delay: 600
      },
      {
        icon: <WbSunny />,
        title: '实时天气信息',
        description: '和风天气提供的准确天气预报',
        color: theme.palette.info.main,
        delay: 800
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Grow in={!loading} timeout={1000} style={{ transitionDelay: `${feature.delay}ms` }}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  border: 'none',
                  background: `linear-gradient(135deg, ${alpha(feature.color, 0.1)}, ${alpha(feature.color, 0.05)})`,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${alpha(feature.color, 0.2)}`,
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: feature.color,
                    color: 'white'
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>
    );
  };

  // 系统状态卡片
  const renderSystemStatus = () => (
    <Fade in={!loading} timeout={1000} style={{ transitionDelay: '1000ms' }}>
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ backgroundColor: theme.palette.info.main }}>
              <AutoAwesome />
            </Avatar>
            <Typography variant="h5" fontWeight="600">
              系统状态
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {Object.entries(mcpStatus).map(([serviceName, status]) => (
              <Grid item xs={12} sm={6} md={4} key={serviceName}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `2px solid ${alpha(theme.palette[getServiceStatusColor(status)].main, 0.2)}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette[getServiceStatusColor(status)].main, 0.1)}, ${alpha(theme.palette[getServiceStatusColor(status)].main, 0.05)})`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${alpha(theme.palette[getServiceStatusColor(status)].main, 0.2)}`,
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {getServiceStatusIcon(status)}
                    <Typography variant="subtitle1" fontWeight="600">
                      {serviceName === 'xhs-mcp' && '小红书数据'}
                      {serviceName === 'amap-mcp' && '高德地图'}
                      {serviceName === 'weather-mcp' && '和风天气'}
                      {!['xhs-mcp', 'amap-mcp', 'weather-mcp'].includes(serviceName) && serviceName}
                    </Typography>
                  </Box>
                  <Chip
                    label={status.running ? '运行中' : status.enabled ? '已配置' : '未配置'}
                    color={getServiceStatusColor(status)}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  );

  if (loading) {
    return (
      <Box sx={gradientBg}>
        <Container maxWidth="xl" sx={{ pt: 8, pb: 4 }}>
          <Box textAlign="center" mb={6}>
            <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 3 }} />
            <Skeleton variant="text" width={400} height={60} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width={600} height={40} sx={{ mx: 'auto', mb: 4 }} />
            <Box display="flex" gap={2} justifyContent="center">
              <Skeleton variant="rounded" width={180} height={48} />
              <Skeleton variant="rounded" width={140} height={48} />
            </Box>
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Skeleton variant="rounded" height={200} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={gradientBg}>
      {decorativeElements}
      <Container maxWidth="xl" sx={{ pt: 8, pb: 4, position: 'relative', zIndex: 1 }}>
        {renderHeroSection()}
        {renderFeatureCards()}
        {renderSystemStatus()}
        
        {showPlanner && (
          <Fade in={showPlanner} timeout={500}>
            <Box>
              <EnhancedTravelPlanner />
            </Box>
          </Fade>
        )}
      </Container>
    </Box>
  );
};

export default BeautifulAITravel;
