import React, { useState, useEffect, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Box,
  Divider,
  Button,
  useTheme,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

import AppsIcon from "@mui/icons-material/Apps";
import FlightIcon from "@mui/icons-material/Flight";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { useUser } from "../contexts/UserContext";
import { useTranslation } from "react-i18next";
import MobileDrawer from "./MobileDrawer";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useTheme as useCustomTheme } from "../contexts/ThemeContext";
import { createAppleGlass } from "../utils/glassmorphism";
import { useMobile, useMobileNavigation } from "../hooks/useMobile";
import { mobileStyles } from "../utils/mobileUtils";

const Navbar = () => {
  const { isDarkMode, theme: themeMode } = useCustomTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, isAdmin } = useUser();

  // 移动端相关状态和Hook
  const { isMobile, isSmallScreen, performanceLevel } = useMobile();
  const {
    isDrawerOpen,
    openDrawer,
    closeDrawer
  } = useMobileNavigation();

  // 响应式断点检测
  const isMobileBreakpoint = useMediaQuery(theme.breakpoints.down('md'));
  const showMobileLayout = isMobile || isMobileBreakpoint || isSmallScreen;

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [appsMenuAnchor, setAppsMenuAnchor] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // 滚动事件处理 - 使用throttle优化性能
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    setScrolled(currentScrollY > 10);
  }, []);

  // 节流函数
  const throttle = useCallback((func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  // 设置滚动监听
  useEffect(() => {
    const throttledHandleScroll = throttle(handleScroll, 16); // 60fps
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [handleScroll, throttle]);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
    navigate('/');
  };

  const handleAppsMenuOpen = (event) => {
    setAppsMenuAnchor(event.currentTarget);
  };

  const handleAppsMenuClose = () => {
    setAppsMenuAnchor(null);
  };

  const handleAppNavigation = (path) => {
    navigate(path);
    handleAppsMenuClose();
  };

  // 创建动态玻璃效果样式
  const createDynamicNavbarGlass = () => {
    const baseGlass = createAppleGlass('navbar', themeMode);
    
    // 根据滚动位置调整透明度和模糊效果
    const scrollProgress = Math.min(scrollY / 80, 1); // 80px内完成过渡，更快响应
    const baseOpacity = isDarkMode ? 0.75 : 0.80; // 降低基础透明度
    const maxOpacity = isDarkMode ? 0.95 : 0.98; // 提高最大透明度
    const dynamicOpacity = baseOpacity + (maxOpacity - baseOpacity) * scrollProgress;
    
    // 动态调整模糊效果
    const baseBlur = 20;
    const maxBlur = 28;
    const dynamicBlur = baseBlur + (maxBlur - baseBlur) * scrollProgress;
    
    return {
      ...baseGlass,
      background: isDarkMode
        ? `rgba(16, 16, 16, ${dynamicOpacity})`
        : `rgba(255, 255, 255, ${dynamicOpacity})`,
      backdropFilter: `blur(${dynamicBlur}px) saturate(180%)`,
      WebkitBackdropFilter: `blur(${dynamicBlur}px) saturate(180%)`,
      borderBottom: scrolled
        ? `0.5px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)'}`
        : 'none',
      boxShadow: scrolled
        ? isDarkMode
          ? '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    };
  };

  // 创建Apple风格按钮样式
  const createAppleButton = (variant = 'text') => {
    const baseStyle = {
      textTransform: "capitalize",
      borderRadius: '8px',
      padding: '6px 16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
      fontWeight: 500,
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: isDarkMode 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      '&:active': {
        transform: 'translateY(0)',
      }
    };

    if (variant === 'outlined') {
      return {
        ...baseStyle,
        color: isDarkMode ? '#e8eaed' : '#5f6368',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)',
        backgroundColor: 'transparent',
        '&:hover': {
          ...baseStyle['&:hover'],
          borderColor: isDarkMode ? '#8ab4f8' : '#1a73e8',
          backgroundColor: isDarkMode 
            ? 'rgba(138, 180, 248, 0.08)' 
            : 'rgba(26, 115, 232, 0.08)',
          color: isDarkMode ? '#8ab4f8' : '#1a73e8',
        }
      };
    }

    if (variant === 'contained') {
      return {
        ...baseStyle,
        backgroundColor: theme.palette.mainColors.mainBlue,
        color: '#ffffff',
        '&:hover': {
          ...baseStyle['&:hover'],
          backgroundColor: '#1557b0',
        }
      };
    }

    return baseStyle;
  };

  // 创建Apple风格图标按钮样式（移动端优化）
  const createAppleIconButton = () => {
    const baseStyles = {
      borderRadius: '8px',
      padding: showMobileLayout ? '12px' : '8px',
      minWidth: showMobileLayout ? '44px' : 'auto',
      minHeight: showMobileLayout ? '44px' : 'auto',
      transition: performanceLevel === 'low' ? 'none' : 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
      color: isDarkMode ? '#e8eaed' : '#5f6368',
      '&:hover': {
        backgroundColor: isDarkMode
          ? 'rgba(138, 180, 248, 0.08)'
          : 'rgba(26, 115, 232, 0.08)',
        color: isDarkMode ? '#8ab4f8' : '#1a73e8',
        transform: performanceLevel === 'low' ? 'none' : 'translateY(-1px)',
      },
      '&:active': {
        transform: showMobileLayout ? 'scale(0.95)' : 'translateY(0)',
      }
    };

    return mobileStyles.getMobileStyles(baseStyles);
  };

  // 创建Apple风格应用项样式
  const createAppleAppItem = () => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: isDarkMode 
        ? 'rgba(138, 180, 248, 0.08)' 
        : 'rgba(26, 115, 232, 0.08)',
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: isDarkMode 
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    '&:active': {
      transform: 'translateY(0) scale(1)',
    }
  });

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          ...createDynamicNavbarGlass(),
          boxShadow: "none",
          zIndex: theme.zIndex.appBar + 100, // 确保足够高的层级
          top: 0,
          left: 0,
          right: 0,
          "& .MuiToolbar-root": {
            backgroundColor: "transparent",
            width: "100%",
            minHeight: showMobileLayout ? '56px' : '64px',
            padding: showMobileLayout ? '0 16px' : '0 24px',
          },
          // 移动端优化
          ...(showMobileLayout && {
            height: '56px',
            '& .MuiToolbar-root': {
              minHeight: '56px !important',
              height: '56px',
            }
          })
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              onClick={openDrawer}
              sx={{ 
                display: { xs: 'block', md: 'none' },
                ...createAppleIconButton()
              }}
            >
              <MenuIcon />
            </IconButton>
            <IconButton
              component={Link}
              to="/"
              sx={{ 
                "&:hover": { backgroundColor: "transparent" },
                borderRadius: '12px',
                padding: '8px 12px',
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
              }}
            >
              <FlightIcon sx={{ 
                color: '#4285f4', 
                mr: 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
              }} />
              <Typography
                variant="h6"
                sx={{
                  color: isDarkMode ? '#e8eaed' : '#202124',
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'block' },
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  letterSpacing: '-0.02em',
                }}
              >
                Ticketradar
              </Typography>
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1, md: 1.5 },
            }}
          >
            <Box sx={{ ...createAppleIconButton() }}>
              <ThemeToggle size="medium" />
            </Box>

            <Box sx={{ ...createAppleIconButton() }}>
              <LanguageSwitcher />
            </Box>

            <Tooltip
              title={t('nav.ticketradarApps', 'Ticketradar 应用')}
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              <IconButton
                onClick={handleAppsMenuOpen}
                sx={createAppleIconButton()}
              >
                <AppsIcon />
              </IconButton>
            </Tooltip>
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" sx={{
                  color: isDarkMode ? '#e8eaed' : '#5f6368',
                  fontWeight: 500,
                  display: { xs: 'none', sm: 'block' },
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}>
                  {t('dashboard.welcome')}, {user?.username}
                </Typography>
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{ 
                    p: 0,
                    borderRadius: '50%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: isDarkMode 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }
                  }}
                >
                  <Avatar sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: 'primary.main',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={createAppleButton('outlined')}
                >
                  {t('nav.login')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/register')}
                  sx={createAppleButton('contained')}
                >
                  {t('nav.register')}
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* 为固定导航栏添加占位空间 */}
      <Box sx={{ height: '64px' }} />

      {/* Ticketradar Apps 菜单 - 应用玻璃效果 */}
      <Menu
        anchorEl={appsMenuAnchor}
        open={Boolean(appsMenuAnchor)}
        onClose={handleAppsMenuClose}
        onClick={handleAppsMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            ...createAppleGlass('secondary', themeMode),
            overflow: 'visible',
            mt: 1.5,
            minWidth: 280,
            borderRadius: '16px',
            border: isDarkMode 
              ? '0.5px solid rgba(255, 255, 255, 0.1)' 
              : '0.5px solid rgba(0, 0, 0, 0.08)',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 20,
              width: 12,
              height: 12,
              bgcolor: isDarkMode ? 'rgba(16, 16, 16, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              border: isDarkMode 
                ? '0.5px solid rgba(255, 255, 255, 0.1)' 
                : '0.5px solid rgba(0, 0, 0, 0.08)',
              borderBottom: 'none',
              borderRight: 'none',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ 
            mb: 2,
            color: isDarkMode ? '#e8eaed' : '#202124',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}>
            {t('nav.ticketradarApps', 'Ticketradar 应用')}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box
              onClick={() => handleAppNavigation('/')}
              sx={createAppleAppItem()}
            >
              <FlightIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
              <Typography variant="caption" textAlign="center" sx={{ 
                fontWeight: 500,
                color: isDarkMode ? '#e8eaed' : '#202124',
              }}>
                {t('nav.flights', '航班搜索')}
              </Typography>
            </Box>

            <Box
              onClick={() => handleAppNavigation('/monitor')}
              sx={createAppleAppItem()}
            >
              <Box sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }}>📊</Box>
              <Typography variant="caption" textAlign="center" sx={{ 
                fontWeight: 500,
                color: isDarkMode ? '#e8eaed' : '#202124',
              }}>
                {t('nav.monitor', '价格监控')}
              </Typography>
            </Box>

            <Box
              onClick={() => handleAppNavigation('/dashboard')}
              sx={createAppleAppItem()}
            >
              <DashboardIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
              <Typography variant="caption" textAlign="center" sx={{ 
                fontWeight: 500,
                color: isDarkMode ? '#e8eaed' : '#202124',
              }}>
                {t('nav.dashboard', '我的面板')}
              </Typography>
            </Box>

            <Box
              onClick={() => handleAppNavigation('/ai-travel')}
              sx={createAppleAppItem()}
            >
              <Box sx={{ fontSize: 32, color: 'warning.main', mb: 1 }}>🤖</Box>
              <Typography variant="caption" textAlign="center" sx={{ 
                fontWeight: 500,
                color: isDarkMode ? '#e8eaed' : '#202124',
              }}>
                {t('nav.aiTravel', 'AI旅行助手')}
              </Typography>
            </Box>

            {isAuthenticated && (
              <Box
                onClick={() => handleAppNavigation('/my-travel-plans')}
                sx={createAppleAppItem()}
              >
                <Box sx={{ fontSize: 32, color: 'success.main', mb: 1 }}>📋</Box>
                <Typography variant="caption" textAlign="center" sx={{ 
                  fontWeight: 500,
                  color: isDarkMode ? '#e8eaed' : '#202124',
                }}>
                  {t('nav.myTravelPlans', '我的计划')}
                </Typography>
              </Box>
            )}

            {isAdmin() && (
              <Box
                onClick={() => handleAppNavigation('/admin')}
                sx={createAppleAppItem()}
              >
                <AdminPanelSettingsIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                <Typography variant="caption" textAlign="center" sx={{ 
                  fontWeight: 500,
                  color: isDarkMode ? '#e8eaed' : '#202124',
                }}>
                  {t('nav.admin', '管理后台')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Menu>

      {/* 用户菜单 - 应用玻璃效果 */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            ...createAppleGlass('secondary', themeMode),
            overflow: 'visible',
            mt: 1.5,
            minWidth: 200,
            borderRadius: '12px',
            border: isDarkMode 
              ? '0.5px solid rgba(255, 255, 255, 0.1)' 
              : '0.5px solid rgba(0, 0, 0, 0.08)',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: isDarkMode ? 'rgba(16, 16, 16, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              border: isDarkMode 
                ? '0.5px solid rgba(255, 255, 255, 0.1)' 
                : '0.5px solid rgba(0, 0, 0, 0.08)',
              borderBottom: 'none',
              borderRight: 'none',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => navigate('/dashboard')}
          sx={{
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDarkMode 
                ? 'rgba(138, 180, 248, 0.08)' 
                : 'rgba(26, 115, 232, 0.08)',
              transform: 'translateX(4px)',
            }
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('nav.dashboard')}</ListItemText>
        </MenuItem>

        <MenuItem 
          onClick={() => navigate('/my-travel-plans')}
          sx={{
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDarkMode 
                ? 'rgba(138, 180, 248, 0.08)' 
                : 'rgba(26, 115, 232, 0.08)',
              transform: 'translateX(4px)',
            }
          }}
        >
          <ListItemIcon>
            <Box sx={{ fontSize: 16 }}>📋</Box>
          </ListItemIcon>
          <ListItemText>{t('nav.myTravelPlans', '我的旅行计划')}</ListItemText>
        </MenuItem>

        <MenuItem 
          onClick={() => navigate('/profile')}
          sx={{
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDarkMode 
                ? 'rgba(138, 180, 248, 0.08)' 
                : 'rgba(26, 115, 232, 0.08)',
              transform: 'translateX(4px)',
            }
          }}
        >
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('nav.profile')}</ListItemText>
        </MenuItem>

        {isAdmin() && (
          <>
            <MenuItem 
              onClick={() => navigate('/admin')}
              sx={{
                borderRadius: '8px',
                mx: 1,
                my: 0.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: isDarkMode 
                    ? 'rgba(138, 180, 248, 0.08)' 
                    : 'rgba(26, 115, 232, 0.08)',
                  transform: 'translateX(4px)',
                }
              }}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('nav.admin')}</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => navigate('/admin/monitor-settings')}
              sx={{
                borderRadius: '8px',
                mx: 1,
                my: 0.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: isDarkMode 
                    ? 'rgba(138, 180, 248, 0.08)' 
                    : 'rgba(26, 115, 232, 0.08)',
                  transform: 'translateX(4px)',
                }
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('nav.monitorSettings')}</ListItemText>
            </MenuItem>
          </>
        )}

        <Divider sx={{ my: 1, mx: 1 }} />

        <MenuItem 
          onClick={handleLogout}
          sx={{
            borderRadius: '8px',
            mx: 1,
            my: 0.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.08)',
              color: 'error.main',
              transform: 'translateX(4px)',
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('nav.logout')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* 移动端抽屉 */}
      <MobileDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
      />
    </>
  );
};

export default Navbar;
