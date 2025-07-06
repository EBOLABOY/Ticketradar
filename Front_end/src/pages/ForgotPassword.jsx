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
  InputAdornment
} from '@mui/material';
import {
  Email,
  LockReset,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authApi, apiUtils } from '../services/backendApi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authApi.forgotPassword(email);
      setSuccess('重置密码链接已发送到您的邮箱，请查收');
    } catch (err) {
      const errorInfo = apiUtils.handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

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
        {/* 返回按钮 */}
        <Box mb={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/login')}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            返回登录
          </Button>
        </Box>

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
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              mb: 2
            }}
          >
            <LockReset sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight="600" color="primary" gutterBottom>
            忘记密码
          </Typography>
          <Typography variant="body1" color="text.secondary">
            输入您的邮箱地址，我们将发送重置密码链接
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

        {/* 表单 */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="email"
            type="email"
            label="邮箱地址"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
              if (success) setSuccess('');
            }}
            required
            sx={{ mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            helperText="请输入您注册时使用的邮箱地址"
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
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',
              }
            }}
          >
            {loading ? '发送中...' : '发送重置链接'}
          </Button>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" mb={2}>
              记起密码了？
            </Typography>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 500 }}
            >
              返回登录
            </Link>
          </Box>
        </Box>

        {/* 帮助信息 */}
        <Box mt={4} p={3} sx={{ backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>提示：</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 请检查垃圾邮件文件夹<br/>
            • 重置链接有效期为24小时<br/>
            • 如果仍未收到邮件，请联系客服
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
