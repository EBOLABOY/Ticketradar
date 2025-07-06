import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

/**
 * 主题感知图片组件
 * 根据当前主题自动切换图片
 */
const ThemeAwareImage = ({
  lightSrc,
  darkSrc,
  alt = '',
  sx = {},
  style = {},
  className = '',
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const imageSrc = useMemo(
    () => (isDarkMode ? darkSrc : lightSrc),
    [isDarkMode, darkSrc, lightSrc]
  );

  const defaultStyle = {
    transition: 'opacity 0.3s ease',
    maxWidth: '100%',
    height: 'auto',
    ...style
  };

  return (
    <Box
      component="img"
      src={imageSrc}
      alt={alt}
      className={className}
      sx={{
        transition: 'all 0.3s ease',
        ...sx
      }}
      style={defaultStyle}
      {...props}
    />
  );
};

/**
 * 背景图片版本的主题感知组件
 */
export const ThemeAwareBackground = ({
  lightSrc,
  darkSrc,
  children,
  sx = {},
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const backgroundImage = useMemo(
    () => `url(${isDarkMode ? darkSrc : lightSrc})`,
    [isDarkMode, darkSrc, lightSrc]
  );

  return (
    <Box
      sx={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.3s ease',
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

/**
 * CSS变量版本的主题感知图片
 * 使用CSS自定义属性来实现主题切换
 */
export const ThemeAwareImageCSS = ({
  lightSrc,
  darkSrc,
  alt = '',
  className = '',
  style = {},
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const cssVariables = useMemo(() => ({
    '--theme-image-light': `url(${lightSrc})`,
    '--theme-image-dark': `url(${darkSrc})`,
    '--theme-image-current': `url(${isDarkMode ? darkSrc : lightSrc})`
  }), [lightSrc, darkSrc, isDarkMode]);

  return (
    <div
      className={`theme-aware-image ${className}`}
      style={{
        ...cssVariables,
        backgroundImage: 'var(--theme-image-current)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        transition: 'background-image 0.3s ease',
        ...style
      }}
      {...props}
    >
      <img
        src={isDarkMode ? darkSrc : lightSrc}
        alt={alt}
        style={{
          opacity: 0,
          width: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default ThemeAwareImage;
