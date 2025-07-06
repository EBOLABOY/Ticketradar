import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import { createAppleGlass, createGlassButton, createGlassCard } from '../utils/glassmorphism';

/**
 * Apple风格玻璃效果演示组件
 * 用于测试和展示玻璃形态效果的实现
 */
const GlassEffectDemo = () => {
  const { theme } = useTheme();

  // 创建不同级别的玻璃效果样式
  const primaryGlassStyle = createAppleGlass('primary', theme);
  const secondaryGlassStyle = createAppleGlass('secondary', theme);
  const tertiaryGlassStyle = createAppleGlass('tertiary', theme);
  const navbarGlassStyle = createAppleGlass('navbar', theme);
  
  const glassButtonStyle = createGlassButton(theme);
  const glassCardStyle = createGlassCard(theme);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme === 'light' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Typography 
        variant="h3" 
        sx={{ 
          color: 'white', 
          textAlign: 'center', 
          fontWeight: 700,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        Apple风格液态玻璃效果演示
      </Typography>

      {/* 导航栏玻璃效果 */}
      <Box
        sx={{
          ...navbarGlassStyle,
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          导航栏玻璃效果
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" className="glass-button">首页</Button>
          <Button size="small" className="glass-button">关于</Button>
          <Button size="small" className="glass-button">联系</Button>
        </Box>
      </Box>

      {/* 主要玻璃效果卡片 */}
      <Box
        sx={{
          ...primaryGlassStyle,
          padding: 3,
          maxWidth: 600,
          margin: '0 auto',
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 600 }}>
          主要玻璃效果 (Primary)
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2, opacity: 0.8 }}>
          这是使用主要级别玻璃效果的卡片。具有最强的模糊效果和最高的透明度，
          适用于重要的UI元素如模态框、主要面板等。
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            sx={glassButtonStyle}
          >
            玻璃按钮
          </Button>
          <Button 
            variant="outlined" 
            className="glass-button glass-secondary"
          >
            次要按钮
          </Button>
        </Box>
      </Box>

      {/* 次要玻璃效果网格 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 3,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <Card sx={glassCardStyle}>
          <CardContent>
            <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 600 }}>
              次要玻璃卡片
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              适中的模糊效果，适用于内容卡片、侧边栏等次要UI元素。
              具有良好的可读性和视觉层次感。
            </Typography>
          </CardContent>
        </Card>

        <Box sx={tertiaryGlassStyle}>
          <Box sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 600 }}>
              三级玻璃效果
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              轻微的模糊效果，适用于悬浮提示、小组件等辅助性UI元素。
              保持内容清晰的同时提供微妙的视觉效果。
            </Typography>
          </Box>
        </Box>

        <Box sx={secondaryGlassStyle}>
          <Box sx={{ padding: 2 }}>
            <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 600 }}>
              交互演示
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2, opacity: 0.7 }}>
              悬停和点击这些元素来体验Apple风格的交互动画效果。
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                className="glass-button glass-primary"
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                悬停效果按钮
              </Button>
              <Button 
                className="glass-button glass-secondary"
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                点击效果按钮
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 浏览器兼容性信息 */}
      <Box
        sx={{
          ...tertiaryGlassStyle,
          padding: 2,
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: 600 }}>
          浏览器兼容性信息
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          当前浏览器支持状态：
          {typeof window !== 'undefined' && (
            <>
              <br />• Backdrop Filter: {CSS.supports('backdrop-filter', 'blur(1px)') ? '✅ 支持' : '❌ 不支持（使用降级方案）'}
              <br />• WebKit Backdrop Filter: {CSS.supports('-webkit-backdrop-filter', 'blur(1px)') ? '✅ 支持' : '❌ 不支持'}
              <br />• 硬件加速: ✅ 已启用
            </>
          )}
        </Typography>
      </Box>

      {/* 性能提示 */}
      <Box
        sx={{
          ...primaryGlassStyle,
          padding: 2,
          maxWidth: 600,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          💡 提示：玻璃效果会根据设备性能自动调整。移动设备和低性能设备将使用优化版本以确保流畅体验。
        </Typography>
      </Box>
    </Box>
  );
};

export default GlassEffectDemo;