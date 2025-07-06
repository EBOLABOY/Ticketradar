import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Divider,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Notifications,
  Security,
  Flight,
  Email,
  Settings,
  Logout,
  PhotoCamera,
  Delete,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { createAppleGlass, createGlassButton, createGlassCard } from '../utils/glassmorphism';

const Profile = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isDarkMode } = useCustomTheme();
  const { user, updateUser, logout } = useUser();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '张三',
    email: user?.email || 'zhangsan@example.com',
    phone: '+86 138 0013 8000',
    location: '北京市朝阳区',
    birthday: '1990-01-01',
    bio: '热爱旅行的程序员，足迹遍布世界各地。',
    avatar: null
  });

  const [preferences, setPreferences] = useState({
    language: 'zh-CN',
    currency: 'CNY',
    timezone: 'Asia/Shanghai',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      priceAlerts: true,
      newsletter: false
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false
    }
  });

  // 玻璃效果样式
  const glassCardStyle = createGlassCard(isDarkMode ? 'dark' : 'light');
  const glassButtonStyle = createGlassButton(isDarkMode ? 'dark' : 'light');
  const glassPrimaryStyle = createAppleGlass('primary', isDarkMode ? 'dark' : 'light');

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:38181/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          updateUser(profileData);
          setEditing(false);
          setSnackbar({ open: true, message: '个人资料更新成功', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: data.message || '更新失败', severity: 'error' });
        }
      } else {
        setSnackbar({ open: true, message: '网络错误，请稍后再试', severity: 'error' });
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      setSnackbar({ open: true, message: '更新失败: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // 取消编辑，恢复原始数据
    setProfileData({
      name: user?.name || '张三',
      email: user?.email || 'zhangsan@example.com',
      phone: '+86 138 0013 8000',
      location: '北京市朝阳区',
      birthday: '1990-01-01',
      bio: '热爱旅行的程序员，足迹遍布世界各地。',
      avatar: null
    });
    setEditing(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreferenceChange = async (category, key, value) => {
    let newPreferences;
    if (key === '') {
      // 直接更新顶级属性
      newPreferences = {
        ...preferences,
        [category]: value
      };
    } else {
      // 更新嵌套属性
      newPreferences = {
        ...preferences,
        [category]: {
          ...preferences[category],
          [key]: value
        }
      };
    }

    setPreferences(newPreferences);

    // 自动保存偏好设置
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:38181/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });
    } catch (error) {
      console.error('保存偏好设置失败:', error);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSnackbar({ open: true, message: '新密码和确认密码不匹配', severity: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setSnackbar({ open: true, message: '新密码长度至少6位', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:38181/api/user/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setSnackbar({ open: true, message: '密码更新成功', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: data.message || '密码更新失败', severity: 'error' });
        }
      } else {
        setSnackbar({ open: true, message: '网络错误，请稍后再试', severity: 'error' });
      }
    } catch (error) {
      console.error('更新密码失败:', error);
      setSnackbar({ open: true, message: '更新失败: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:38181/api/user/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSnackbar({ open: true, message: '账户删除成功', severity: 'success' });
          setTimeout(() => {
            logout();
          }, 2000);
        } else {
          setSnackbar({ open: true, message: data.message || '删除失败', severity: 'error' });
        }
      } else {
        setSnackbar({ open: true, message: '网络错误，请稍后再试', severity: 'error' });
      }
    } catch (error) {
      console.error('删除账户失败:', error);
      setSnackbar({ open: true, message: '删除失败: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialog(false);
    }
  };

  // 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');

        // 加载用户资料
        const profileResponse = await fetch('http://localhost:38181/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            setProfileData(prev => ({ ...prev, ...profileData.data }));
          }
        }

        // 加载用户偏好设置
        const preferencesResponse = await fetch('http://localhost:38181/api/user/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json();
          if (preferencesData.success) {
            setPreferences(prev => ({ ...prev, ...preferencesData.data }));
          }
        }
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    };

    loadUserData();
  }, []);

  const tabs = [
    { id: 'profile', label: '个人资料', icon: <Person /> },
    { id: 'preferences', label: '偏好设置', icon: <Settings /> },
    { id: 'security', label: '安全设置', icon: <Security /> },
    { id: 'notifications', label: '通知设置', icon: <Notifications /> }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode
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
          background: isDarkMode
            ? 'radial-gradient(circle at 20% 80%, rgba(66, 165, 245, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(144, 202, 249, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(66, 165, 245, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* 页面标题 */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="600" gutterBottom>
              个人中心
            </Typography>
            <Typography variant="body1" color="text.secondary">
              管理您的个人信息和偏好设置
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={logout}
            color="error"
            sx={glassButtonStyle}
          >
            退出登录
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* 侧边栏导航 */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ ...glassPrimaryStyle, p: 0 }}>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                  <Box position="relative">
                    <Avatar
                      src={profileData.avatar}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mb: 2,
                        border: `3px solid ${theme.palette.primary.main}`
                      }}
                    >
                      {profileData.name.charAt(0)}
                    </Avatar>
                    {editing && (
                      <IconButton
                        component="label"
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          right: -8,
                          bgcolor: 'primary.main',
                          color: 'white',
                          width: 32,
                          height: 32,
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }}
                      >
                        <PhotoCamera fontSize="small" />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </IconButton>
                    )}
                  </Box>
                  <Typography variant="h6" fontWeight="600">
                    {profileData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profileData.email}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <List component="nav">
                  {tabs.map((tab) => (
                    <ListItem
                      key={tab.id}
                      button
                      selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main'
                          }
                        }
                      }}
                    >
                      <ListItemIcon>
                        {tab.icon}
                      </ListItemIcon>
                      <ListItemText primary={tab.label} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Paper>
          </Grid>

          {/* 主要内容区域 */}
          <Grid item xs={12} md={9}>
            {activeTab === 'profile' && (
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="600">
                    个人资料
                  </Typography>
                  {!editing ? (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setEditing(true)}
                      sx={glassButtonStyle}
                    >
                      编辑
                    </Button>
                  ) : (
                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                        sx={glassButtonStyle}
                      >
                        {loading ? '保存中...' : '保存'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancelEdit}
                        sx={glassButtonStyle}
                      >
                        取消
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="姓名"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="邮箱"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="手机号"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="生日"
                      type="date"
                      value={profileData.birthday}
                      onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                      disabled={!editing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="所在地"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="个人简介"
                      multiline
                      rows={3}
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!editing}
                    />
                  </Grid>
                </Grid>

                {/* 旅行统计 */}
                <Box mt={4}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    旅行统计
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ ...glassCardStyle, p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" fontWeight="600">
                          12
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          监控任务
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ ...glassCardStyle, p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main" fontWeight="600">
                          5
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          成功预订
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ ...glassCardStyle, p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main" fontWeight="600">
                          ¥2,580
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          节省金额
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ ...glassCardStyle, p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main" fontWeight="600">
                          8
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          访问城市
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            )}

            {activeTab === 'preferences' && (
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  偏好设置
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>语言</InputLabel>
                      <Select
                        value={preferences.language}
                        label="语言"
                        onChange={(e) => handlePreferenceChange('language', '', e.target.value)}
                      >
                        <MenuItem value="zh-CN">中文（简体）</MenuItem>
                        <MenuItem value="zh-TW">中文（繁体）</MenuItem>
                        <MenuItem value="en-US">English</MenuItem>
                        <MenuItem value="ja-JP">日本語</MenuItem>
                        <MenuItem value="ko-KR">한국어</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>货币</InputLabel>
                      <Select
                        value={preferences.currency}
                        label="货币"
                        onChange={(e) => handlePreferenceChange('currency', '', e.target.value)}
                      >
                        <MenuItem value="CNY">人民币 (¥)</MenuItem>
                        <MenuItem value="USD">美元 ($)</MenuItem>
                        <MenuItem value="EUR">欧元 (€)</MenuItem>
                        <MenuItem value="JPY">日元 (¥)</MenuItem>
                        <MenuItem value="KRW">韩元 (₩)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>时区</InputLabel>
                      <Select
                        value={preferences.timezone}
                        label="时区"
                        onChange={(e) => handlePreferenceChange('timezone', '', e.target.value)}
                      >
                        <MenuItem value="Asia/Shanghai">北京时间 (UTC+8)</MenuItem>
                        <MenuItem value="Asia/Tokyo">东京时间 (UTC+9)</MenuItem>
                        <MenuItem value="Asia/Seoul">首尔时间 (UTC+9)</MenuItem>
                        <MenuItem value="America/New_York">纽约时间 (UTC-5)</MenuItem>
                        <MenuItem value="Europe/London">伦敦时间 (UTC+0)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {t('settings.preferences.currentTheme', '当前主题')}: {isDarkMode ? t('theme.dark', '深色') : t('theme.light', '浅色')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('settings.preferences.themeNote', '主题可以在导航栏切换')}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {activeTab === 'notifications' && (
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  通知设置
                </Typography>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="邮件通知"
                      secondary="接收重要更新和价格提醒邮件"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.email}
                        onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Notifications />
                    </ListItemIcon>
                    <ListItemText
                      primary="推送通知"
                      secondary="接收浏览器推送通知"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.push}
                        onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Flight />
                    </ListItemIcon>
                    <ListItemText
                      primary="价格提醒"
                      secondary="当监控的航班价格变化时通知我"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.priceAlerts}
                        onChange={(e) => handlePreferenceChange('notifications', 'priceAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="营销邮件"
                      secondary="接收产品更新和优惠信息"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={preferences.notifications.newsletter}
                        onChange={(e) => handlePreferenceChange('notifications', 'newsletter', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            )}

            {activeTab === 'security' && (
              <Paper sx={{ ...glassCardStyle, p: 3 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  安全设置
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ ...glassCardStyle, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        修改密码
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="当前密码"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="新密码"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="确认新密码"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePasswordUpdate}
                            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                            startIcon={loading ? <CircularProgress size={16} /> : null}
                            sx={glassButtonStyle}
                          >
                            {loading ? '更新中...' : '更新密码'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ ...glassCardStyle, p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        隐私设置
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="公开个人资料"
                            secondary="允许其他用户查看您的基本信息"
                          />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={preferences.privacy.profileVisible}
                              onChange={(e) => handlePreferenceChange('privacy', 'profileVisible', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>

                        <ListItem>
                          <ListItemText
                            primary="显示邮箱地址"
                            secondary="在个人资料中显示邮箱地址"
                          />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={preferences.privacy.showEmail}
                              onChange={(e) => handlePreferenceChange('privacy', 'showEmail', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>

                        <ListItem>
                          <ListItemText
                            primary="显示手机号码"
                            secondary="在个人资料中显示手机号码"
                          />
                          <ListItemSecondaryAction>
                            <Switch
                              checked={preferences.privacy.showPhone}
                              onChange={(e) => handlePreferenceChange('privacy', 'showPhone', e.target.checked)}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                      <Typography variant="subtitle1" fontWeight="600" color="error" gutterBottom>
                        危险操作
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        删除账户将永久删除您的所有数据，此操作不可恢复。
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setDeleteDialog(true)}
                      >
                        删除账户
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* 消息提示 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* 删除账户确认对话框 */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title" color="error">
            确认删除账户
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              您确定要删除您的账户吗？此操作将永久删除您的所有数据，包括：
              <br />• 个人资料信息
              <br />• 监控任务和历史记录
              <br />• 偏好设置
              <br />• 所有相关数据
              <br /><br />
              <strong>此操作不可恢复！</strong>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
            >
              {loading ? '删除中...' : '确认删除'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Profile;
