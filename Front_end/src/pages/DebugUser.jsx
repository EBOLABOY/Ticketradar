import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useUser } from '../contexts/UserContext';

const DebugUser = () => {
  const { user, isAuthenticated, isAdmin } = useUser();

  const handleRefreshUserData = () => {
    // 重新从localStorage加载用户数据
    const storedUserInfo = localStorage.getItem('userInfo');
    const storedToken = localStorage.getItem('authToken');
    
    console.log('Stored userInfo:', storedUserInfo);
    console.log('Stored authToken:', storedToken);
    
    if (storedUserInfo) {
      try {
        const parsedUser = JSON.parse(storedUserInfo);
        console.log('Parsed user:', parsedUser);
      } catch (e) {
        console.error('Error parsing user info:', e);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        用户调试信息
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          认证状态
        </Typography>
        <Typography>
          是否已登录: {isAuthenticated ? '是' : '否'}
        </Typography>
        <Typography>
          是否管理员: {isAdmin() ? '是' : '否'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          用户数据
        </Typography>
        <Box component="pre" sx={{ fontSize: '0.875rem', overflow: 'auto' }}>
          {JSON.stringify(user, null, 2)}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          localStorage 数据
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          userInfo:
        </Typography>
        <Box component="pre" sx={{ fontSize: '0.875rem', overflow: 'auto', mb: 2 }}>
          {localStorage.getItem('userInfo') || 'null'}
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          authToken:
        </Typography>
        <Box component="pre" sx={{ fontSize: '0.875rem', overflow: 'auto' }}>
          {localStorage.getItem('authToken') || 'null'}
        </Box>
      </Paper>

      <Button variant="contained" onClick={handleRefreshUserData}>
        刷新用户数据到控制台
      </Button>
    </Container>
  );
};

export default DebugUser;
