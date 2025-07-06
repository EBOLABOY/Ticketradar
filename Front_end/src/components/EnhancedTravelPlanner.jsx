import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Grid,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
  Paper,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Person,
  AttachMoney,
  TravelExplore
} from '@mui/icons-material';
import { aiApi, apiUtils } from '../services/backendApi';
import MarkdownRenderer from './Common/MarkdownRenderer';

const EnhancedTravelPlanner = () => {
  const [formData, setFormData] = useState({
    destination: '',
    originCity: '',
    days: 3,
    peopleCount: 1,
    budget: '',
    travelType: '休闲',
    travelStyle: '',
    departDate: '',
    returnDate: '',
    otherInfo: '',
    userPreferences: ''
  });
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [mcpStatus, setMcpStatus] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchUserLocation();
    fetchMcpStatus();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const response = await aiApi.getUserLocation();
      if (response.success) {
        setFormData(prev => ({ ...prev, originCity: response.suggested_city }));
      }
    } catch (error) {
      console.error('获取位置失败:', error);
    }
  };

  const fetchMcpStatus = async () => {
    try {
      const response = await aiApi.getMcpStatus();
      if (response.success) {
        setMcpStatus(response.data);
      }
    } catch (error) {
      console.error('获取MCP状态失败:', error);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    if (!formData.destination) {
      showSnackbar('请输入目的地', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await aiApi.generateEnhancedTravelPlan(formData);

      if (response.success) {
        setPlanResult(response.data);
        setActiveTab(1);
        showSnackbar('旅行规划生成成功！', 'success');
      } else {
        showSnackbar(response.message || '生成失败', 'error');
      }
    } catch (error) {
      console.error('生成旅行规划失败:', error);
      const errorInfo = apiUtils.handleApiError(error);
      showSnackbar(errorInfo.message || '生成失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderMcpStatus = () => (
    <Alert severity="info" sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>数据源状态</Typography>
      <Box display="flex" gap={1} flexWrap="wrap">
        {Object.entries(mcpStatus).map(([service, status]) => (
          <Chip
            key={service}
            label={`${service}: ${status.running ? '可用' : '不可用'}`}
            color={status.running ? 'success' : 'error'}
            size="small"
          />
        ))}
      </Box>
    </Alert>
  );

  const renderForm = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <TravelExplore sx={{ mr: 1, verticalAlign: 'middle' }} />
          旅行规划表单
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="目的地"
              value={formData.destination}
              onChange={handleInputChange('destination')}
              required
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="出发城市"
              value={formData.originCity}
              onChange={handleInputChange('originCity')}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="旅行天数"
              type="number"
              value={formData.days}
              onChange={handleInputChange('days')}
              inputProps={{ min: 1, max: 30 }}
              InputProps={{
                startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="人数"
              type="number"
              value={formData.peopleCount}
              onChange={handleInputChange('peopleCount')}
              inputProps={{ min: 1, max: 20 }}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>预算范围</InputLabel>
              <Select
                value={formData.budget}
                onChange={handleInputChange('budget')}
                label="预算范围"
                startAdornment={<AttachMoney sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="budget">经济型 (&lt; 3000元)</MenuItem>
                <MenuItem value="medium">舒适型 (3000-8000元)</MenuItem>
                <MenuItem value="luxury">豪华型 (&gt; 8000元)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>旅行类型</InputLabel>
              <Select
                value={formData.travelType}
                onChange={handleInputChange('travelType')}
                label="旅行类型"
              >
                <MenuItem value="休闲">休闲度假</MenuItem>
                <MenuItem value="文化">文化探索</MenuItem>
                <MenuItem value="美食">美食之旅</MenuItem>
                <MenuItem value="购物">购物天堂</MenuItem>
                <MenuItem value="自然">自然风光</MenuItem>
                <MenuItem value="冒险">冒险刺激</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="个人偏好"
              multiline
              rows={3}
              value={formData.userPreferences}
              onChange={handleInputChange('userPreferences')}
              placeholder="请描述您的个人偏好，如：喜欢安静的地方、偏爱当地美食、希望体验传统文化、预算控制严格等..."
              helperText="AI将根据您的偏好定制专属旅行规划"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="其他需求"
              multiline
              rows={2}
              value={formData.otherInfo}
              onChange={handleInputChange('otherInfo')}
              placeholder="请描述您的特殊需求，如：无障碍设施、素食餐厅、亲子友好等..."
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ height: 56 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  正在生成规划...
                </>
              ) : (
                '🚀 生成AI旅行规划'
              )}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderPlanResult = () => {
    if (!planResult) return null;

    const { plan, data_sources, generated_at } = planResult;

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 您的专属旅行规划
          </Typography>
          
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              生成时间: {generated_at}
            </Typography>
            <Box display="flex" gap={1} mt={1}>
              <Chip 
                label={`小红书: ${data_sources.xiaohongshu ? '已使用' : '未使用'}`}
                color={data_sources.xiaohongshu ? 'success' : 'default'}
                size="small"
              />
              <Chip 
                label={`高德地图: ${data_sources.amap ? '已使用' : '未使用'}`}
                color={data_sources.amap ? 'success' : 'default'}
                size="small"
              />
              <Chip 
                label={`和风天气: ${data_sources.weather ? '已使用' : '未使用'}`}
                color={data_sources.weather ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            {typeof plan === 'string' ? (
              <MarkdownRenderer
                content={plan}
                sx={{
                  '& h1, & h2, & h3': {
                    color: 'primary.main'
                  }
                }}
              />
            ) : (
              <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(plan, null, 2)}
              </Typography>
            )}
          </Paper>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {renderMcpStatus()}
      
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2 }}>
        <Tab label="规划表单" />
        <Tab label="规划结果" disabled={!planResult} />
      </Tabs>

      {activeTab === 0 && renderForm()}
      {activeTab === 1 && renderPlanResult()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
};

export default EnhancedTravelPlanner;
