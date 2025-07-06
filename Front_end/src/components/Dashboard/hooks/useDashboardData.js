import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi, monitorApi } from '../../../services/backendApi';

/**
 * Dashboard数据管理Hook
 * 负责加载和管理Dashboard的核心数据
 */
export const useDashboardData = () => {
  const { t } = useTranslation();
  
  // 状态管理
  const [user, setUser] = useState(null);
  const [monitorTasks, setMonitorTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [monitorFlights, setMonitorFlights] = useState([]); // 添加航班数据状态
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    totalFlights: 0,
    lowPriceCount: 0,
    minPrice: 0,
    lastUpdate: null
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 数据加载函数
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 优化：并行加载所有数据，避免瀑布流问题
      const [userResponse, tasksResponse, defaultMonitorDataResponse] = await Promise.all([
        authApi.getCurrentUser().catch(err => ({ success: false, error: err.message })),
        monitorApi.getMonitorTasks().catch(err => ({ success: false, error: err.message })),
        // 默认加载香港的监控数据，无需等待任务列表返回
        monitorApi.getMonitorData('HKG', null, null).catch(err => ({ success: false, error: err.message }))
      ]);

      // 检查是否需要根据任务设置重新加载监控数据
      let finalMonitorDataResponse = defaultMonitorDataResponse;
      if (tasksResponse.success && tasksResponse.data.tasks && tasksResponse.data.tasks.length > 0) {
        const firstTask = tasksResponse.data.tasks[0];
        let departureCity = firstTask.departure_code || 'HKG';
        let blacklistCities = null;
        let blacklistCountries = null;

        // 处理黑名单设置
        if (firstTask.blacklist_cities) {
          blacklistCities = firstTask.blacklist_cities.split(',').map(city => city.trim()).filter(city => city);
        }
        if (firstTask.blacklist_countries) {
          blacklistCountries = firstTask.blacklist_countries.split(',').map(country => country.trim()).filter(country => country);
        }

        // 总是重新加载监控数据以使用任务的日期
        finalMonitorDataResponse = await monitorApi.getMonitorData(
          departureCity,
          blacklistCities,
          blacklistCountries,
          firstTask.depart_date,
          firstTask.return_date
        ).catch(err => ({ success: false, error: err.message }));
      }

      // 设置用户信息
      if (userResponse.success) {
        setUser(userResponse.user);
      } else {
        console.error('获取用户信息失败:', userResponse.message || userResponse.error);
        setError('获取用户信息失败');
      }

      // 设置监控任务
      if (tasksResponse.success) {
        const tasks = tasksResponse.data.tasks || [];
        setMonitorTasks(tasks);

        // 如果有任务，选择第一个作为当前任务
        if (tasks.length > 0) {
          setCurrentTask(tasks[0]);
        } else {
          setCurrentTask(null);
        }

        // 更新统计信息和航班数据
        const monitorFlights = finalMonitorDataResponse.success ? (finalMonitorDataResponse.data.flights || []) : [];
        const monitorStats = finalMonitorDataResponse.success ? (finalMonitorDataResponse.data.stats || {}) : {};

        // 保存航班数据
        setMonitorFlights(monitorFlights);

        setStats({
          totalTasks: tasksResponse.data.total || 0,
          activeTasks: tasksResponse.data.active || 0,
          totalFlights: monitorFlights.length || 0,
          lowPriceCount: monitorStats.lowPrice || 0,
          minPrice: monitorStats.minPrice || 0,
          lastUpdate: finalMonitorDataResponse.success ? (finalMonitorDataResponse.data.lastUpdate || new Date().toLocaleString()) : new Date().toLocaleString()
        });
      } else {
        console.error('获取监控任务失败:', tasksResponse.error);
        setError('获取监控任务失败');
        setMonitorTasks([]);
        setCurrentTask(null);
        setStats({
          totalTasks: 0,
          activeTasks: 0,
          totalFlights: 0,
          lowPriceCount: 0,
          minPrice: 0,
          lastUpdate: new Date().toLocaleString()
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError(t('dashboard.messages.systemError'));
      setLoading(false);
    }
  }, [t]);

  // 刷新数据函数
  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      // 获取当前任务的出发地
      let departureCity = 'HKG'; // 默认香港
      if (currentTask && currentTask.departure_code) {
        departureCity = currentTask.departure_code;
      }

      // 先尝试刷新监控数据
      try {
        await monitorApi.refreshMonitorData(departureCity);
      } catch (refreshError) {
        console.warn('刷新监控数据失败:', refreshError);
      }

      // 然后重新加载所有数据
      await loadDashboardData();
    } catch (error) {
      console.error('刷新数据失败:', error);
      setError(t('dashboard.messages.refreshFailed'));
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardData, currentTask, t]);

  return {
    // 状态
    user,
    monitorTasks,
    currentTask,
    monitorFlights, // 添加航班数据
    stats,
    loading,
    refreshing,
    error,

    // 操作函数
    loadDashboardData,
    refreshData,
    setCurrentTask,
    setMonitorTasks,
    setStats,
    setError
  };
};