import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Home,
  Flight,
  Dashboard,
  SmartToy,
  AdminPanelSettings,
  Login,
  PersonAdd,
  Close,
  Monitor
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { createAppleGlass } from '../utils/glassmorphism';

const MobileDrawer = ({ open, onClose }) => {
  const { isDarkMode, theme: themeMode } = useCustomTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, isAdmin } = useUser();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/');
  };

  const publicMenuItems = [
    { text: t('nav.home'), icon: <Home />, path: '/' },
    { text: t('nav.monitor'), icon: <Monitor />, path: '/monitor' },
  ];

  const authenticatedMenuItems = [
    { text: t('nav.dashboard'), icon: <Dashboard />, path: '/dashboard' },
    { text: t('nav.aiTravel'), icon: <SmartToy />, path: '/ai-travel' },
  ];

  const authMenuItems = [
    { text: t('nav.login'), icon: <Login />, path: '/login' },
    { text: t('nav.register'), icon: <PersonAdd />, path: '/register' },
  ];

  // 创建Apple风格菜单项样式
  const createAppleMenuItem = () => ({
    borderRadius: '12px',
    mx: 1,
    my: 0.5,
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    '&:hover': {
      backgroundColor: isDarkMode 
        ? 'rgba(138, 180, 248, 0.08)' 
        : 'rgba(26, 115, 232, 0.08)',
      transform: 'translateX(8px) scale(1.02)',
      boxShadow: isDarkMode 
        ? '0 4px 12px rgba(0, 0, 0, 0.2)'
        : '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    '&:active': {
      transform: 'translateX(4px) scale(1)',
    },
    '& .MuiListItemIcon-root': {
      minWidth: '40px',
      color: isDarkMode ? '#8ab4f8' : '#1a73e8',
      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    '& .MuiListItemText-primary': {
      fontWeight: 500,
      color: isDarkMode ? '#e8eaed' : '#202124',
      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    }
  });

  // 创建玻璃效果抽屉样式
  const createGlassDrawer = () => {
    const baseGlass = createAppleGlass('primary', themeMode);
    return {
      ...baseGlass,
      width: 320,
      borderTopRightRadius: '24px',
      borderBottomRightRadius: '24px',
      border: isDarkMode 
        ? '0.5px solid rgba(255, 255, 255, 0.1)' 
        : '0.5px solid rgba(0, 0, 0, 0.08)',
      borderLeft: 'none',
    };
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: createGlassDrawer()
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 头部 - 应用玻璃效果 */}
        <Box
          sx={{
            ...createAppleGlass('secondary', themeMode),
            p: 3,
            borderTopRightRadius: '24px',
            borderBottom: isDarkMode 
              ? '0.5px solid rgba(255, 255, 255, 0.1)' 
              : '0.5px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: '12px',
                backgroundColor: isDarkMode 
                  ? 'rgba(138, 180, 248, 0.1)' 
                  : 'rgba(26, 115, 232, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
              }}
            >
              <Flight sx={{ 
                color: '#4285f4',
                fontSize: 28,
              }} />
            </Box>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              color: isDarkMode ? '#e8eaed' : '#202124',
              letterSpacing: '-0.02em',
            }}>
              Ticketradar
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            sx={{
              borderRadius: '12px',
              padding: '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
              color: isDarkMode ? '#e8eaed' : '#5f6368',
              '&:hover': {
                backgroundColor: isDarkMode 
                  ? 'rgba(138, 180, 248, 0.08)' 
                  : 'rgba(26, 115, 232, 0.08)',
                color: isDarkMode ? '#8ab4f8' : '#1a73e8',
                transform: 'rotate(90deg)',
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* 用户信息 - 应用玻璃效果 */}
        {isAuthenticated && user && (
          <Box
            sx={{
              ...createAppleGlass('tertiary', themeMode),
              p: 3,
              m: 2,
              borderRadius: '16px',
              border: isDarkMode 
                ? '0.5px solid rgba(255, 255, 255, 0.08)' 
                : '0.5px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ 
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 600,
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                  : '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}>
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{
                  fontWeight: 600,
                  color: isDarkMode ? '#e8eaed' : '#202124',
                  mb: 0.5,
                }}>
                  {user.username}
                </Typography>
                <Typography variant="body2" sx={{
                  color: isDarkMode ? '#9aa0a6' : '#5f6368',
                  fontSize: '0.875rem',
                }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* 菜单列表 */}
        <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
          <List>
            {/* 公共菜单 */}
            {publicMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={createAppleMenuItem()}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}

            {isAuthenticated && (
              <>
                <Divider sx={{
                  my: 2,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                }} />

                {/* 认证用户菜单 */}
                {authenticatedMenuItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={createAppleMenuItem()}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}

                {/* 管理员菜单 */}
                {isAdmin() && (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation('/admin')}
                      sx={createAppleMenuItem()}
                    >
                      <ListItemIcon><AdminPanelSettings /></ListItemIcon>
                      <ListItemText primary={t('nav.admin')} />
                    </ListItemButton>
                  </ListItem>
                )}
              </>
            )}

            {!isAuthenticated && (
              <>
                <Divider sx={{
                  my: 2,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                }} />

                {/* 未认证用户菜单 */}
                {authMenuItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={createAppleMenuItem()}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}
          </List>
        </Box>

        {/* 底部 - 应用玻璃效果 */}
        <Box sx={{ 
          ...createAppleGlass('tertiary', themeMode),
          p: 3, 
          m: 2,
          mt: 0,
          borderRadius: '16px',
          borderBottomRightRadius: '20px',
          border: isDarkMode 
            ? '0.5px solid rgba(255, 255, 255, 0.08)' 
            : '0.5px solid rgba(0, 0, 0, 0.06)',
        }}>
          {/* 主题切换 */}
          <Box sx={{ 
            mb: isAuthenticated ? 2 : 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 1,
            borderRadius: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDarkMode 
                ? 'rgba(138, 180, 248, 0.05)' 
                : 'rgba(26, 115, 232, 0.05)',
            }
          }}>
            <Typography variant="body2" sx={{
              color: isDarkMode ? '#9aa0a6' : '#5f6368',
              fontWeight: 500,
            }}>
              {t('theme.appearance', '外观')}
            </Typography>
            <ThemeToggle variant="button" />
          </Box>

          {/* 登出按钮 */}
          {isAuthenticated && (
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '12px',
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.08)',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
                },
                '& .MuiListItemIcon-root': {
                  minWidth: '40px',
                  color: 'error.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'error.main',
                  fontWeight: 500,
                }
              }}
            >
              <ListItemIcon>
                <Login sx={{ transform: 'rotate(180deg)' }} />
              </ListItemIcon>
              <ListItemText primary={t('nav.logout')} />
            </ListItemButton>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;
