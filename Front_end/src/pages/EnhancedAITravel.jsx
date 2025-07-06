import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  Chip,
  Paper
} from '@mui/material';
import {
  SmartToy,
  TravelExplore,
  Settings,
  Assessment,
  CloudOutlined,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import EnhancedTravelPlanner from '../components/EnhancedTravelPlanner.jsx';

const EnhancedAITravel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [mcpStatus, setMcpStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMcpStatus();
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
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const getServiceStatusText = (status) => {
    if (status.running) return '运行中';
    if (status.enabled) return '已配置';
    return '未配置';
  };

  const getServiceStatusColor = (status) => {
    if (status.running) return 'success';
    if (status.enabled) return 'warning';
    return 'error';
  };

  const renderSystemStatus = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CloudOutlined color="primary" />
          <Typography variant="h6">系统状态</Typography>
        </Box>
        
        <Grid container spacing={2}>
          {Object.entries(mcpStatus).map(([serviceName, status]) => (
            <Grid item xs={12} sm={6} md={4} key={serviceName}>
              <Paper
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: `${getServiceStatusColor(status)}.main`,
                  borderRadius: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  {getServiceStatusIcon(status)}
                  <Typography variant="subtitle2" fontWeight="600">
                    {serviceName === 'xhs-mcp' && '小红书数据'}
                    {serviceName === 'amap-mcp' && '高德地图'}
                    {serviceName === 'weather-mcp' && '和风天气'}
                    {!['xhs-mcp', 'amap-mcp', 'weather-mcp'].includes(serviceName) && serviceName}
                  </Typography>
                </Box>
                <Chip
                  label={getServiceStatusText(status)}
                  color={getServiceStatusColor(status)}
                  size="small"
                  variant="outlined"
                />
              </Paper>
            </Grid>
          ))}
        </Grid>

        {Object.keys(mcpStatus).length === 0 && !loading && (
          <Alert severity="info">
            正在检查系统状态...
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderFeatureIntro = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🚀 增强版AI旅行规划师
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          基于多数据源的智能旅行规划系统，为您提供个性化的旅行建议。
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center" p={2}>
              <SmartToy sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="600">
                AI智能规划
              </Typography>
              <Typography variant="caption" color="text.secondary">
                基于大语言模型的智能行程规划
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center" p={2}>
              <TravelExplore sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="600">
                真实用户体验
              </Typography>
              <Typography variant="caption" color="text.secondary">
                整合小红书真实用户旅行笔记
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center" p={2}>
              <Assessment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="600">
                精准POI推荐
              </Typography>
              <Typography variant="caption" color="text.secondary">
                基于高德地图的景点餐厅推荐
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center" p={2}>
              <CloudOutlined sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="600">
                实时天气信息
              </Typography>
              <Typography variant="caption" color="text.secondary">
                和风天气提供的准确天气预报
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderUsageGuide = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📖 使用指南
        </Typography>
        
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            1. 填写旅行信息
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            输入目的地、出行日期、人数等基本信息，系统会自动检测您的位置作为出发城市。
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            2. 选择旅行偏好
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            选择预算范围、旅行类型和风格，帮助AI更好地理解您的需求。
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            3. 获取智能规划
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            系统将整合多个数据源，为您生成详细的旅行规划，包括景点推荐、美食指南、天气建议等。
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
            4. 查看详细信息
          </Typography>
          <Typography variant="body2" color="text.secondary">
            通过不同标签页查看景点推荐、美食指南、天气建议和真实用户体验分享。
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="600" gutterBottom>
          🤖 增强版AI旅行规划师
        </Typography>
        <Typography variant="body1" color="text.secondary">
          基于多数据源的智能旅行规划系统，为您提供个性化的旅行建议
        </Typography>
      </Box>

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label="智能规划" 
            icon={<SmartToy />} 
            iconPosition="start"
          />
          <Tab 
            label="系统状态" 
            icon={<Settings />} 
            iconPosition="start"
          />
          <Tab 
            label="使用指南" 
            icon={<Assessment />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 标签页内容 */}
      {activeTab === 0 && (
        <Box>
          {renderSystemStatus()}
          <EnhancedTravelPlanner />
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {renderSystemStatus()}
          {renderFeatureIntro()}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {renderUsageGuide()}
        </Box>
      )}
    </Container>
  );
};

export default EnhancedAITravel;
