import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useUser();

  // 如果用户数据还在加载中，显示加载状态
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // 如果需要认证但用户未登录，跳转到登录页
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果需要管理员权限但用户不是管理员，跳转到首页
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // 如果用户已登录但访问登录/注册页面，跳转到仪表板
  if (!requireAuth && isAuthenticated &&
      (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
