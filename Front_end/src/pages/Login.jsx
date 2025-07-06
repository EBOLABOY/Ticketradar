import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  alpha
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  PersonAdd,
  Flight
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiUtils } from '../services/backendApi';
import { useUser } from '../contexts/UserContext';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { useNotification } from '../hooks/useNotification';
import { createAppleGlass, createGlassButton } from '../utils/glassmorphism';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useUser();
  const { isDarkMode } = useCustomTheme();
  const { handleApiError, notifySuccess } = useNotification();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 获取玻璃效果样式
  const glassStyle = createAppleGlass('primary', isDarkMode ? 'dark' : 'light');
  const buttonGlassStyle = createGlassButton(isDarkMode ? 'dark' : 'light');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData);

      if (result.success) {
        // 登录成功通知
        notifySuccess(t('auth.welcomeBack'), t('auth.loginSuccess'));
        // 跳转到仪表板
        navigate('/dashboard');
      } else {
        setError(result.error);
        handleApiError({ message: result.error }, t('auth.loginFailed'));
      }
    } catch (err) {
      handleApiError(err, t('auth.loginFailed'));
      const errorInfo = apiUtils.handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isDarkMode
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #667eea 100%)',
        backgroundImage: isDarkMode ? `
          radial-gradient(circle at 20% 80%, ${alpha('#7877c6', 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha('#ff77c6', 0.1)} 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, ${alpha('#77dbff', 0.08)} 0%, transparent 50%)
        ` : `
          radial-gradient(circle at 20% 80%, ${alpha('#667eea', 0.3)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha('#764ba2', 0.2)} 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, ${alpha('#f093fb', 0.15)} 0%, transparent 50%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            ...glassStyle,
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDarkMode
                ? '0 20px 40px rgba(0,0,0,0.4)'
                : '0 20px 40px rgba(0,0,0,0.1)'
            }
          }}
        >
        {/* 头部 */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
              mb: 3,
              boxShadow: '0 8px 32px rgba(26, 115, 232, 0.3)'
            }}
          >
            <Flight sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography
            variant="h3"
            fontWeight="300"
            sx={{
              background: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1
            }}
          >
            {t('auth.login')}
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="400">
            Ticketradar
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {t('auth.loginSuccess')}
          </Typography>
        </Box>

        {/* 错误提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* 登录表单 */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="username"
            type="text"
            label={t('auth.username')}
            value={formData.username}
            onChange={handleChange}
            required
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#1a73e8',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a73e8',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            name="password"
            type={showPassword ? 'text' : 'password'}
            label={t('auth.password')}
            value={formData.password}
            onChange={handleChange}
            required
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#1a73e8',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1a73e8',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 3,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              ...buttonGlassStyle,
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(26, 115, 232, 0.8) 0%, rgba(52, 168, 83, 0.8) 100%)'
                : 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
              '&:hover': {
                ...buttonGlassStyle['&:hover'],
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(21, 87, 176, 0.9) 0%, rgba(46, 125, 50, 0.9) 100%)'
                  : 'linear-gradient(135deg, #1557b0 0%, #2e7d32 100%)',
                transform: 'translateY(-2px) scale(1.02)'
              },
              '&:disabled': {
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? t('common.loading') : t('auth.login')}
          </Button>

          <Box textAlign="center">
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/forgot-password')}
              sx={{
                mb: 2,
                display: 'block',
                color: '#1a73e8',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {t('auth.forgotPassword')}
            </Link>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('common.or', 'or')}
              </Typography>
            </Divider>

            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                {t('auth.dontHaveAccount')}
              </Typography>
              <Button
                variant="text"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                sx={{
                  textTransform: 'none',
                  color: '#1a73e8',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: alpha('#1a73e8', 0.08)
                  }
                }}
              >
                {t('auth.register')}
              </Button>
            </Box>
          </Box>
        </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
