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
  FormControlLabel,
  Checkbox,
  alpha
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Login as LoginIcon,
  Flight
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi, apiUtils } from '../services/backendApi';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { createAppleGlass, createGlassButton } from '../utils/glassmorphism';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useCustomTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 获取玻璃效果样式
  const glassStyle = createAppleGlass('primary', isDarkMode ? 'dark' : 'light');
  const buttonGlassStyle = createGlassButton(isDarkMode ? 'dark' : 'light');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('auth.passwordRequired'));
      return false;
    }
    if (!formData.agreeTerms) {
      setError(t('auth.agreeTerms', 'Please agree to the terms and privacy policy'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        invite_code: formData.inviteCode
      });

      setSuccess(t('auth.registerSuccess'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
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
              background: 'linear-gradient(135deg, #34a853 0%, #1a73e8 100%)',
              mb: 3,
              boxShadow: '0 8px 32px rgba(52, 168, 83, 0.3)'
            }}
          >
            <Flight sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography
            variant="h3"
            fontWeight="300"
            sx={{
              background: 'linear-gradient(135deg, #34a853 0%, #1a73e8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1
            }}
          >
            {t('auth.createAccount')}
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="400">
            Ticketradar
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {t('auth.registerSuccess')}
          </Typography>
        </Box>

        {/* 错误/成功提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* 注册表单 */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="username"
            label={t('auth.username')}
            value={formData.username}
            onChange={handleChange}
            required
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#34a853',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#34a853',
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
            name="email"
            type="email"
            label={t('auth.email')}
            value={formData.email}
            onChange={handleChange}
            required
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#34a853',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#34a853',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
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
                  borderColor: '#34a853',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#34a853',
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

          <TextField
            fullWidth
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label={t('auth.confirmPassword')}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#34a853',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#34a853',
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            name="inviteCode"
            label={t('auth.inviteCode', 'Invite Code (Optional)')}
            value={formData.inviteCode}
            onChange={handleChange}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: '#34a853',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#34a853',
                }
              }
            }}
            helperText={t('auth.inviteCodeHelper', 'Enter invite code for additional benefits')}
          />

          <FormControlLabel
            control={
              <Checkbox
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                {t('auth.agreeToTerms', 'I agree to the')} <Link href="#" underline="hover">{t('auth.termsOfService', 'Terms of Service')}</Link> {t('common.and', 'and')} <Link href="#" underline="hover">{t('auth.privacyPolicy', 'Privacy Policy')}</Link>
              </Typography>
            }
            sx={{ mb: 3 }}
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
                ? 'linear-gradient(135deg, rgba(52, 168, 83, 0.8) 0%, rgba(26, 115, 232, 0.8) 100%)'
                : 'linear-gradient(135deg, #34a853 0%, #1a73e8 100%)',
              '&:hover': {
                ...buttonGlassStyle['&:hover'],
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.9) 0%, rgba(21, 87, 176, 0.9) 100%)'
                  : 'linear-gradient(135deg, #2e7d32 0%, #1557b0 100%)',
                transform: 'translateY(-2px) scale(1.02)'
              },
              '&:disabled': {
                background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none'
              }
            }}
          >
            {loading ? t('common.loading') : t('auth.createAccount')}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common.or', 'or')}
            </Typography>
          </Divider>

          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {t('auth.alreadyHaveAccount')}
            </Typography>
            <Button
              variant="text"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                color: '#34a853',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: alpha('#34a853', 0.08)
                }
              }}
            >
              {t('auth.login')}
            </Button>
          </Box>
        </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
