import axios from 'axios';

// 创建axios实例
const backendApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:38181',
  timeout: 300000, // 增加到300秒（5分钟），为AI分析预留更多时间
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 支持session认证
});

// 请求拦截器 - 添加认证token（如果使用JWT）
backendApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
backendApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，清除token并跳转到登录页
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authApi = {
  // 用户登录
  login: async (credentials) => {
    const response = await backendApi.post('/auth/login', credentials);
    // 后端返回JWT token，正确保存到localStorage
    if (response.data.success && response.data.data) {
      const { access_token, user_info } = response.data.data;
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('userInfo', JSON.stringify(user_info));

      // 返回前端期望的格式
      return {
        success: true,
        token: access_token,
        user: user_info,
        message: response.data.message
      };
    }
    return response.data;
  },

  // 用户注册
  register: async (userData) => {
    const response = await backendApi.post('/auth/register', userData);
    return response.data;
  },

  // 忘记密码
  forgotPassword: async (email) => {
    const response = await backendApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  // 重置密码
  resetPassword: async (token, password) => {
    const response = await backendApi.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // 退出登录
  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    const response = await backendApi.post('/auth/logout');
    return response.data;
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await backendApi.get('/auth/me');
    return response.data;
  }
};

// 航班相关API
export const flightApi = {
  // 搜索航班 - 默认使用AI增强搜索 - 需要登录认证
  searchFlights: async (searchParams) => {
    const response = await backendApi.get('/api/flights/search/ai-enhanced', { params: searchParams });
    return response.data;
  },

  // 三阶段综合搜索（不使用AI处理）- 需要登录认证
  searchFlightsComprehensive: async (searchParams) => {
    const response = await backendApi.get('/api/flights/search/comprehensive', { params: searchParams });
    return response.data;
  },

  // 普通航班搜索（仅Google Flights）- 需要登录认证
  searchFlightsBasic: async (searchParams) => {
    const response = await backendApi.get('/api/flights/search', { params: searchParams });
    return response.data;
  },

  // AI增强航班搜索 - 包含用户偏好处理和智能推荐（别名，保持兼容性）
  searchFlightsAIEnhanced: async (searchParams) => {
    const response = await backendApi.get('/api/flights/search/ai-enhanced', { params: searchParams });
    return response.data;
  },

  // 获取航班数据（用于监控主页）
  getFlightsData: async (departureCode = 'HKG') => {
    const response = await backendApi.get(`/api/flights?departure=${departureCode}`);
    return response.data;
  },

  // 获取机场搜索建议 - 无需认证
  searchAirports: async (query, language = 'zh') => {
    const response = await backendApi.get(`/api/flights/airports/search?q=${query}&language=${language}`);
    return response.data;
  },

  // 获取附近机场
  getNearbyAirports: async (lat, lng) => {
    const response = await backendApi.get(`/api/airports/nearby?lat=${lat}&lng=${lng}`);
    return response.data;
  }
};

// 监控任务相关API
export const monitorApi = {
  // 获取用户的监控任务
  getMonitorTasks: async () => {
    const response = await backendApi.get('/api/monitor/tasks');
    return response.data;
  },

  // 创建监控任务
  createMonitorTask: async (taskData) => {
    const response = await backendApi.post('/api/monitor/tasks', taskData);
    return response.data;
  },

  // 更新监控任务
  updateMonitorTask: async (taskId, taskData) => {
    const response = await backendApi.put(`/api/monitor/tasks/${taskId}`, taskData);
    return response.data;
  },

  // 删除监控任务
  deleteMonitorTask: async (taskId) => {
    const response = await backendApi.delete(`/api/monitor/tasks/${taskId}`);
    return response.data;
  },

  // 获取监控任务的航班结果
  getTaskFlightResults: async (taskId) => {
    const response = await backendApi.get(`/api/monitor/tasks/${taskId}/flights`);
    return response.data;
  },

  // 切换监控任务状态
  toggleMonitorTask: async (taskId) => {
    const response = await backendApi.patch(`/api/monitor/tasks/${taskId}/toggle`);
    return response.data;
  },

  // 获取监控统计
  getMonitorStats: async () => {
    const response = await backendApi.get('/api/monitor/stats');
    return response.data;
  },

  // 获取监控页面数据 - 需要认证
  getMonitorData: async (cityCode = 'HKG', blacklistCities = null, blacklistCountries = null, departDate = null, returnDate = null) => {
    let url = `/api/monitor/data?city=${cityCode}`;

    // 添加黑名单参数
    if (blacklistCities && blacklistCities.length > 0) {
      url += `&blacklist_cities=${encodeURIComponent(blacklistCities.join(','))}`;
    }
    if (blacklistCountries && blacklistCountries.length > 0) {
      url += `&blacklist_countries=${encodeURIComponent(blacklistCountries.join(','))}`;
    }

    // 添加日期参数
    if (departDate) {
      url += `&depart_date=${encodeURIComponent(departDate)}`;
    }
    if (returnDate) {
      url += `&return_date=${encodeURIComponent(returnDate)}`;
    }

    const response = await backendApi.get(url);
    return response.data;
  },

  // 获取监控页面支持的城市列表 - 需要认证
  getMonitorCities: async () => {
    const response = await backendApi.get('/api/monitor/cities');
    return response.data;
  },

  // 刷新监控数据 - 需要认证
  refreshMonitorData: async (cityCode = 'HKG') => {
    const response = await backendApi.post('/api/monitor/refresh', { city: cityCode });
    return response.data;
  }
};

// 管理员监控设置API
export const adminMonitorApi = {
  // 获取监控系统设置
  getMonitorSettings: async () => {
    const response = await backendApi.get('/api/admin/monitor-settings');
    return response.data;
  },

  // 更新监控系统设置
  updateMonitorSettings: async (settings) => {
    const response = await backendApi.put('/api/admin/monitor-settings', settings);
    return response.data;
  },

  // 获取监控系统状态
  getMonitorStatus: async () => {
    const response = await backendApi.get('/api/admin/monitor-status');
    return response.data;
  }
};

// 监控日期API（需要认证）
export const monitorDatesApi = {
  // 获取监控日期设置
  getMonitorDates: async () => {
    const response = await backendApi.get('/api/monitor/dates');
    return response.data;
  }
};

// 价格趋势相关API
export const priceApi = {
  // 获取价格趋势数据
  getPriceTrends: async (params) => {
    const response = await backendApi.get('/api/prices/trends', { params });
    return response.data;
  },

  // 获取价格历史
  getPriceHistory: async (route, dateRange) => {
    const response = await backendApi.get(`/api/prices/history`, {
      params: { route, ...dateRange }
    });
    return response.data;
  },

  // 获取价格预测
  getPricePrediction: async (route) => {
    const response = await backendApi.get(`/api/prices/prediction`, {
      params: { route }
    });
    return response.data;
  }
};

// AI旅行助手相关API
export const aiApi = {
  // 发送AI旅行咨询
  sendTravelQuery: async (query, context = {}) => {
    const response = await backendApi.post('/api/ai-travel/chat', {
      query,
      context
    });
    return response.data;
  },

  // 获取旅行建议
  getTravelSuggestions: async (destination, preferences = {}) => {
    const response = await backendApi.post('/api/ai-travel/suggestions', {
      destination,
      preferences
    });
    return response.data;
  },

  // AI旅行聊天（兼容旧接口）
  sendAITravelChat: async (query, context = {}) => {
    const response = await backendApi.post('/travel/api/ai-travel', {
      query,
      context
    });
    return response.data;
  },

  // 生成旅行规划
  generateTravelPlan: async (formData) => {
    const response = await backendApi.post('/travel/api/generate-travel-plan', formData);
    return response.data;
  },

  // 增强版旅行规划
  generateEnhancedTravelPlan: async (formData) => {
    const response = await backendApi.post('/travel/api/enhanced-travel-plan', formData);
    return response.data;
  },

  // 获取用户位置
  getUserLocation: async () => {
    const response = await backendApi.get('/travel/api/get-location');
    return response.data;
  },

  // 获取MCP状态
  getMcpStatus: async () => {
    const response = await backendApi.get('/travel/api/mcp-status');
    return response.data;
  }
};

// 通知相关API
export const notificationApi = {
  // 获取用户通知
  getNotifications: async () => {
    const response = await backendApi.get('/api/notifications');
    return response.data;
  },

  // 标记通知为已读
  markAsRead: async (notificationId) => {
    const response = await backendApi.patch(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  // 更新通知设置
  updateNotificationSettings: async (settings) => {
    const response = await backendApi.put('/api/notifications/settings', settings);
    return response.data;
  }
};

// 管理员相关API
export const adminApi = {
  // 获取系统统计
  getSystemStats: async () => {
    const response = await backendApi.get('/admin/stats');
    return response.data;
  },

  // 获取用户列表
  getUsers: async (params = {}) => {
    const response = await backendApi.get('/admin/users', { params });
    return response.data;
  },

  // 更新用户状态
  updateUserStatus: async (userId, status) => {
    const response = await backendApi.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  // 获取系统配置
  getSystemConfig: async () => {
    const response = await backendApi.get('/admin/config');
    return response.data;
  },

  // 更新系统配置
  updateSystemConfig: async (config) => {
    const response = await backendApi.put('/admin/config', config);
    return response.data;
  }
};

// 工具函数
export const apiUtils = {
  // 处理API错误
  handleApiError: (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      return {
        status,
        message: data.message || data.error || '服务器错误',
        details: data.details || null
      };
    } else if (error.request) {
      // 网络错误
      return {
        status: 0,
        message: '网络连接失败，请检查网络设置',
        details: null
      };
    } else {
      // 其他错误
      return {
        status: -1,
        message: error.message || '未知错误',
        details: null
      };
    }
  },

  // 格式化API响应
  formatResponse: (response) => {
    return {
      success: true,
      data: response.data,
      message: response.message || '操作成功'
    };
  }
};

export default backendApi;
