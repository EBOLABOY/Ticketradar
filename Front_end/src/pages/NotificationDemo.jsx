import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  CloudUpload,
  Delete,
  Save
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNotification } from '../hooks/useNotification';
import { createAppleGlass } from '../utils/glassmorphism';

const NotificationDemo = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    success,
    error,
    warning,
    info,
    loading,
    handleApiError,
    handleValidationErrors,
    notifyOperationSuccess,
    handleNetworkError,
    clearNotifications
  } = useNotification();

  // 基础通知演示
  const showBasicNotifications = () => {
    success('操作完成！数据已成功保存到服务器。');
    setTimeout(() => error('发生错误！无法连接到服务器，请检查网络连接。'), 1000);
    setTimeout(() => warning('注意！您的会话即将过期，请及时保存数据。'), 2000);
    setTimeout(() => info('提示：新功能已上线，点击查看详情。'), 3000);
  };

  // 带标题的通知
  const showTitledNotifications = () => {
    success('所有文件已成功上传', { title: '上传完成' });
    setTimeout(() => error('权限不足，无法执行此操作', { title: '访问被拒绝' }), 1000);
    setTimeout(() => warning('检测到异常登录，请确认是否为本人操作', { title: '安全警告' }), 2000);
  };

  // 加载通知演示
  const showLoadingNotification = () => {
    const loadingId = loading('正在处理您的请求，请稍候...', { title: '处理中' });
    
    setTimeout(() => {
      clearNotifications();
      success('处理完成！', { title: '成功' });
    }, 3000);
  };

  // API错误处理演示
  const showApiErrorHandling = () => {
    // 模拟不同类型的API错误
    const errors = [
      { response: { status: 400, data: { detail: '请求参数格式错误' } } },
      { response: { status: 401, data: { detail: '登录已过期，请重新登录' } } },
      { response: { status: 403, data: { detail: '您没有权限执行此操作' } } },
      { response: { status: 404, data: { detail: '请求的资源不存在' } } },
      { response: { status: 500, data: { detail: '服务器内部错误' } } }
    ];

    errors.forEach((error, index) => {
      setTimeout(() => handleApiError(error), index * 800);
    });
  };

  // 表单验证错误演示
  const showValidationErrors = () => {
    const validationErrors = [
      '用户名不能为空',
      '密码长度至少6位',
      '邮箱格式不正确'
    ];

    handleValidationErrors(validationErrors);
  };

  // 操作成功通知演示
  const showOperationSuccess = () => {
    const operations = ['create', 'update', 'delete', 'save', 'login'];
    
    operations.forEach((op, index) => {
      setTimeout(() => notifyOperationSuccess(op), index * 600);
    });
  };

  // 网络错误演示
  const showNetworkErrors = () => {
    const networkErrors = [
      { code: 'NETWORK_ERROR', message: 'Network Error' },
      { code: 'TIMEOUT', message: 'Request timeout' },
      { message: 'Connection failed' }
    ];

    networkErrors.forEach((error, index) => {
      setTimeout(() => handleNetworkError(error), index * 1000);
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        sx={{
          ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
          borderRadius: '24px',
          p: 4,
          mb: 4
        }}
      >
        <Typography variant="h4" fontWeight="700" gutterBottom>
          🔔 通知系统演示
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          测试新的精美通知系统的各种功能和样式
        </Typography>

        <Grid container spacing={3}>
          {/* 基础通知 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                borderRadius: '16px',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  基础通知
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  展示四种基本通知类型
                </Typography>
                <Button
                  variant="contained"
                  onClick={showBasicNotifications}
                  startIcon={<Info />}
                  fullWidth
                  sx={{ borderRadius: '12px' }}
                >
                  显示基础通知
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 带标题通知 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                borderRadius: '16px',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  带标题通知
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  包含标题的详细通知
                </Typography>
                <Button
                  variant="contained"
                  onClick={showTitledNotifications}
                  startIcon={<CheckCircle />}
                  fullWidth
                  sx={{ borderRadius: '12px' }}
                >
                  显示标题通知
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 加载通知 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                borderRadius: '16px',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  加载通知
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  带进度条的加载状态通知
                </Typography>
                <Button
                  variant="contained"
                  onClick={showLoadingNotification}
                  startIcon={<Refresh />}
                  fullWidth
                  sx={{ borderRadius: '12px' }}
                >
                  显示加载通知
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* API错误处理 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                borderRadius: '16px',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  API错误处理
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  智能处理各种HTTP错误状态
                </Typography>
                <Button
                  variant="contained"
                  onClick={showApiErrorHandling}
                  startIcon={<Error />}
                  fullWidth
                  sx={{ borderRadius: '12px' }}
                >
                  模拟API错误
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 表单验证错误 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                borderRadius: '16px',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  表单验证错误
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  处理表单验证失败的情况
                </Typography>
                <Button
                  variant="contained"
                  onClick={showValidationErrors}
                  startIcon={<Warning />}
                  fullWidth
                  sx={{ borderRadius: '12px' }}
                >
                  显示验证错误
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* 操作成功通知 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                borderRadius: '16px',
                height: '100%'
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  操作成功通知
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  标准化的操作成功反馈
                </Typography>
                <Button
                  variant="contained"
                  onClick={showOperationSuccess}
                  startIcon={<Save />}
                  fullWidth
                  sx={{ borderRadius: '12px' }}
                >
                  显示操作成功
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" gap={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={clearNotifications}
            startIcon={<Delete />}
            sx={{ borderRadius: '12px' }}
          >
            清除所有通知
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotificationDemo;
