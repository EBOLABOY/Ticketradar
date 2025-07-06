import React from 'react';
import {
  IconButton,
  Tooltip,
  useTheme as useMuiTheme,
  alpha,
  Box
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  Brightness4
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle = ({ variant = 'icon', size = 'medium' }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { t } = useTranslation();

  const handleToggle = () => {
    toggleTheme();
  };

  if (variant === 'button') {
    return (
      <Box
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
          '&:hover': {
            backgroundColor: alpha(muiTheme.palette.primary.main, 0.2),
            transform: 'translateY(-1px)',
          }
        }}
      >
        {isDarkMode ? (
          <LightMode sx={{ color: muiTheme.palette.primary.main }} />
        ) : (
          <DarkMode sx={{ color: muiTheme.palette.primary.main }} />
        )}
        <Box sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
          {isDarkMode ? t('theme.lightMode', '浅色模式') : t('theme.darkMode', '暗色模式')}
        </Box>
      </Box>
    );
  }

  return (
    <Tooltip 
      title={isDarkMode ? t('theme.switchToLight', '切换到浅色模式') : t('theme.switchToDark', '切换到暗色模式')}
      arrow
    >
      <IconButton
        onClick={handleToggle}
        size={size}
        sx={{
          transition: 'all 0.3s ease',
          backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
          '&:hover': {
            backgroundColor: alpha(muiTheme.palette.primary.main, 0.2),
            transform: 'rotate(180deg)',
          },
          '& .MuiSvgIcon-root': {
            transition: 'all 0.3s ease',
          }
        }}
      >
        {isDarkMode ? (
          <LightMode sx={{ color: muiTheme.palette.warning.main }} />
        ) : (
          <DarkMode sx={{ color: muiTheme.palette.primary.main }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

// 高级主题切换器，带动画效果
export const AnimatedThemeToggle = ({ size = 'medium' }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { t } = useTranslation();

  return (
    <Tooltip 
      title={isDarkMode ? t('theme.switchToLight', '切换到浅色模式') : t('theme.switchToDark', '切换到暗色模式')}
      arrow
    >
      <IconButton
        onClick={toggleTheme}
        size={size}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          backgroundColor: alpha(muiTheme.palette.primary.main, 0.1),
          '&:hover': {
            backgroundColor: alpha(muiTheme.palette.primary.main, 0.2),
            transform: 'scale(1.1)',
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, ${alpha(muiTheme.palette.primary.main, 0.1)}, ${alpha(muiTheme.palette.secondary.main, 0.1)})`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover:before': {
            opacity: 1,
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.5s ease',
            transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <Brightness4 
            sx={{ 
              color: isDarkMode ? muiTheme.palette.warning.main : muiTheme.palette.primary.main,
              transition: 'color 0.3s ease',
            }} 
          />
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
