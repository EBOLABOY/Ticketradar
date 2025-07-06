import React, { useState, useEffect, useCallback } from 'react';
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
  Paper,
  CircularProgress,
  Snackbar,
  Divider,
  Stack,
  Autocomplete
} from '@mui/material';
import {
  TravelExplore,
  Restaurant,
  LocalAtm
} from '@mui/icons-material';
import { aiApi, apiUtils } from '../services/backendApi';
import MarkdownRenderer from './Common/MarkdownRenderer';

const StructuredTravelPlanner = () => {
  const [formData, setFormData] = useState({
    // 基本信息
    destination: '',
    originCity: '',
    departDate: '',
    returnDate: '',
    days: 3,
    peopleCount: 1,

    // 预算
    budgetRange: 'medium',

    // 旅行偏好 - 简化为核心选项
    travelType: '休闲度假',
    travelStyle: '悠闲节奏',

    // 其他信息
    otherInfo: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [planResult, setPlanResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [formErrors, setFormErrors] = useState({});

  // 简化的选项配置
  const options = {
    budgetRanges: [
      { value: 'ultra-budget', label: '💸 超经济', desc: '< 1500元/人', icon: '💸', detail: '青旅、街边小吃、公共交通' },
      { value: 'budget', label: '💰 经济型', desc: '1500-3000元/人', icon: '💰', detail: '经济酒店、当地餐厅、地铁出行' },
      { value: 'medium', label: '💎 舒适型', desc: '3000-6000元/人', icon: '💎', detail: '三星酒店、品质餐厅、打车出行' },
      { value: 'premium', label: '🌟 高端型', desc: '6000-10000元/人', icon: '🌟', detail: '四星酒店、精品餐厅、专车服务' },
      { value: 'luxury', label: '👑 豪华型', desc: '10000-20000元/人', icon: '👑', detail: '五星酒店、米其林餐厅、私人定制' },
      { value: 'ultra-luxury', label: '💎 奢华型', desc: '> 20000元/人', icon: '💎', detail: '顶级度假村、私人飞机、管家服务' }
    ],
    travelTypes: [
      { value: '休闲度假', icon: '🏖️', desc: '放松身心，享受慢生活' },
      { value: '文化探索', icon: '🏛️', desc: '深度体验当地文化历史' },
      { value: '美食之旅', icon: '🍜', desc: '品尝地道美食小吃' },
      { value: '自然风光', icon: '🏔️', desc: '欣赏自然美景' },
      { value: '购物天堂', icon: '🛍️', desc: '购物血拼，买买买' },
      { value: '冒险刺激', icon: '🎢', desc: '挑战极限运动' }
    ],
    travelStyles: [
      { value: '悠闲节奏', icon: '🐌', desc: '慢慢游，深度体验' },
      { value: '紧凑行程', icon: '⚡', desc: '充实安排，不浪费时间' },
      { value: '混合安排', icon: '⚖️', desc: '张弛有度，平衡安排' }
    ],
    popularDestinations: [
      '东京', '首尔', '曼谷', '新加坡', '巴黎', '伦敦', '纽约', '洛杉矶',
      '悉尼', '墨尔本', '迪拜', '马尔代夫', '巴厘岛', '普吉岛', '济州岛', '冲绳'
    ]
  };

  useEffect(() => {
    fetchUserLocation();
    setDefaultDates();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const response = await aiApi.getUserLocation();
      if (response.success) {
        setFormData(prev => ({ ...prev, originCity: response.suggested_city }));
      }
    } catch (error) {
      console.error('获取位置失败:', error);
      // 设置默认出发城市
      setFormData(prev => ({ ...prev, originCity: '北京' }));
    }
  };

  const setDefaultDates = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const returnDate = new Date(nextWeek);
    returnDate.setDate(nextWeek.getDate() + 3);

    setFormData(prev => ({
      ...prev,
      departDate: nextWeek.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0]
    }));
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // 自动计算天数
    if (field === 'departDate' || field === 'returnDate') {
      const departDate = field === 'departDate' ? value : formData.departDate;
      const returnDate = field === 'returnDate' ? value : formData.returnDate;

      if (departDate && returnDate) {
        const depart = new Date(departDate);
        const returnD = new Date(returnDate);
        const diffTime = Math.abs(returnD - depart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays <= 30) {
          setFormData(prev => ({ ...prev, days: diffDays }));
        }
      }
    }
  };



  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const validateForm = () => {
    const errors = {};

    // 必填字段验证
    if (!formData.destination.trim()) {
      errors.destination = '请输入目的地';
    }

    if (!formData.budgetRange) {
      errors.budgetRange = '请选择预算范围';
    }

    // 日期验证
    if (formData.departDate && formData.returnDate) {
      const departDate = new Date(formData.departDate);
      const returnDate = new Date(formData.returnDate);
      if (returnDate <= departDate) {
        errors.returnDate = '返程日期必须晚于出发日期';
      }
    }

    // 人数验证
    if (formData.peopleCount < 1 || formData.peopleCount > 20) {
      errors.peopleCount = '人数必须在1-20之间';
    }

    // 天数验证
    if (formData.days < 1 || formData.days > 30) {
      errors.days = '旅行天数必须在1-30之间';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      showSnackbar('请检查表单中的错误信息', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setLoadingProgress(0);
    setLoadingStage('正在准备数据...');

    try {
      const token = localStorage.getItem('authToken');

      // 检查用户是否已登录
      if (!token) {
        showSnackbar('请先登录后再使用AI旅行规划功能', 'warning');
        setLoading(false);
        return;
      }

      // 模拟进度更新
      const progressStages = [
        { progress: 20, stage: '正在收集目的地信息...' },
        { progress: 40, stage: '正在搜索航班和酒店...' },
        { progress: 60, stage: '正在获取景点和餐厅推荐...' },
        { progress: 80, stage: '正在生成个性化旅行计划...' },
        { progress: 95, stage: '正在保存计划...' }
      ];

      // 构建提交数据
      const submitData = {
        ...formData,
        title: `${formData.destination}${formData.days}日游`,
        form_data: formData  // 保存完整的表单数据
      };

      // 启动进度模拟
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const nextStage = progressStages.find(stage => stage.progress > prev);
          if (nextStage) {
            setLoadingStage(nextStage.stage);
            return nextStage.progress;
          }
          return prev;
        });
      }, 1000);

      const response = await aiApi.generateTravelPlan(submitData);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingStage('完成！');

      if (response.success) {
        console.log('旅行规划API响应数据:', response);
        console.log('设置的planResult:', response.data);
        setPlanResult(response.data);
        setActiveTab(1);
        showSnackbar('旅行规划生成成功！', 'success');
      } else {
        console.error('旅行规划生成失败:', response);
        showSnackbar(response.message || '生成失败', 'error');
      }
    } catch (error) {
      console.error('生成旅行规划失败:', error);
      const errorInfo = apiUtils.handleApiError(error);

      if (errorInfo.status === 401) {
        showSnackbar('登录已过期，请重新登录', 'warning');
        // 清除过期的token
        localStorage.removeItem('authToken');
        // 可以在这里跳转到登录页面
        // window.location.href = '/login';
      } else if (errorInfo.status === 429) {
        showSnackbar('今日AI使用次数已达上限，请明天再试', 'warning');
      } else {
        showSnackbar(errorInfo.message || '生成失败，请重试', 'error');
      }
    } finally {
      setLoading(false);
      setLoadingProgress(0);
      setLoadingStage('');
    }
  };

  // 渲染预算和偏好选择
  const renderBudgetAndPreferences = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <LocalAtm sx={{ mr: 1, color: 'primary.main' }} />
        预算与偏好设置
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {/* 预算范围下拉选择 */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <FormControl fullWidth required error={!!formErrors.budgetRange} sx={{ flex: 1 }}>
              <InputLabel>💰 预算范围</InputLabel>
              <Select
                value={formData.budgetRange}
                onChange={handleInputChange('budgetRange')}
                label="💰 预算范围"
                sx={{ minHeight: 56 }}
              >
                {options.budgetRanges.map((budget) => (
                  <MenuItem key={budget.value} value={budget.value} sx={{ py: 1 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ mr: 1.5, fontSize: '1.1rem' }}>
                          {budget.icon}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
                          {budget.label.replace(/^[^\s]+ /, '')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {budget.desc}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', ml: 3 }}>
                        {budget.detail}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* 固定高度的错误信息区域 */}
            <Box sx={{ minHeight: 20, mt: 0.5 }}>
              {formErrors.budgetRange && (
                <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>
                  {formErrors.budgetRange}
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* 旅行类型下拉选择 */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel>🎯 旅行类型</InputLabel>
              <Select
                value={formData.travelType}
                onChange={handleInputChange('travelType')}
                label="🎯 旅行类型"
                sx={{ minHeight: 56 }}
              >
                {options.travelTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value} sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ mr: 1.5, fontSize: '1.1rem' }}>
                        {type.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {type.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {type.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* 占位区域，保持高度一致 */}
            <Box sx={{ minHeight: 20, mt: 0.5 }}></Box>
          </Box>
        </Grid>

        {/* 旅行风格下拉选择 */}
        <Grid item xs={12} md={4}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel>⚡ 旅行风格</InputLabel>
              <Select
                value={formData.travelStyle}
                onChange={handleInputChange('travelStyle')}
                label="⚡ 旅行风格"
                sx={{ minHeight: 56 }}
              >
                {options.travelStyles.map((style) => (
                  <MenuItem key={style.value} value={style.value} sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ mr: 1.5, fontSize: '1.3rem' }}>
                        {style.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {style.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {style.desc}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* 占位区域，保持高度一致 */}
            <Box sx={{ minHeight: 20, mt: 0.5 }}></Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  // 渲染基本信息表单
  const renderBasicInfo = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TravelExplore sx={{ mr: 1, color: 'primary.main' }} />
        基本旅行信息
      </Typography>

      <Grid container spacing={3} alignItems="flex-start">
        {/* 第一行：目的地和出发城市 */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            freeSolo
            options={options.popularDestinations}
            value={formData.destination}
            onChange={(event, newValue) => {
              setFormData(prev => ({ ...prev, destination: newValue || '' }));
            }}
            onInputChange={(event, newInputValue) => {
              setFormData(prev => ({ ...prev, destination: newInputValue }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="🎯 目的地"
                placeholder="输入或选择目的地"
                required
                error={!!formErrors.destination}
                helperText={formErrors.destination || '支持自动补全热门目的地'}
                sx={{ minHeight: 56 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="✈️ 出发城市"
            value={formData.originCity}
            onChange={handleInputChange('originCity')}
            placeholder="自动检测您的位置"
            sx={{ minHeight: 56 }}
          />
        </Grid>

        {/* 第二行：日期、天数、人数 */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="📅 出发日期"
            type="date"
            value={formData.departDate}
            onChange={handleInputChange('departDate')}
            InputLabelProps={{ shrink: true }}
            sx={{ minHeight: 56 }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="🔄 返程日期"
            type="date"
            value={formData.returnDate}
            onChange={handleInputChange('returnDate')}
            error={!!formErrors.returnDate}
            helperText={formErrors.returnDate}
            InputLabelProps={{ shrink: true }}
            sx={{ minHeight: 56 }}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            label="📊 天数"
            type="number"
            value={formData.days}
            onChange={handleInputChange('days')}
            error={!!formErrors.days}
            helperText={formErrors.days}
            inputProps={{ min: 1, max: 30 }}
            sx={{ minHeight: 56 }}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            label="👥 人数"
            type="number"
            value={formData.peopleCount}
            onChange={handleInputChange('peopleCount')}
            error={!!formErrors.peopleCount}
            helperText={formErrors.peopleCount}
            inputProps={{ min: 1, max: 20 }}
            sx={{ minHeight: 56 }}
          />
        </Grid>
      </Grid>
    </Box>
  );





  // 渲染其他需求输入框
  const renderOtherInfo = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Restaurant sx={{ mr: 1, color: 'primary.main' }} />
        特殊需求 (可选)
      </Typography>
      <Grid container>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="📝 其他特殊需求"
            multiline
            rows={4}
            value={formData.otherInfo}
            onChange={handleInputChange('otherInfo')}
            placeholder="请描述您的特殊需求，如：饮食限制、无障碍需求、特殊兴趣、语言偏好等..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );



  const renderForm = () => (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* 标题区域 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
            ✈️ AI智能旅行规划
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            简单填写，即可获得专属的个性化旅行计划
          </Typography>
          <Divider sx={{ mx: 'auto', width: '60%' }} />
        </Box>

        {/* 表单内容 */}
        <Stack spacing={4}>
          {renderBasicInfo()}
          {renderBudgetAndPreferences()}
          {renderOtherInfo()}
        </Stack>

        {/* 加载状态 */}
        {loading && (
          <Box sx={{ mb: 4, mt: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <CircularProgress size={24} sx={{ mr: 2, color: 'inherit' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {loadingStage}
                </Typography>
              </Box>
              <Box sx={{ width: '100%' }}>
                <Box
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: 6,
                      bgcolor: 'white',
                      width: `${loadingProgress}%`,
                      transition: 'width 0.5s ease'
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'right', opacity: 0.9 }}>
                  {loadingProgress}%
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        {/* 提交按钮 */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            height: 64,
            fontSize: '1.2rem',
            fontWeight: 600,
            borderRadius: 3,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .3)'
            },
            '&:disabled': {
              background: 'grey.400'
            }
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={28} sx={{ mr: 2, color: 'white' }} />
              正在生成专属旅行计划...
            </>
          ) : (
            <>
              🚀 生成AI旅行计划
            </>
          )}
        </Button>

        {/* 提示信息 */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            💡 我们会根据您的偏好，结合实时数据为您生成最优旅行方案
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const renderPlanResult = useCallback(() => {
    if (!planResult) {
      return null;
    }

    // 适配后端返回的数据结构
    const plan = planResult.travel_plan || planResult.plan;
    const data_sources = planResult.data_sources || {
      xiaohongshu: planResult.has_real_data,
      amap: false,
      weather: false
    };
    const generated_at = planResult.generation_time || planResult.generated_at || '刚刚';
    const share_url = planResult.share_url;

    // 如果没有计划内容，显示错误信息
    if (!plan) {
      console.error('没有找到旅行规划内容');
      return (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" color="error">
              ❌ 旅行规划内容缺失
            </Typography>
            <Typography variant="body2" color="text.secondary">
              后端返回的数据中没有找到旅行规划内容。
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              调试信息：{JSON.stringify(planResult, null, 2)}
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              🎯 您的专属旅行规划
            </Typography>
            {share_url && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(share_url);
                  showSnackbar('分享链接已复制到剪贴板', 'success');
                }}
              >
                📋 复制分享链接
              </Button>
            )}
          </Box>

          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              生成时间: {generated_at}
            </Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              <Chip
                label={`小红书: ${data_sources?.xiaohongshu ? '已使用' : '未使用'}`}
                color={data_sources?.xiaohongshu ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={`高德地图: ${data_sources?.amap ? '已使用' : '未使用'}`}
                color={data_sources?.amap ? 'success' : 'default'}
                size="small"
              />
              <Chip
                label={`和风天气: ${data_sources?.weather ? '已使用' : '未使用'}`}
                color={data_sources?.weather ? 'success' : 'default'}
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

          <Box mt={2} display="flex" gap={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => {
                // 保存到我的计划
                showSnackbar('计划已保存到我的旅行计划', 'success');
              }}
            >
              💾 保存计划
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                // 重新生成
                setActiveTab(0);
                setPlanResult(null);
              }}
            >
              🔄 重新生成
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }, [planResult, setActiveTab, setPlanResult]);

  return (
    <Box sx={{
      minHeight: '100vh',
      pb: { xs: 2, sm: 4 },
      px: { xs: 1, sm: 2 },
      bgcolor: 'grey.50'
    }}>
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            fontSize: { xs: '0.875rem', sm: '1rem' },
            minWidth: { xs: 120, sm: 160 },
            fontWeight: 600
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 1.5
          }
        }}
        variant={window.innerWidth < 600 ? "fullWidth" : "standard"}
      >
        <Tab
          label="📝 填写表单"
          sx={{
            color: activeTab === 0 ? 'primary.main' : 'text.secondary'
          }}
        />
        <Tab
          label="📋 查看计划"
          disabled={!planResult}
          sx={{
            color: activeTab === 1 ? 'primary.main' : 'text.secondary'
          }}
        />
      </Tabs>

      {activeTab === 0 && renderForm()}
      {activeTab === 1 && renderPlanResult()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: window.innerWidth < 600 ? 'center' : 'left'
        }}
      />
    </Box>
  );
};

export default StructuredTravelPlanner;
