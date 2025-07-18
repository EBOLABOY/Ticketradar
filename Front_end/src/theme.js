import { createTheme } from "@mui/material";

// 移动端断点配置
export const mobileBreakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 768,
    lg: 1024,
    xl: 1280,
    // 移动端特定断点
    mobile: 480,
    tablet: 768,
    desktop: 1024,
  },
};

// 移动端字体配置
export const getMobileTypography = (isMobile = false) => ({
  fontFamily: [
    '"Google Sans Display"',
    '"Roboto"',
    '"Helvetica"',
    '"Arial"',
    'sans-serif'
  ].join(','),
  h1: {
    fontWeight: 700,
    fontSize: isMobile ? '2rem' : '2.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontWeight: 600,
    fontSize: isMobile ? '1.75rem' : '2rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontWeight: 600,
    fontSize: isMobile ? '1.375rem' : '1.5rem',
    lineHeight: 1.4,
  },
  h4: {
    fontWeight: 500,
    fontSize: isMobile ? '1.125rem' : '1.25rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 500,
    fontSize: isMobile ? '1rem' : '1.125rem',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 500,
    fontSize: isMobile ? '0.875rem' : '1rem',
    lineHeight: 1.4,
  },
  body1: {
    fontSize: isMobile ? '14px' : '1rem', // 移动端使用px防止缩放
    lineHeight: 1.6,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: isMobile ? '12px' : '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.01071em',
  },
  button: {
    fontWeight: 500,
    fontSize: isMobile ? '14px' : '0.875rem',
    textTransform: 'none',
    letterSpacing: '0.02857em',
  },
  caption: {
    fontSize: isMobile ? '11px' : '0.75rem',
    lineHeight: 1.4,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontSize: isMobile ? '11px' : '0.75rem',
    fontWeight: 500,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
});

// Apple风格动画缓动函数
export const appleEasing = {
  // Apple标准缓动函数
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  // Apple特有的弹性缓动
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// 玻璃效果配置
const glassEffectConfig = {
  light: {
    primary: {
      backdrop: 'rgba(255, 255, 255, 0.8)',
      blur: '20px',
      saturate: '180%',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
      innerShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
    },
    secondary: {
      backdrop: 'rgba(255, 255, 255, 0.7)',
      blur: '16px',
      saturate: '160%',
      border: 'rgba(255, 255, 255, 0.15)',
      shadow: '0 4px 16px rgba(31, 38, 135, 0.25)',
      innerShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    },
    tertiary: {
      backdrop: 'rgba(255, 255, 255, 0.6)',
      blur: '12px',
      saturate: '140%',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 2px 8px rgba(31, 38, 135, 0.15)',
      innerShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    },
  },
  dark: {
    primary: {
      backdrop: 'rgba(16, 16, 16, 0.8)',
      blur: '20px',
      saturate: '180%',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      innerShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    },
    secondary: {
      backdrop: 'rgba(16, 16, 16, 0.7)',
      blur: '16px',
      saturate: '160%',
      border: 'rgba(255, 255, 255, 0.08)',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      innerShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    },
    tertiary: {
      backdrop: 'rgba(16, 16, 16, 0.6)',
      blur: '12px',
      saturate: '140%',
      border: 'rgba(255, 255, 255, 0.05)',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      innerShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    },
  },
};

// 玻璃效果生成器工具函数
export const createGlassEffect = (level = 'primary', mode = 'light') => {
  const config = glassEffectConfig[mode][level];
  return {
    background: config.backdrop,
    backdropFilter: `blur(${config.blur}) saturate(${config.saturate})`,
    WebkitBackdropFilter: `blur(${config.blur}) saturate(${config.saturate})`,
    border: `0.5px solid ${config.border}`,
    boxShadow: `${config.shadow}, ${config.innerShadow}`,
    borderRadius: '12px',
    transition: `all 0.3s ${appleEasing.standard}`,
  };
};

export const lightTheme = createTheme({
  breakpoints: mobileBreakpoints,
  typography: getMobileTypography(),
  palette: {
    mode: "light",
    primary: {
      main: "#1a73e8",
      light: "#4285f4",
      dark: "#1557b0",
    },
    secondary: {
      main: "#34a853",
      light: "#5bb974",
      dark: "#137333",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#202124",
      secondary: "#5f6368",
    },
    mainColors: {
      default: "#ffffff",
      text: "#202124",
      secondary: "#f8f9fa",
      secondaryText: "#5f6368",
      btnColor: "#1a73e8",
      border: "#dadce0",
      mainBlue: "#1a73e8",
    },
    // Apple风格玻璃效果配置
    glass: glassEffectConfig.light,
  },
  // Apple风格动画配置
  transitions: {
    easing: appleEasing,
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: `background-color 0.3s ${appleEasing.standard}, color 0.3s ${appleEasing.standard}`,
          // 支持玻璃效果的基础样式
          '& *': {
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
          },
          '& *::-webkit-scrollbar': {
            width: '6px',
          },
          '& *::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '& *::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(155, 155, 155, 0.5)',
            borderRadius: '20px',
            border: 'transparent',
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  breakpoints: mobileBreakpoints,
  typography: getMobileTypography(),
  palette: {
    mode: "dark",
    primary: {
      main: "#8ab4f8",
      light: "#aecbfa",
      dark: "#669df6",
    },
    secondary: {
      main: "#81c995",
      light: "#a8dab5",
      dark: "#5bb974",
    },
    background: {
      default: "#202124",
      paper: "#303134",
    },
    text: {
      primary: "#e8eaed",
      secondary: "#9aa0a6",
    },
    mainColors: {
      default: "#202124",
      text: "#e8eaed",
      secondary: "#303134",
      secondaryText: "#9aa0a6",
      btnColor: "#8ab4f8",
      border: "#5f6368",
      mainBlue: "#8ab4f8",
    },
    // Apple风格玻璃效果配置
    glass: glassEffectConfig.dark,
  },
  // Apple风格动画配置
  transitions: {
    easing: appleEasing,
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: `background-color 0.3s ${appleEasing.standard}, color 0.3s ${appleEasing.standard}`,
          // 支持玻璃效果的基础样式
          '& *': {
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent',
          },
          '& *::-webkit-scrollbar': {
            width: '6px',
          },
          '& *::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '& *::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(155, 155, 155, 0.5)',
            borderRadius: '20px',
            border: 'transparent',
          },
        },
      },
    },
  },
});
