import React, { useState, useEffect } from 'react';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  Box,
  Fab,
  Zoom,
  IconButton,
  Typography
} from '@mui/material';
import {
  Home,
  Search,
  Dashboard,
  Person,
  FlightTakeoff,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import { useMobile } from '../../hooks/useMobile';
import { createAppleGlass } from '../../utils/glassmorphism';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

/**
 * 移动端底部导航组件
 */
const BottomNavigation = ({
  showFab = true,
  fabAction,
  notificationCount = 0,
  sx = {},
  ...props
}) => {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated } = useUser();
  const { isMobile, isSmallScreen } = useMobile();
  const { isDarkMode, theme: themeMode } = useCustomTheme();

  // 导航项配置
  const navigationItems = [
    {
      label: t('nav.home'),
      icon: <Home />,
      path: '/',
      requireAuth: false
    },
    {
      label: t('nav.search'),
      icon: <Search />,
      path: '/search',
      requireAuth: false
    },
    {
      label: t('nav.dashboard'),
      icon: <Dashboard />,
      path: '/dashboard',
      requireAuth: true
    },
    {
      label: t('nav.profile'),
      icon: <Person />,
      path: '/profile',
      requireAuth: true
    }
  ];

  // 根据认证状态过滤导航项
  const filteredItems = navigationItems.filter(item => 
    !item.requireAuth || isAuthenticated
  );

  // 根据当前路径设置活动项
  useEffect(() => {
    const currentIndex = filteredItems.findIndex(item => 
      location.pathname === item.path || 
      (item.path !== '/' && location.pathname.startsWith(item.path))
    );
    
    if (currentIndex !== -1) {
      setValue(currentIndex);
    }
  }, [location.pathname, filteredItems]);

  // 处理导航变化
  const handleChange = (event, newValue) => {
    setValue(newValue);
    const item = filteredItems[newValue];
    if (item) {
      navigate(item.path);
    }
  };

  // 处理FAB点击
  const handleFabClick = () => {
    if (fabAction) {
      fabAction();
    } else {
      navigate('/ai-travel');
    }
  };

  // 创建玻璃效果样式
  const createGlassBottomNav = () => {
    const baseGlass = createAppleGlass('primary', themeMode);
    return {
      ...baseGlass,
      borderTop: isDarkMode 
        ? '0.5px solid rgba(255, 255, 255, 0.1)' 
        : '0.5px solid rgba(0, 0, 0, 0.08)',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '40px',
        height: '4px',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
        borderRadius: '2px',
        marginTop: '8px'
      }
    };
  };

  // 如果不是移动端，不显示底部导航
  if (!isMobile && !isSmallScreen) {
    return null;
  }

  return (
    <>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          ...createGlassBottomNav(),
          ...sx
        }}
        elevation={0}
        {...props}
      >
        <MuiBottomNavigation
          value={value}
          onChange={handleChange}
          sx={{
            backgroundColor: 'transparent',
            height: 70,
            paddingTop: 1,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
              borderRadius: '12px',
              margin: '0 4px',
              '&.Mui-selected': {
                backgroundColor: isDarkMode 
                  ? 'rgba(138, 180, 248, 0.15)' 
                  : 'rgba(26, 115, 232, 0.15)',
                color: isDarkMode ? '#8ab4f8' : '#1a73e8',
                transform: 'translateY(-2px)',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 600
                }
              },
              '&:not(.Mui-selected)': {
                color: isDarkMode ? '#9aa0a6' : '#5f6368'
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                fontWeight: 500,
                marginTop: '4px'
              }
            }
          }}
        >
          {filteredItems.map((item, index) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={
                item.path === '/profile' && notificationCount > 0 ? (
                  <Badge 
                    badgeContent={notificationCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        height: '16px',
                        minWidth: '16px'
                      }
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : item.icon
              }
            />
          ))}
        </MuiBottomNavigation>
      </Paper>

      {/* 浮动操作按钮 */}
      {showFab && (
        <Zoom in={true} timeout={300}>
          <Fab
            color="primary"
            onClick={handleFabClick}
            sx={{
              position: 'fixed',
              bottom: 85,
              right: 16,
              zIndex: 1001,
              background: isDarkMode 
                ? 'linear-gradient(135deg, #1a73e8, #4285f4)'
                : 'linear-gradient(135deg, #1a73e8, #4285f4)',
              boxShadow: isDarkMode
                ? '0 8px 32px rgba(26, 115, 232, 0.4)'
                : '0 8px 32px rgba(26, 115, 232, 0.3)',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: isDarkMode
                  ? '0 12px 40px rgba(26, 115, 232, 0.5)'
                  : '0 12px 40px rgba(26, 115, 232, 0.4)',
              },
              '&:active': {
                transform: 'scale(0.95)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
            }}
          >
            <FlightTakeoff />
          </Fab>
        </Zoom>
      )}

      {/* 为底部导航预留空间 */}
      <Box sx={{ height: 70 }} />
    </>
  );
};

/**
 * 移动端顶部应用栏组件
 */
const MobileAppBar = ({
  title,
  showBack = false,
  onBack,
  actions = [],
  sx = {},
  ...props
}) => {
  const navigate = useNavigate();
  const { isDarkMode, theme: themeMode } = useCustomTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const createGlassAppBar = () => {
    const baseGlass = createAppleGlass('primary', themeMode);
    return {
      ...baseGlass,
      borderBottom: isDarkMode 
        ? '0.5px solid rgba(255, 255, 255, 0.1)' 
        : '0.5px solid rgba(0, 0, 0, 0.08)',
      borderBottomLeftRadius: '20px',
      borderBottomRightRadius: '20px'
    };
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        ...createGlassAppBar(),
        ...sx
      }}
      elevation={0}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          minHeight: 56
        }}
      >
        {/* 左侧 */}
        <Box display="flex" alignItems="center">
          {showBack && (
            <IconButton
              onClick={handleBack}
              sx={{
                mr: 1,
                color: isDarkMode ? '#e8eaed' : '#5f6368'
              }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: isDarkMode ? '#e8eaed' : '#202124'
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* 右侧操作 */}
        <Box display="flex" alignItems="center" gap={1}>
          {actions.map((action, index) => (
            <IconButton
              key={index}
              onClick={action.onClick}
              sx={{
                color: isDarkMode ? '#e8eaed' : '#5f6368',
                '&:hover': {
                  backgroundColor: isDarkMode 
                    ? 'rgba(138, 180, 248, 0.08)' 
                    : 'rgba(26, 115, 232, 0.08)'
                }
              }}
            >
              {action.icon}
            </IconButton>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export { BottomNavigation, MobileAppBar };
export default BottomNavigation;
