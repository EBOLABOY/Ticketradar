import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Pagination,
  InputAdornment,
  Tooltip,
  Avatar,
  DialogContentText,
  ButtonGroup
} from '@mui/material';

import {
  Dashboard,
  People,
  Flight,
  Analytics,
  Settings,
  Delete,
  Block,
  CheckCircle,
  Refresh,
  Download,
  Upload,
  VpnKey,
  AdminPanelSettings,
  Notifications,
  Speed,
  Search,
  FilterList,
  PersonAdd,
  Visibility,
  ContentCopy,
  AutorenewRounded,
  Warning,
  SupervisorAccount,
  VerifiedUser,
  Schedule,
  Today
} from '@mui/icons-material';

// 导入玻璃效果工具
import { createAppleGlass, createGlassButton, createGlassCard } from '../utils/glassmorphism';

const Admin = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 邀请码管理状态
  const [inviteCodes, setInviteCodes] = useState([]);

  // 用户管理状态
  const [users, setUsers] = useState([]);
  const [userDialog, setUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // all, active, inactive, admin
  const [userPage, setUserPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', user: null });
  
  // 系统统计状态
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    activeTasks: 0,
    totalSearches: 0,
    todaySearches: 0,
    systemHealth: 'good',
    uptime: '0 days',
    memoryUsage: 0,
    cpuUsage: 0
  });

  // 监控设置状态
  const [monitorSettings, setMonitorSettings] = useState({
    defaultRoundTrip: true,
    defaultTimeRange: 30,
    maxTasksPerUser: 10,
    searchInterval: 60,
    enableNotifications: true,
    enableEmailAlerts: true
  });

  // 加载数据
  useEffect(() => {
    loadSystemStats();
    loadUsers();
    loadInviteCodes();
    loadMonitorSettings();
  }, []);

  const loadSystemStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:38181/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSystemStats(data.data.stats);
        }
      }
    } catch (error) {
      console.error('加载系统统计失败:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:38181/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data.users);
        }
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    }
  };

  const loadInviteCodes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:38181/api/admin/invite-codes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInviteCodes(data.data.codes);
        }
      }
    } catch (error) {
      console.error('加载邀请码失败:', error);
    }
  };

  const loadMonitorSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:38181/api/admin/monitor-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMonitorSettings(data.data.settings);
        }
      }
    } catch (error) {
      console.error('加载监控设置失败:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleUserAction = async (userId, action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:38181/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showSnackbar(`用户${action}成功`, 'success');
          loadUsers();
        } else {
          showSnackbar(data.message || '操作失败', 'error');
        }
      }
    } catch (error) {
      console.error('用户操作失败:', error);
      showSnackbar('操作失败: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteInviteCode = async (codeId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:38181/api/admin/invite-codes/${codeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        showSnackbar('邀请码删除成功', 'success');
        loadInviteCodes();
      }
    } catch (error) {
      console.error('删除邀请码失败:', error);
      showSnackbar('删除邀请码失败', 'error');
    }
  };

  const handleMonitorSettingChange = async (key, value) => {
    const newSettings = {
      ...monitorSettings,
      [key]: value
    };
    setMonitorSettings(newSettings);

    try {
      const token = localStorage.getItem('authToken');
      await fetch('http://localhost:38181/api/admin/monitor-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });
      showSnackbar('设置已保存', 'success');
    } catch (error) {
      console.error('保存设置失败:', error);
      showSnackbar('保存设置失败', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'blocked': return 'error';
      case 'running': return 'info';
      case 'paused': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '活跃';
      case 'inactive': return '非活跃';
      case 'blocked': return '已封禁';
      case 'running': return '运行中';
      case 'paused': return '已暂停';
      case 'error': return '错误';
      default: return status;
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  // 生成随机邀请码
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 复制到剪贴板
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar('已复制到剪贴板', 'success');
    } catch (err) {
      showSnackbar('复制失败', 'error');
    }
  };

  // 过滤用户列表
  const getFilteredUsers = () => {
    let filtered = users;

    // 按状态过滤
    if (userFilter !== 'all') {
      filtered = filtered.filter(user => {
        switch (userFilter) {
          case 'active': return user.status === 'active';
          case 'inactive': return user.status === 'inactive';
          case 'admin': return user.is_admin;
          default: return true;
        }
      });
    }

    // 按搜索词过滤
    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // 获取分页用户
  const getPaginatedUsers = () => {
    const filtered = getFilteredUsers();
    const startIndex = (userPage - 1) * usersPerPage;
    return filtered.slice(startIndex, startIndex + usersPerPage);
  };

  // 处理用户操作确认
  const handleUserActionConfirm = (user, action) => {
    setConfirmDialog({
      open: true,
      action,
      user,
      title: getActionTitle(action),
      message: getActionMessage(action, user)
    });
  };

  const getActionTitle = (action) => {
    switch (action) {
      case 'block': return '封禁用户';
      case 'unblock': return '解封用户';
      case 'delete': return '删除用户';
      default: return '确认操作';
    }
  };

  const getActionMessage = (action, user) => {
    switch (action) {
      case 'block': return `确定要封禁用户 "${user.username}" 吗？封禁后该用户将无法登录系统。`;
      case 'unblock': return `确定要解封用户 "${user.username}" 吗？解封后该用户可以正常登录系统。`;
      case 'delete': return `确定要删除用户 "${user.username}" 吗？此操作不可恢复，将删除该用户的所有数据。`;
      default: return '确定要执行此操作吗？';
    }
  };

  // 执行用户操作
  const executeUserAction = async () => {
    const { user, action } = confirmDialog;
    setConfirmDialog({ ...confirmDialog, open: false });
    await handleUserAction(user.id, action);
  };

  // 一键生成邀请码
  const handleQuickCreateInviteCode = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const quickInviteCode = {
        code: generateInviteCode(),
        description: `快速生成 - ${new Date().toLocaleString()}`,
        maxUses: 1,
        expiresAt: '' // 永不过期
      };

      const response = await fetch('http://localhost:38181/api/admin/invite-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quickInviteCode)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSnackbar(`邀请码 ${quickInviteCode.code} 生成成功！`, 'success');
        loadInviteCodes(); // 重新加载邀请码列表

        // 自动复制到剪贴板
        await copyToClipboard(quickInviteCode.code);
      } else {
        showSnackbar(data.message || '生成邀请码失败', 'error');
      }
    } catch (error) {
      console.error('一键生成邀请码失败:', error);
      showSnackbar('生成邀请码失败', 'error');
    }
  };

  const tabs = [
    { label: t('admin.tabs.overview'), icon: <Dashboard /> },
    { label: t('admin.tabs.inviteCodes'), icon: <VpnKey /> },
    { label: t('admin.tabs.users'), icon: <People /> },
    { label: t('admin.tabs.monitorSettings'), icon: <Settings /> }
  ];

  // 玻璃效果样式
  const glassCardStyle = createGlassCard(isDark ? 'dark' : 'light');
  const glassButtonStyle = createGlassButton(isDark ? 'dark' : 'light');
  const glassNavbarStyle = createAppleGlass('navbar', isDark ? 'dark' : 'light');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? 'radial-gradient(circle at 20% 80%, rgba(66, 165, 245, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(144, 202, 249, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(66, 165, 245, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* 页面标题 */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom>
              <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
              {t('admin.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('admin.subtitle')}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            onClick={() => {
              loadSystemStats();
              loadUsers();
              loadInviteCodes();
              loadMonitorSettings();
            }}
            disabled={loading}
            sx={glassButtonStyle}
          >
            {loading ? t('common.refreshing') : t('common.refresh')}
          </Button>
        </Box>

        {/* 标签页导航 */}
        <Paper sx={{ ...glassNavbarStyle, mb: 3, borderRadius: '16px' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Paper>

        {/* 系统概览 */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* 统计卡片 */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {t('admin.stats.totalUsers')}
                    </Typography>
                    <Typography variant="h4" fontWeight="600">
                      {systemStats.totalUsers}
                    </Typography>
                  </Box>
                  <People color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {t('admin.stats.activeUsers')}
                    </Typography>
                    <Typography variant="h4" fontWeight="600" color="success.main">
                      {systemStats.activeUsers}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {t('admin.stats.monitorTasks')}
                    </Typography>
                    <Typography variant="h4" fontWeight="600" color="info.main">
                      {systemStats.totalTasks}
                    </Typography>
                  </Box>
                  <Flight color="info" sx={{ fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {t('admin.stats.todaySearches')}
                    </Typography>
                    <Typography variant="h4" fontWeight="600" color="warning.main">
                      {systemStats.todaySearches}
                    </Typography>
                  </Box>
                  <Analytics color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>

            {/* 系统健康状态 */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('admin.systemHealth.title')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.systemHealth.status')}
                      </Typography>
                      <Chip
                        label={systemStats.systemHealth}
                        color={getHealthColor(systemStats.systemHealth)}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.systemHealth.uptime')}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {systemStats.uptime}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.systemHealth.memory')}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {systemStats.memoryUsage}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.systemHealth.cpu')}
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {systemStats.cpuUsage}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* 快捷操作 */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('admin.quickActions.title')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Download />}
                      sx={{ ...glassButtonStyle, py: 1.5 }}
                    >
                      {t('admin.quickActions.exportData')}
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Upload />}
                      sx={{ ...glassButtonStyle, py: 1.5 }}
                    >
                      {t('admin.quickActions.importConfig')}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* 邀请码管理 */}
        {activeTab === 1 && (
          <Paper sx={{ ...glassCardStyle, p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="600">
                <VpnKey sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('admin.inviteCodes.title')}
                <Chip
                  label={`${inviteCodes.length} 个邀请码`}
                  size="small"
                  sx={{ ml: 2 }}
                  color="primary"
                />
              </Typography>
              <Button
                variant="contained"
                startIcon={<AutorenewRounded />}
                onClick={handleQuickCreateInviteCode}
                sx={{
                  ...glassButtonStyle,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                  },
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                }}
              >
                一键生成邀请码
              </Button>
            </Box>

            {inviteCodes.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={8}
                sx={{ ...glassCardStyle, borderRadius: '12px' }}
              >
                <VpnKey sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  暂无邀请码
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  创建邀请码来邀请新用户注册
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AutorenewRounded />}
                  onClick={handleQuickCreateInviteCode}
                  sx={{
                    ...glassButtonStyle,
                    background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                    },
                    fontWeight: 600,
                    px: 4,
                    py: 2,
                  }}
                >
                  一键生成邀请码
                </Button>
              </Box>
            ) : (
              <TableContainer sx={{ ...glassCardStyle, borderRadius: '12px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>邀请码信息</TableCell>
                      <TableCell>使用情况</TableCell>
                      <TableCell>过期时间</TableCell>
                      <TableCell>状态</TableCell>
                      <TableCell align="center">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inviteCodes.map((code) => (
                      <TableRow key={code.id} hover>
                        <TableCell>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography
                                variant="h6"
                                fontFamily="monospace"
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.9rem'
                                }}
                              >
                                {code.code}
                              </Typography>
                              <Tooltip title="复制邀请码">
                                <IconButton
                                  size="small"
                                  onClick={() => copyToClipboard(code.code)}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {code.description || '无描述'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {code.id?.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">
                              已使用: {code.usedCount || 0} / {code.maxUses || '无限制'}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                              <Box
                                sx={{
                                  width: 100,
                                  height: 6,
                                  bgcolor: 'grey.300',
                                  borderRadius: 3,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: `${Math.min(((code.usedCount || 0) / (code.maxUses || 1)) * 100, 100)}%`,
                                    height: '100%',
                                    bgcolor: (code.usedCount || 0) >= (code.maxUses || 1) ? 'error.main' : 'success.main',
                                    transition: 'width 0.3s ease'
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ ml: 1 }}>
                                {Math.round(((code.usedCount || 0) / (code.maxUses || 1)) * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {code.expiresAt ? (
                            <Box>
                              <Typography variant="body2">
                                {formatDate(code.expiresAt)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={new Date(code.expiresAt) < new Date() ? 'error' : 'text.secondary'}
                              >
                                {new Date(code.expiresAt) < new Date() ? '已过期' : '有效'}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              永不过期
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={code.isActive ? '活跃' : '禁用'}
                            color={code.isActive ? 'success' : 'default'}
                            size="small"
                            icon={code.isActive ? <CheckCircle /> : <Block />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <ButtonGroup size="small" variant="outlined">
                            <Tooltip title="复制邀请码">
                              <IconButton
                                size="small"
                                onClick={() => copyToClipboard(code.code)}
                              >
                                <ContentCopy />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="删除邀请码">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteInviteCode(code.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </ButtonGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}

        {/* 用户管理 */}
        {activeTab === 2 && (
          <Paper sx={{ ...glassCardStyle, p: 3 }}>
            {/* 用户管理标题和操作栏 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="600">
                <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                {t('admin.users.title')}
                <Chip
                  label={`${getFilteredUsers().length} 个用户`}
                  size="small"
                  sx={{ ml: 2 }}
                  color="primary"
                />
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                sx={glassButtonStyle}
                onClick={() => showSnackbar('创建用户功能开发中', 'info')}
              >
                创建用户
              </Button>
            </Box>

            {/* 搜索和过滤栏 */}
            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
              <TextField
                size="small"
                placeholder="搜索用户名或邮箱..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>状态筛选</InputLabel>
                <Select
                  value={userFilter}
                  label="状态筛选"
                  onChange={(e) => setUserFilter(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1 }} />}
                >
                  <MenuItem value="all">全部</MenuItem>
                  <MenuItem value="active">活跃</MenuItem>
                  <MenuItem value="inactive">非活跃</MenuItem>
                  <MenuItem value="admin">管理员</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* 用户表格 */}
            <TableContainer sx={{ ...glassCardStyle, borderRadius: '12px', mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>用户信息</TableCell>
                    <TableCell>状态</TableCell>
                    <TableCell>注册时间</TableCell>
                    <TableCell>最后登录</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getPaginatedUsers().map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: user.is_admin ? 'error.main' : 'primary.main' }}>
                            {user.is_admin ? <SupervisorAccount /> : <People />}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {user.username}
                              {user.is_admin && (
                                <Chip
                                  label="管理员"
                                  size="small"
                                  color="error"
                                  sx={{ ml: 1, height: 20 }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              ID: {user.id.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(user.status)}
                          color={getStatusColor(user.status)}
                          size="small"
                          icon={user.status === 'active' ? <VerifiedUser /> : <Block />}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatDate(user.created_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            <Today sx={{ fontSize: 12, mr: 0.5 }} />
                            {new Date(user.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <Box>
                            <Typography variant="body2">
                              {formatDate(user.last_login)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              <Schedule sx={{ fontSize: 12, mr: 0.5 }} />
                              {new Date(user.last_login).toLocaleDateString()}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {t('admin.users.neverLoggedIn')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <ButtonGroup size="small" variant="outlined">
                          <Tooltip title="查看详情">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserDialog(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.status === 'active' ? '封禁用户' : '解封用户'}>
                            <IconButton
                              size="small"
                              color={user.status === 'active' ? 'warning' : 'success'}
                              onClick={() => handleUserActionConfirm(user, user.status === 'active' ? 'block' : 'unblock')}
                            >
                              {user.status === 'active' ? <Block /> : <CheckCircle />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="删除用户">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleUserActionConfirm(user, 'delete')}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 分页 */}
            <Box display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(getFilteredUsers().length / usersPerPage)}
                page={userPage}
                onChange={(e, page) => setUserPage(page)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </Paper>
        )}

        {/* 监控设置 */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  <Flight sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('admin.monitorSettings.flightSettings')}
                </Typography>
                <Box display="flex" flexDirection="column" gap={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={monitorSettings.defaultRoundTrip}
                        onChange={(e) => handleMonitorSettingChange('defaultRoundTrip', e.target.checked)}
                      />
                    }
                    label={t('admin.monitorSettings.defaultRoundTrip')}
                  />
                  <FormControl fullWidth>
                    <InputLabel>{t('admin.monitorSettings.defaultTimeRange')}</InputLabel>
                    <Select
                      value={monitorSettings.defaultTimeRange}
                      label={t('admin.monitorSettings.defaultTimeRange')}
                      onChange={(e) => handleMonitorSettingChange('defaultTimeRange', e.target.value)}
                    >
                      <MenuItem value={7}>7 {t('common.days')}</MenuItem>
                      <MenuItem value={14}>14 {t('common.days')}</MenuItem>
                      <MenuItem value={30}>30 {t('common.days')}</MenuItem>
                      <MenuItem value={60}>60 {t('common.days')}</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    type="number"
                    label={t('admin.monitorSettings.maxTasksPerUser')}
                    value={monitorSettings.maxTasksPerUser}
                    onChange={(e) => handleMonitorSettingChange('maxTasksPerUser', parseInt(e.target.value))}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {t('admin.monitorSettings.notificationSettings')}
                </Typography>
                <Box display="flex" flexDirection="column" gap={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={monitorSettings.enableNotifications}
                        onChange={(e) => handleMonitorSettingChange('enableNotifications', e.target.checked)}
                      />
                    }
                    label={t('admin.monitorSettings.enableNotifications')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={monitorSettings.enableEmailAlerts}
                        onChange={(e) => handleMonitorSettingChange('enableEmailAlerts', e.target.checked)}
                      />
                    }
                    label={t('admin.monitorSettings.enableEmailAlerts')}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label={t('admin.monitorSettings.searchInterval')}
                    value={monitorSettings.searchInterval}
                    onChange={(e) => handleMonitorSettingChange('searchInterval', parseInt(e.target.value))}
                    helperText={t('admin.monitorSettings.searchIntervalHelp')}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}



        {/* 用户详情对话框 */}
        <Dialog
          open={userDialog}
          onClose={() => setUserDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { ...glassCardStyle, borderRadius: '16px' }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ mr: 2, bgcolor: selectedUser?.is_admin ? 'error.main' : 'primary.main' }}>
                {selectedUser?.is_admin ? <SupervisorAccount /> : <People />}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  {selectedUser?.username}
                  {selectedUser?.is_admin && (
                    <Chip
                      label="管理员"
                      size="small"
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser?.email}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    用户ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {selectedUser?.id}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    账户状态
                  </Typography>
                  <Chip
                    label={getStatusText(selectedUser?.status)}
                    color={getStatusColor(selectedUser?.status)}
                    size="small"
                    icon={selectedUser?.status === 'active' ? <VerifiedUser /> : <Block />}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    注册时间
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser?.created_at ? formatDate(selectedUser.created_at) : '未知'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    最后登录
                  </Typography>
                  <Typography variant="body2">
                    {selectedUser?.last_login ? formatDate(selectedUser.last_login) : '从未登录'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    权限信息
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label={selectedUser?.is_admin ? '管理员权限' : '普通用户'}
                      color={selectedUser?.is_admin ? 'error' : 'default'}
                      size="small"
                      icon={selectedUser?.is_admin ? <SupervisorAccount /> : <People />}
                    />
                    <Chip
                      label={selectedUser?.status === 'active' ? '可登录' : '禁止登录'}
                      color={selectedUser?.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setUserDialog(false)}
              sx={glassButtonStyle}
            >
              关闭
            </Button>
            {selectedUser && !selectedUser.is_admin && (
              <>
                <Button
                  onClick={() => {
                    setUserDialog(false);
                    handleUserActionConfirm(selectedUser, selectedUser.status === 'active' ? 'block' : 'unblock');
                  }}
                  color={selectedUser.status === 'active' ? 'warning' : 'success'}
                  sx={glassButtonStyle}
                >
                  {selectedUser.status === 'active' ? '封禁用户' : '解封用户'}
                </Button>
                <Button
                  onClick={() => {
                    setUserDialog(false);
                    handleUserActionConfirm(selectedUser, 'delete');
                  }}
                  color="error"
                  sx={glassButtonStyle}
                >
                  删除用户
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* 确认操作对话框 */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { ...glassCardStyle, borderRadius: '16px' }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <Warning sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6" fontWeight="600">
                {confirmDialog.title}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmDialog.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
              sx={glassButtonStyle}
            >
              取消
            </Button>
            <Button
              onClick={executeUserAction}
              color="error"
              variant="contained"
              sx={glassButtonStyle}
            >
              确认
            </Button>
          </DialogActions>
        </Dialog>

        {/* 消息提示 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Admin;
