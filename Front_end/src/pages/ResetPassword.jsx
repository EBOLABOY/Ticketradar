import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, apiUtils } from '../services/backendApi';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('重置链接无效或已过期');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码长度至少6位');
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
      await authApi.resetPassword(token, formData.password);
      setSuccess('密码重置成功！正在跳转到登录页面...');
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

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <Alert severity="error">
            重置链接无效或已过期，请重新申请密码重置
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/forgot-password')}
            sx={{ mt: 2 }}
          >
            重新申请
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.08)'
        }}
      >
        {/* 头部 */}
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              mb: 2
            }}
          >
            <Lock sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight="600" color="primary" gutterBottom>
            重置密码
          </Typography>
          <Typography variant="body1" color="text.secondary">
            请输入您的新密码
          </Typography>
        </Box>

        {/* 错误/成功提示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} icon={<CheckCircle />}>
            {success}
          </Alert>
        )}

        {/* 重置表单 */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="新密码"
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
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
            helperText="密码长度至少6位"
          />

          <TextField
            fullWidth
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            label="确认新密码"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            sx={{ mb: 4 }}
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || success}
            sx={{
              py: 1.5,
              mb: 3,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
              }
            }}
          >
            {loading ? '重置中...' : '重置密码'}
          </Button>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              记起密码了？{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
              >
                返回登录
              </Button>
            </Typography>
          </Box>
        </Box>

        {/* 安全提示 */}
        <Box mt={4} p={3} sx={{ backgroundColor: '#e8f5e8', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>安全提示：</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 请使用强密码，包含字母、数字和特殊字符<br/>
            • 不要使用与其他网站相同的密码<br/>
            • 定期更换密码以保护账户安全
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
