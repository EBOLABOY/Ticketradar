import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, apiUtils } from '../services/backendApi';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查用户是否已登录
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      const userData = response.data; // 修正：用户数据在response.data中
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('userInfo', JSON.stringify(userData));
    } catch (error) {
      // Token可能已过期，清除本地存储
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      // authApi.login 已经保存了 token 和 userInfo 到 localStorage
      // 这里只需要更新 React 状态
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (error) {
      const errorInfo = apiUtils.handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      return { success: true, data: response };
    } catch (error) {
      const errorInfo = apiUtils.handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  };

  // 登出
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
    }
  };

  // 更新用户信息
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('userInfo', JSON.stringify({ ...user, ...userData }));
  };

  // 检查是否是管理员
  const isAdmin = () => {
    return user?.is_admin || user?.isAdmin || user?.role === 'admin';
  };

  // 忘记密码
  const forgotPassword = async (email) => {
    try {
      const response = await authApi.forgotPassword(email);
      return { success: true, data: response };
    } catch (error) {
      const errorInfo = apiUtils.handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  };

  // 重置密码
  const resetPassword = async (token, password) => {
    try {
      const response = await authApi.resetPassword(token, password);
      return { success: true, data: response };
    } catch (error) {
      const errorInfo = apiUtils.handleApiError(error);
      return { success: false, error: errorInfo.message };
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    forgotPassword,
    resetPassword,
    checkAuthStatus
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
