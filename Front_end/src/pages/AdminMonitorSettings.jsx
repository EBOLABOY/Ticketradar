import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Paper
} from '@mui/material';
import {
  Settings,
  Save,
  Refresh,
  MonitorHeart,
  AccessTime,
  AttachMoney,
  FlightTakeoff,
  Dashboard as DashboardIcon,
  People,
  Assignment
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { adminMonitorApi } from '../services/backendApi';

const AdminMonitorSettings = () => {
  const { isAdmin, loading: userLoading, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    monitor_interval: 7,
    user_monitor_interval: 7,
    price_threshold: 1000,
    notification_cooldown: 24,
    departure_date: '2025-09-30',
    return_date: '2025-10-08'
  });
  const [status, setStatus] = useState(null);
  const [options, setOptions] = useState({
    check_interval_options: [5, 10, 15, 30, 60],
    price_threshold_options: [500, 800, 1000, 1500, 2000, 3000]
  });

  // 检查管理员权限和加载数据
  useEffect(() => {
    // 等待用户数据加载完成
    if (userLoading) {
      console.log('AdminMonitorSettings - 用户数据加载中...');
      return; // 用户数据还在加载中，等待
    }

    const checkPermissionAndLoad = async () => {
      // 调试信息
      console.log('AdminMonitorSettings - 权限检查:', {
        userLoading,
        user,
        isAdminResult: isAdmin(),
        userInfo: localStorage.getItem('userInfo'),
        authToken: localStorage.getItem('authToken')
      });

      if (!isAdmin()) {
        setError('您没有权限访问此页面');
        setLoading(false);
        return;
      }

      // 清除之前的错误信息
      setError(null);

      loadSettings();
      loadStatus();
    };

    checkPermissionAndLoad();
  }, [userLoading, user, isAdmin]); // 依赖用户加载状态、用户数据和权限检查函数

  const loadSettings = async () => {
    try {
      const response = await adminMonitorApi.getMonitorSettings();
      if (response.success) {
        setSettings(response.data);
        setOptions({
          check_interval_options: response.data.check_interval_options || [5, 10, 15, 30, 60],
          price_threshold_options: response.data.price_threshold_options || [500, 800, 1000, 1500, 2000, 3000]
        });
      } else {
        setError(response.error || '获取设置失败');
      }
    } catch (error) {
      console.error('获取设置失败:', error);
      // 如果API不可用，使用默认设置
      setSettings({
        monitor_interval: 7,
        user_monitor_interval: 7,
        price_threshold: 1000,
        notification_cooldown: 24,
        departure_date: '2025-09-30',
        return_date: '2025-10-08'
      });
      setOptions({
        check_interval_options: [5, 10, 15, 30, 60],
        price_threshold_options: [500, 800, 1000, 1500, 2000, 3000]
      });
      setError('API暂不可用，显示默认设置');
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await adminMonitorApi.getMonitorStatus();
      if (response.success && response.data) {
        setStatus(response.data);
      } else {
        console.error('获取监控状态失败:', response);
        setStatus(null);
      }
    } catch (error) {
      console.error('获取监控状态失败:', error);
      setStatus(null);
    }
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await adminMonitorApi.updateMonitorSettings(settings);

      if (response.success) {
        setSuccess('设置已保存成功！监控页面的日期将在下次刷新时更新。');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(response.error || '保存设置失败');
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      setError('保存设置失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadSettings();
    loadStatus();
  };

  // 如果用户数据还在加载中，显示加载状态
  if (userLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            正在验证权限...
          </Typography>
        </Box>
      </Container>
    );
  }

  // 用户数据加载完成后，检查权限
  if (!isAdmin()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          您没有权限访问此页面
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Settings sx={{ color: '#0d6efd' }} />
          监控系统管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理和配置机票监控系统的各项参数
        </Typography>
      </Box>

      {/* 错误和成功提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 系统状态 */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DashboardIcon sx={{ color: '#0d6efd' }} />
                系统状态
              </Typography>
              {status ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <People sx={{ fontSize: 40, color: '#28a745', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#28a745' }}>
                        {status.users.active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        活跃用户 / 总用户 {status.users.total}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Assignment sx={{ fontSize: 40, color: '#0d6efd', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#0d6efd' }}>
                        {status.tasks.active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        活跃任务 / 总任务 {status.tasks.total}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <MonitorHeart sx={{ fontSize: 40, color: '#dc3545', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 600, color: '#dc3545' }}>
                        {status.tasks.recent_active}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        24小时内活跃任务
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="body1" color="error">
                    无法获取系统状态数据，请检查网络连接或联系管理员
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 监控设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ color: '#0d6efd' }} />
                时间设置
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>主监控间隔（分钟）</InputLabel>
                  <Select
                    value={settings.monitor_interval}
                    label="主监控间隔（分钟）"
                    onChange={(e) => handleSettingChange('monitor_interval', e.target.value)}
                  >
                    {options.check_interval_options.map(option => (
                      <MenuItem key={option} value={option}>
                        {option} 分钟
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>用户监控间隔（分钟）</InputLabel>
                  <Select
                    value={settings.user_monitor_interval}
                    label="用户监控间隔（分钟）"
                    onChange={(e) => handleSettingChange('user_monitor_interval', e.target.value)}
                  >
                    {options.check_interval_options.map(option => (
                      <MenuItem key={option} value={option}>
                        {option} 分钟
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="通知冷却时间（小时）"
                  type="number"
                  value={settings.notification_cooldown}
                  onChange={(e) => handleSettingChange('notification_cooldown', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 168 }}
                  helperText="避免重复通知的间隔时间"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 日期设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlightTakeoff sx={{ color: '#0d6efd' }} />
                监控日期设置
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="出发日期"
                  type="date"
                  value={settings.departure_date}
                  onChange={(e) => handleSettingChange('departure_date', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="监控页面显示的出发日期"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="回程日期"
                  type="date"
                  value={settings.return_date}
                  onChange={(e) => handleSettingChange('return_date', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="监控页面显示的回程日期"
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  日期设置说明：
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 出发日期: <Chip label={settings.departure_date} size="small" />
                  </Typography>
                  <Typography variant="body2">
                    • 回程日期: <Chip label={settings.return_date} size="small" />
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 价格设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ color: '#0d6efd' }} />
                价格设置
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>默认价格阈值（元）</InputLabel>
                  <Select
                    value={settings.price_threshold}
                    label="默认价格阈值（元）"
                    onChange={(e) => handleSettingChange('price_threshold', e.target.value)}
                  >
                    {options.price_threshold_options.map(option => (
                      <MenuItem key={option} value={option}>
                        ¥{option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  当前设置说明：
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 主监控每 <Chip label={`${settings.monitor_interval}分钟`} size="small" /> 检查一次
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 用户任务每 <Chip label={`${settings.user_monitor_interval}分钟`} size="small" /> 检查一次
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 低于 <Chip label={`¥${settings.price_threshold}`} size="small" /> 时发送通知
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 通知间隔 <Chip label={`${settings.notification_cooldown}小时`} size="small" />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    • 监控日期: <Chip label={`${settings.departure_date} - ${settings.return_date}`} size="small" />
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 操作按钮 */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          onClick={handleSave}
          disabled={saving}
          sx={{ px: 4 }}
        >
          {saving ? '保存中...' : '保存设置'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          sx={{ px: 4 }}
        >
          刷新数据
        </Button>
      </Box>
    </Container>
  );
};

export default AdminMonitorSettings;
