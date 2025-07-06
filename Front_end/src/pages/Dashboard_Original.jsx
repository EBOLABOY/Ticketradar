import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../utils/priceFormatter';
import { getShortAirportName, getFullAirportName } from '../utils/flightLocalizer';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  Snackbar,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import {
  Flight,
  Add,
  PlayArrow,
  Pause,
  Edit,
  Delete,
  Schedule,
  Refresh,
  NotificationsActive,
  FlightTakeoff,
  AttachMoney,
  Save,
  Warning,

  LocationOn,
  ArrowForward,
  AccessTime,
  Whatshot
} from '@mui/icons-material';
import { authApi, monitorApi, flightApi } from '../services/backendApi';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../styles/dashboard.css';

const Dashboard = () => {
  // 国际化
  const { t } = useTranslation();

  // 状态管理 - 支持多个监控任务
  const [user, setUser] = useState(null);
  const [monitorTasks, setMonitorTasks] = useState([]); // 用户的所有监控任务
  const [currentTask, setCurrentTask] = useState(null); // 当前选中的任务
  const [flights, setFlights] = useState([]); // 搜索到的航班
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 表单状态 - 参考Ticketradar的表单结构
  const [taskForm, setTaskForm] = useState({
    name: '',
    departureCity: '',
    destinationCity: '',
    departDate: '',
    returnDate: '',
    priceThreshold: 2000,
    pushplusToken: '',
    blacklistCities: '',
    blacklistCountries: '',
    isActive: true
  });

  // 机场搜索状态
  const [departureOptions, setDepartureOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);

  // 通知状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // 将机场代码转换为显示名称的辅助函数
  const getAirportDisplayName = (airportCode) => {
    if (!airportCode) return '';

    // 创建一个临时的机场对象
    const airportObj = {
      displayCode: airportCode,
      code: airportCode,
      name: '', // 这里可以根据需要添加更多映射
      city: ''
    };

    return getShortAirportName(airportObj);
  };

  // 机场搜索API调用
  const searchAirports = async (query, language = 'zh') => {
    if (!query || query.length < 2) return [];

    try {
      const response = await flightApi.searchAirports(query, language);

      if (response.success && response.airports) {
        return response.airports.map(airport => ({
          code: airport.code || airport.skyId,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          label: airport.display_name || `${airport.name} (${airport.code}) - ${airport.city}, ${airport.country}`
        }));
      }
      return [];
    } catch (error) {
      console.error('机场搜索失败:', error);
      return [];
    }
  };

  // 出发地搜索
  const handleDepartureSearch = async (query) => {
    if (!query || query.length < 2) {
      setDepartureOptions([]);
      return;
    }

    setDepartureLoading(true);
    try {
      const airports = await searchAirports(query);
      setDepartureOptions(airports);
    } catch (error) {
      console.error('出发地搜索失败:', error);
    } finally {
      setDepartureLoading(false);
    }
  };

  // 目的地搜索
  const handleDestinationSearch = async (query) => {
    if (!query || query.length < 2) {
      setDestinationOptions([]);
      return;
    }

    setDestinationLoading(true);
    try {
      const airports = await searchAirports(query);
      setDestinationOptions(airports);
    } catch (error) {
      console.error('目的地搜索失败:', error);
    } finally {
      setDestinationLoading(false);
    }
  };

  // 数据加载 - 集成真实API
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 先加载用户信息和监控任务
      const [userResponse, tasksResponse] = await Promise.all([
        authApi.getCurrentUser().catch(err => ({ success: false, error: err.message })),
        monitorApi.getMonitorTasks().catch(err => ({ success: false, error: err.message }))
      ]);

      // 获取第一个任务的黑名单设置
      let blacklistCities = null;
      let blacklistCountries = null;
      if (tasksResponse.success && tasksResponse.data.tasks && tasksResponse.data.tasks.length > 0) {
        const firstTask = tasksResponse.data.tasks[0];
        if (firstTask.blacklist_cities) {
          blacklistCities = firstTask.blacklist_cities.split(',').map(city => city.trim()).filter(city => city);
        }
        if (firstTask.blacklist_countries) {
          blacklistCountries = firstTask.blacklist_countries.split(',').map(country => country.trim()).filter(country => country);
        }
      }

      // 然后加载监控数据（应用黑名单过滤）
      const monitorDataResponse = await monitorApi.getMonitorData('HKG', blacklistCities, blacklistCountries).catch(err => ({ success: false, error: err.message }));

      // 设置用户信息
      if (userResponse.success) {
        setUser(userResponse.user);
      } else {
        console.error('获取用户信息失败:', userResponse.message || userResponse.error);
        setError('获取用户信息失败');
        showSnackbar(t('dashboard.messages.getUserInfoFailed'), 'warning');
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

        // 更新统计信息
        const monitorFlights = monitorDataResponse.success ? (monitorDataResponse.data.flights || []) : [];
        const monitorStats = monitorDataResponse.success ? (monitorDataResponse.data.stats || {}) : {};

        setStats({
          totalTasks: tasksResponse.data.total || 0,
          activeTasks: tasksResponse.data.active || 0,
          totalFlights: monitorFlights.length || 0,
          lowPriceCount: monitorStats.lowPrice || 0,
          minPrice: monitorStats.minPrice || 0,
          lastUpdate: monitorDataResponse.success ? (monitorDataResponse.data.lastUpdate || new Date().toLocaleString()) : new Date().toLocaleString()
        });

        // 如果有监控数据，设置航班信息
        if (monitorFlights.length > 0) {
          setFlights(monitorFlights.slice(0, 12)); // 最多显示12个航班
        }
      } else {
        console.error('获取监控任务失败:', tasksResponse.error);
        setError('获取监控任务失败');
        showSnackbar(t('dashboard.messages.getTasksFailed'), 'error');
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
      showSnackbar(t('dashboard.messages.systemError'), 'error');
      setLoading(false);
    }
  }, [t]);

  // 对话框处理函数
  const openCreateDialog = useCallback(() => {
    resetForm();
    setCreateDialogOpen(true);
  }, []);

  // 刷新数据函数
  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      // 先尝试刷新监控数据
      try {
        await monitorApi.refreshMonitorData('HKG');
      } catch (refreshError) {
        console.warn('刷新监控数据失败:', refreshError);
      }

      // 然后重新加载所有数据
      await loadDashboardData();
      showSnackbar(t('dashboard.messages.dataRefreshed'), 'success');
    } catch (error) {
      console.error('刷新数据失败:', error);
      showSnackbar(t('dashboard.messages.refreshFailed'), 'error');
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardData, t]);

  // 数据加载
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl/Cmd + R: 刷新数据
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        refreshData();
      }

      // Ctrl/Cmd + N: 创建新任务
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        openCreateDialog();
      }

      // Escape: 关闭对话框
      if (event.key === 'Escape') {
        setCreateDialogOpen(false);
        setEditDialogOpen(false);
        setDeleteDialogOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [refreshData, openCreateDialog]);

  // 自动刷新数据
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing && !submitting) {
        loadDashboardData();
      }
    }, 5 * 60 * 1000); // 每5分钟自动刷新

    // 修复内存泄漏：确保组件卸载时清理定时器
    return () => {
      clearInterval(interval);
    };
  }, [refreshing, submitting, loadDashboardData]);

  // 通知函数
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // 任务操作 - 集成真实API
  const toggleTaskStatus = async (taskId) => {
    try {
      if (!taskId) return;

      const task = monitorTasks.find(t => t.id === taskId);
      if (!task) return;

      // 调用API切换任务状态
      const response = await monitorApi.updateMonitorTask(taskId, {
        is_active: !task.is_active
      });

      if (response.success) {
        // 更新本地状态
        setMonitorTasks(prev => prev.map(t =>
          t.id === taskId
            ? { ...t, is_active: !t.is_active }
            : t
        ));

        if (currentTask && currentTask.id === taskId) {
          setCurrentTask(prev => ({ ...prev, is_active: !prev.is_active }));
        }

        // 更新统计信息
        setStats(prev => ({
          ...prev,
          activeTasks: task.is_active ? prev.activeTasks - 1 : prev.activeTasks + 1,
          lastUpdate: new Date().toLocaleString()
        }));

        const newStatus = !task.is_active;
        showSnackbar(newStatus ? t('dashboard.messages.taskStarted') : t('dashboard.messages.taskPaused'), 'success');
      } else {
        showSnackbar(t('dashboard.messages.operationFailed') + ': ' + response.error, 'error');
      }
    } catch (error) {
      console.error('切换任务状态失败:', error);
      showSnackbar(t('dashboard.messages.operationFailed'), 'error');
    }
  };

  // 手动触发任务检查
  const triggerTaskCheck = async (taskId) => {
    try {
      if (!taskId) return;

      setRefreshing(true);

      // 这里可以调用后端API手动触发任务检查
      // const response = await monitorApi.triggerTaskCheck(taskId);

      // 模拟检查过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 重新加载任务数据
      await loadDashboardData();

      showSnackbar(t('dashboard.messages.taskCheckCompleted'), 'success');
    } catch (error) {
      console.error('触发任务检查失败:', error);
      showSnackbar(t('dashboard.messages.checkFailed'), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // 为监控任务搜索航班
  const searchFlightsForTask = async (task) => {
    try {
      if (!task) return;

      setRefreshing(true);

      // 如果没有指定目的地，使用一些热门目的地进行搜索
      const destinations = task.destination_code ? [task.destination_code] : ['NRT', 'KIX', 'ICN', 'BKK', 'SIN'];

      const searchPromises = destinations.map(async (destCode) => {
        try {
          // 获取当前语言和货币设置
          const currentLanguage = localStorage.getItem('i18nextLng') || 'zh';
          const language = currentLanguage.startsWith('zh') ? 'zh' : 'en';
          const currency = language === 'zh' ? 'CNY' : 'USD';

          const searchParams = {
            departure_code: task.departure_code,
            destination_code: destCode,
            depart_date: task.depart_date,
            return_date: task.return_date || null,
            adults: 1,
            seat_class: 'ECONOMY',
            language: language,
            currency: currency
          };

          const response = await flightApi.searchFlights(searchParams);

          if (response.success && response.data && response.data.itineraries && response.data.itineraries.length > 0) {
            return response.data.itineraries.map(flight => ({
              ...flight,
              destinationCode: destCode,
              destination: flight.destination || destCode
            }));
          }
          return [];
        } catch (error) {
          console.error(`搜索 ${task.departure_code} -> ${destCode} 航班失败:`, error);
          return [];
        }
      });

      const results = await Promise.all(searchPromises);
      const allFlights = results.flat();

      // 按价格排序，优先显示低价航班
      const sortedFlights = allFlights.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));

      setFlights(sortedFlights.slice(0, 12)); // 最多显示12个航班

      // 更新统计信息
      setStats(prev => ({
        ...prev,
        totalFlights: sortedFlights.length,
        lowPriceCount: sortedFlights.filter(f => (f.price?.amount || 0) <= task.price_threshold).length,
        minPrice: sortedFlights.length > 0 ? Math.min(...sortedFlights.map(f => f.price?.amount || 0)) : 0,
        lastUpdate: new Date().toLocaleString()
      }));

      if (sortedFlights.length > 0) {
        showSnackbar(t('dashboard.messages.foundFlights', { count: sortedFlights.length }), 'success');
      } else {
        showSnackbar(t('dashboard.messages.noFlightsFound'), 'info');
      }
    } catch (error) {
      console.error('搜索航班失败:', error);
      showSnackbar(t('dashboard.messages.searchFlightsFailed'), 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      if (!taskId) return;

      // 调用API删除任务
      const response = await monitorApi.deleteMonitorTask(taskId);

      if (response.success) {
        // 更新本地状态
        setMonitorTasks(prev => prev.filter(task => task.id !== taskId));

        // 如果删除的是当前任务，清空当前任务
        if (currentTask && currentTask.id === taskId) {
          setCurrentTask(null);
          setFlights([]);
        }

        // 更新统计信息
        setStats(prev => ({
          ...prev,
          totalTasks: prev.totalTasks - 1,
          activeTasks: currentTask?.is_active ? prev.activeTasks - 1 : prev.activeTasks,
          lastUpdate: new Date().toLocaleString()
        }));

        showSnackbar(t('dashboard.messages.taskDeleted'), 'success');
        setDeleteDialogOpen(false);
      } else {
        showSnackbar(t('dashboard.messages.deleteFailed') + ': ' + response.error, 'error');
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      showSnackbar(t('dashboard.messages.deleteFailed'), 'error');
    }
  };

  // 表单处理
  const handleFormChange = (field, value) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 表单验证
  const validateTaskForm = () => {
    const errors = [];

    // 验证必填字段
    if (!taskForm.departureCity?.trim()) {
      errors.push(t('dashboard.validation.selectDeparture'));
    }

    if (!taskForm.departDate) {
      errors.push(t('dashboard.validation.selectDepartDate'));
    }

    if (!taskForm.priceThreshold || taskForm.priceThreshold <= 0) {
      errors.push(t('dashboard.validation.validPriceThreshold'));
    }

    // 验证日期
    const today = new Date();
    const departDate = new Date(taskForm.departDate);

    if (departDate < today.setHours(0, 0, 0, 0)) {
      errors.push(t('dashboard.validation.departDateNotPast'));
    }

    if (taskForm.returnDate) {
      const returnDate = new Date(taskForm.returnDate);
      if (returnDate <= departDate) {
        errors.push(t('dashboard.validation.returnDateAfterDepart'));
      }
    }

    // 验证价格阈值范围
    if (taskForm.priceThreshold > 50000) {
      errors.push(t('dashboard.validation.priceThresholdMax'));
    }

    if (taskForm.priceThreshold < 100) {
      errors.push(t('dashboard.validation.priceThresholdMin'));
    }

    // 验证任务名称长度
    if (taskForm.name && taskForm.name.length > 50) {
      errors.push(t('dashboard.validation.taskNameLength'));
    }

    return errors;
  };

  // 显示详细的验证错误
  const showValidationErrors = (errors) => {
    if (errors.length === 1) {
      showSnackbar(errors[0], 'warning');
    } else if (errors.length > 1) {
      showSnackbar(`${t('common.error')} ${errors.length} ${t('common.info')}：${errors[0]}`, 'warning');
    }
  };

  const resetForm = () => {
    setTaskForm({
      name: '',
      departureCity: '',
      destinationCity: '',
      departDate: '',
      returnDate: '',
      priceThreshold: 2000,
      pushplusToken: '',
      blacklistCities: '',
      blacklistCountries: '',
      isActive: true
    });
    setDepartureOptions([]);
    setDestinationOptions([]);
  };

  const handleCreateTask = async () => {
    try {
      // 验证表单
      const validationErrors = validateTaskForm();
      if (validationErrors.length > 0) {
        showValidationErrors(validationErrors);
        return;
      }

      setSubmitting(true);

      // 准备API数据
      const taskData = {
        name: taskForm.name || `${taskForm.departureCity}${taskForm.destinationCity ? '到' + taskForm.destinationCity : '监控'}`,
        departure_code: taskForm.departureCity,
        departure_city: taskForm.departureCity,
        destination_code: taskForm.destinationCity || null,
        destination_city: taskForm.destinationCity || null,
        depart_date: taskForm.departDate,
        return_date: taskForm.returnDate || null,
        price_threshold: taskForm.priceThreshold,
        pushplus_token: taskForm.pushplusToken || null,
        blacklist_cities: taskForm.blacklistCities || null,
        blacklist_countries: taskForm.blacklistCountries || null,
        is_active: taskForm.isActive,
        trip_type: taskForm.returnDate ? 'round_trip' : 'one_way'
      };

      // 调用API创建任务
      const response = await monitorApi.createMonitorTask(taskData);

      if (response.success) {
        // 更新本地状态
        const newTask = response.data;
        setMonitorTasks(prev => [newTask, ...prev]);
        setCurrentTask(newTask);

        // 更新统计信息
        setStats(prev => ({
          ...prev,
          totalTasks: prev.totalTasks + 1,
          activeTasks: newTask.is_active ? prev.activeTasks + 1 : prev.activeTasks,
          lastUpdate: new Date().toLocaleString()
        }));

        showSnackbar(t('dashboard.messages.taskCreated'), 'success');
        setCreateDialogOpen(false);
        resetForm();
      } else {
        showSnackbar(t('dashboard.messages.createFailed') + ': ' + response.error, 'error');
      }
    } catch (error) {
      console.error('创建任务失败:', error);
      showSnackbar(t('dashboard.messages.createFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async () => {
    try {
      if (!currentTask) return;

      // 验证表单
      const validationErrors = validateTaskForm();
      if (validationErrors.length > 0) {
        showValidationErrors(validationErrors);
        return;
      }

      setSubmitting(true);

      // 准备API数据
      const taskData = {
        name: taskForm.name,
        destination_code: taskForm.destinationCity || null,
        destination_city: taskForm.destinationCity || null,
        depart_date: taskForm.departDate,
        return_date: taskForm.returnDate || null,
        price_threshold: taskForm.priceThreshold,
        pushplus_token: taskForm.pushplusToken || null,
        blacklist_cities: taskForm.blacklistCities || null,
        blacklist_countries: taskForm.blacklistCountries || null,
        is_active: taskForm.isActive,
        trip_type: taskForm.returnDate ? 'round_trip' : 'one_way'
      };

      // 调用API更新任务
      const response = await monitorApi.updateMonitorTask(currentTask.id, taskData);

      if (response.success) {
        // 更新本地状态
        const updatedTask = response.data;
        setMonitorTasks(prev => prev.map(task =>
          task.id === currentTask.id ? updatedTask : task
        ));
        setCurrentTask(updatedTask);

        showSnackbar(t('dashboard.messages.taskUpdated'), 'success');
        setEditDialogOpen(false);
        resetForm();
      } else {
        showSnackbar(t('dashboard.messages.updateFailed') + ': ' + response.error, 'error');
      }
    } catch (error) {
      console.error('更新任务失败:', error);
      showSnackbar(t('dashboard.messages.updateFailed'), 'error');
    } finally {
      setSubmitting(false);
    }
  };



  const openEditDialog = () => {
    if (!currentTask) return;

    setTaskForm({
      name: currentTask.name,
      departureCity: currentTask.departure_code,
      destinationCity: currentTask.destination_code || '',
      departDate: currentTask.depart_date,
      returnDate: currentTask.return_date || '',
      priceThreshold: currentTask.price_threshold,
      pushplusToken: currentTask.pushplus_token || '',
      blacklistCities: currentTask.blacklist_cities || '',
      blacklistCountries: currentTask.blacklist_countries || '',
      isActive: currentTask.is_active
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            加载中...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="dashboard-container"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 3
      }}
    >
      <Container maxWidth="lg">
        {/* 页面标题 - 参考Ticketradar设计 */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="600" gutterBottom>
                {t('dashboard.title')}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {t('dashboard.welcome')}, {user?.username}
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <LanguageSwitcher variant="icon" />
              <Tooltip title={t('dashboard.actions.refreshData')}>
                <IconButton
                  onClick={refreshData}
                  disabled={refreshing}
                  sx={{
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  {refreshing ? <CircularProgress size={24} color="inherit" /> : <Refresh />}
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }}
              >
                {t('dashboard.noTasks.createButton')}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* 错误提示 */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={refreshData}
                disabled={refreshing}
                startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
              >
                {t('common.refresh')}
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* 统计面板 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Schedule sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h4" fontWeight="600" color="primary" gutterBottom>
                  {stats.totalTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.stats.totalTasks')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <PlayArrow sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="h4" fontWeight="600" color="success.main" gutterBottom>
                  {stats.activeTasks}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.stats.activeTasks')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <FlightTakeoff sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
                <Typography variant="h4" fontWeight="600" color="info.main" gutterBottom>
                  {stats.totalFlights}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.stats.foundFlights')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <AttachMoney sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
                <Typography variant="h4" fontWeight="600" color="warning.main" gutterBottom>
                  {stats.minPrice > 0 ? `¥${stats.minPrice}` : '--'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.stats.lowestPrice')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 快速统计信息 */}
        {(stats.totalTasks > 0 || stats.totalFlights > 0) && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {t('dashboard.stats.systemOverview')}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="600" color="primary">
                      {stats.lowPriceCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.stats.lowPriceAlerts')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                    <Typography variant="h5" fontWeight="600" color="success.main">
                      {Math.round((stats.activeTasks / Math.max(stats.totalTasks, 1)) * 100)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.stats.taskActiveRate')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight="600" color="info.main">
                      {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : '--'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.stats.lastUpdate')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight="600" color="warning.main">
                      {user?.username || 'Guest'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.stats.currentUser')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* 监控任务区域 - 支持多个任务显示 */}
        {currentTask ? (
          <Card sx={{ borderRadius: 3, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight="600" gutterBottom>
                    {currentTask.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Chip
                      label={currentTask.is_active ? t('dashboard.task.running') : t('dashboard.task.paused')}
                      color={currentTask.is_active ? 'success' : 'default'}
                      icon={currentTask.is_active ? <PlayArrow /> : <Pause />}
                    />
                    <Chip
                      label={`${t('dashboard.stats.totalTasks')}: ${stats.totalTasks}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`${t('dashboard.stats.activeTasks')}: ${stats.activeTasks}`}
                      variant="outlined"
                      size="small"
                      color="success"
                    />
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={openEditDialog}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('dashboard.task.edit')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="info"
                    startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                    onClick={() => triggerTaskCheck(currentTask.id)}
                    disabled={refreshing || !currentTask.is_active}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('dashboard.task.check')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color={currentTask.is_active ? 'warning' : 'success'}
                    startIcon={currentTask.is_active ? <Pause /> : <PlayArrow />}
                    onClick={() => toggleTaskStatus(currentTask.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    {currentTask.is_active ? t('dashboard.task.pause') : t('dashboard.task.start')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={openDeleteDialog}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('dashboard.task.delete')}
                  </Button>
                </Box>
              </Box>

              {/* 任务详情 */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('dashboard.task.route')}
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      <strong>{getAirportDisplayName(currentTask.departure_code)}</strong> → <strong>{currentTask.destination_code ? getAirportDisplayName(currentTask.destination_code) : t('dashboard.task.allDestinations')}</strong>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('dashboard.task.travelDate')}
                    </Typography>
                    <Typography variant="body1">
                      {currentTask.depart_date}
                      {currentTask.return_date && ` → ${currentTask.return_date}`}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('dashboard.task.priceThreshold')}
                    </Typography>
                    <Typography variant="h6" fontWeight="600">
                      ¥{currentTask.price_threshold}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {t('dashboard.task.createdAt')}
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentTask.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* 任务统计信息 */}
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight="600" color="primary">
                      {currentTask.total_checks || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.stats.checkCount')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight="600" color="success.main">
                      {currentTask.total_notifications || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.stats.notificationCount')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight="600" color="text.primary">
                      {currentTask.last_check ? new Date(currentTask.last_check).toLocaleString() : t('dashboard.stats.notChecked')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.stats.lastCheck')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight="600" color="text.primary">
                      {currentTask.last_notification ? new Date(currentTask.last_notification).toLocaleString() : t('dashboard.stats.noNotification')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('dashboard.stats.lastNotification')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* 任务配置信息 */}
              {(currentTask.blacklist_cities || currentTask.blacklist_countries || currentTask.pushplus_token) && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    {t('dashboard.task.advancedConfig')}
                  </Typography>
                  <Grid container spacing={2}>
                    {currentTask.blacklist_cities && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('dashboard.task.blacklistCities')}: {currentTask.blacklist_cities}
                        </Typography>
                      </Grid>
                    )}
                    {currentTask.blacklist_countries && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('dashboard.task.blacklistCountries')}: {currentTask.blacklist_countries}
                        </Typography>
                      </Grid>
                    )}
                    {currentTask.pushplus_token && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          <NotificationsActive fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {t('dashboard.task.pushplusConfigured')}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        ) : (
          // 无监控任务时的创建提示
          <Card sx={{ borderRadius: 3, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)', mb: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Flight sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h5" fontWeight="600" gutterBottom>
                {t('dashboard.noTasks.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('dashboard.noTasks.description')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={openCreateDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5
                }}
              >
                {t('dashboard.noTasks.createButton')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 航班搜索结果 - 基于当前监控任务 */}
        {currentTask && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  {t('dashboard.flights.title')} - {getAirportDisplayName(currentTask.departure_code)} → {currentTask.destination_code ? getAirportDisplayName(currentTask.destination_code) : t('dashboard.task.allDestinations')}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <FlightTakeoff />}
                  onClick={() => searchFlightsForTask(currentTask)}
                  disabled={refreshing}
                  sx={{ borderRadius: 2 }}
                >
                  {t('dashboard.flights.searchButton')}
                </Button>
              </Box>

              {flights.length > 0 ? (
                <Grid container spacing={3}>
                  {Array.isArray(flights) ? flights.map((flight, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        sx={{
                          borderRadius: '10px',
                          border: flight.price <= currentTask.price_threshold ? '2px solid #0d6efd' : '1px solid #e0e0e0',
                          boxShadow: flight.price <= currentTask.price_threshold ? '0 0 0 1px rgba(13, 110, 253, 0.25)' : '0 6px 16px rgba(0, 0, 0, 0.08)',
                          transition: 'all 0.3s ease',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                            borderColor: '#0d6efd'
                          }
                        }}
                      >
                        {/* 图片容器 */}
                        <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            height="180"
                            image={flight.image || `https://picsum.photos/400/180?random=${index}`}
                            alt={flight.destination || flight.destinationCode}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.4s ease-out',
                              '&:hover': {
                                transform: 'scale(1.1)'
                              }
                            }}
                          />

                          {/* 左上角：国家/地区标签 */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12
                            }}
                          >
                            <Chip
                              label={flight.country || flight.destination || flight.destinationCode}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(0, 0, 0, 0.65)',
                                color: 'white',
                                fontWeight: 500,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                              }}
                            />
                          </Box>

                          {/* 右上角：签证信息和低价标签 */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5
                            }}
                          >
                            {/* 签证状态 - 只显示免签和落地签 */}
                            {flight.visaStatus && (flight.visaStatus === 'visa_free' || flight.visaStatus === 'visa_on_arrival') && (
                              <Chip
                                label={flight.visaStatus === 'visa_free' ? t('dashboard.flights.visaFree') : t('dashboard.flights.visaOnArrival')}
                                size="small"
                                sx={{
                                  bgcolor: flight.visaStatus === 'visa_free' ? 'rgba(40, 167, 69, 0.9)' : 'rgba(255, 193, 7, 0.9)',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: '20px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                  textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                                }}
                              />
                            )}

                            {/* 低价标签 */}
                            {flight.price <= currentTask.price_threshold && (
                              <Chip
                                label={t('dashboard.flights.lowPrice')}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(13, 110, 253, 0.85)',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: '20px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                  textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                                }}
                              />
                            )}
                          </Box>

                          {/* 底部：热度指示器 */}
                          {flight.popularity && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 12,
                                left: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                borderRadius: '12px',
                                px: 1.5,
                                py: 0.5
                              }}
                            >
                              <Whatshot
                                sx={{
                                  fontSize: '0.9rem',
                                  color: flight.popularity >= 80 ? '#ff4444' :
                                         flight.popularity >= 60 ? '#ff8800' : '#ffaa00'
                                }}
                              />
                              <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                                {flight.popularity}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <CardContent sx={{ p: 2 }}>
                          {/* 目的地和价格 */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529', mb: 0.5 }}>
                                {flight.destination || flight.destinationCode}
                              </Typography>
                              {/* 景点推荐标签 */}
                              {flight.attractions && flight.attractions.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                  {flight.attractions.slice(0, 2).map((attraction, idx) => (
                                    <Chip
                                      key={idx}
                                      label={attraction}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.65rem',
                                        height: '18px',
                                        borderColor: '#0d6efd',
                                        color: '#0d6efd',
                                        '& .MuiChip-label': {
                                          px: 0.5
                                        }
                                      }}
                                    />
                                  ))}
                                  {flight.attractions.length > 2 && (
                                    <Chip
                                      label={`+${flight.attractions.length - 2}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.65rem',
                                        height: '18px',
                                        borderColor: '#6c757d',
                                        color: '#6c757d',
                                        '& .MuiChip-label': {
                                          px: 0.5
                                        }
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: flight.price <= currentTask.price_threshold ? '#0d6efd' : '#212529',
                                  fontSize: '1.3rem'
                                }}
                              >
                                {formatPrice(flight.price?.amount || flight.price || 0).formatted}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.7rem' }}>
                                {formatPrice(flight.price?.amount || flight.price || 0).currency}
                              </Typography>
                            </Box>
                          </Box>

                          {/* 航班详情 */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
                              <LocationOn sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
                              <span style={{ fontWeight: 600, color: '#0d6efd' }}>{getAirportDisplayName(currentTask.departure_code)}</span>
                              <ArrowForward sx={{ fontSize: '0.8rem', mx: 0.5, color: '#6c757d' }} />
                              <span>{getAirportDisplayName(flight.destination || flight.destinationCode)}</span>
                            </Typography>

                            {flight.airline && flight.flightNumber && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
                                <Flight sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
                                {flight.airline} {flight.flightNumber}
                              </Typography>
                            )}

                            {(flight.departureTime || flight.arrivalTime) && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
                                <AccessTime sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
                                {flight.departureTime} - {flight.arrivalTime}
                              </Typography>
                            )}

                            {flight.duration && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
                                <Schedule sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
                                {t('dashboard.flights.flightTime')}: {flight.duration}
                              </Typography>
                            )}

                            {/* 监控时间 */}
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
                              <Refresh sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
                              {t('dashboard.flights.monitorTime')}: {stats.lastUpdate || new Date().toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>

                          {/* 标签 */}
                          {flight.tags && Array.isArray(flight.tags) && flight.tags.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                              {flight.tags.map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  size="small"
                                  label={tag}
                                  variant="outlined"
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: '18px',
                                    borderColor: '#6c757d',
                                    color: '#6c757d'
                                  }}
                                />
                              ))}
                            </Box>
                          )}

                          {/* 预订按钮 */}
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => flight.bookingLink ? window.open(flight.bookingLink, '_blank') : null}
                            sx={{
                              bgcolor: '#0d6efd',
                              borderRadius: '20px',
                              py: 1,
                              fontWeight: 500,
                              textTransform: 'none',
                              minHeight: '44px',
                              '&:hover': {
                                bgcolor: '#0b5ed7',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            {flight.bookingLink ? t('dashboard.flights.bookNow') : t('dashboard.flights.viewDetails')}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  )) : (
                    <Grid item xs={12}>
                      <Box textAlign="center" py={4}>
                        <Typography variant="body2" color="text.secondary">
                          {t('dashboard.flights.flightDataError')}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <FlightTakeoff sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {t('dashboard.flights.noFlights')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('dashboard.flights.searchPrompt')}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<FlightTakeoff />}
                    onClick={() => searchFlightsForTask(currentTask)}
                    disabled={refreshing}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('dashboard.flights.searchButton')}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* 任务列表 - 显示所有监控任务 */}
        {monitorTasks.length > 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  {t('dashboard.flights.allTasks')} ({monitorTasks.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={openCreateDialog}
                  sx={{ borderRadius: 2 }}
                >
                  {t('dashboard.flights.newTask')}
                </Button>
              </Box>

              <Grid container spacing={2}>
                {Array.isArray(monitorTasks) ? monitorTasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} key={task.id}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        border: currentTask?.id === task.id ? '2px solid' : '1px solid',
                        borderColor: currentTask?.id === task.id ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => setCurrentTask(task)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Typography variant="subtitle1" fontWeight="600" noWrap>
                            {task.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={task.is_active ? t('dashboard.task.running') : t('dashboard.task.paused')}
                            color={task.is_active ? 'success' : 'default'}
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {getAirportDisplayName(task.departure_code)} → {task.destination_code ? getAirportDisplayName(task.destination_code) : t('dashboard.task.allDestinations')}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          出发: {task.depart_date}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem' }}>
                          最后检查: {task.last_check ? new Date(task.last_check).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '未检查'}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <Typography variant="body2" fontWeight="600" color="primary">
                            ¥{task.price_threshold}
                          </Typography>
                          <Box display="flex" gap={0.5}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentTask(task);
                                openEditDialog();
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color={task.is_active ? 'warning' : 'success'}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskStatus(task.id);
                              }}
                            >
                              {task.is_active ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentTask(task);
                                openDeleteDialog();
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )) : (
                  <Grid item xs={12}>
                    <Box textAlign="center" py={4}>
                      <Typography variant="body2" color="text.secondary">
                        任务数据格式错误
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* 创建监控任务对话框 - 参考Ticketradar设计，集成机场搜索 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Add color="primary" />
              <Typography variant="h6" fontWeight="600">
                {t('dashboard.actions.createTask')}
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* 基本信息 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  基本信息
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="任务名称"
                  value={taskForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="例如：香港到东京监控"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="价格阈值"
                  type="number"
                  value={taskForm.priceThreshold}
                  onChange={(e) => handleFormChange('priceThreshold', Number(e.target.value))}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>
                  }}
                  variant="outlined"
                  helperText="低于此价格时将发送提醒"
                />
              </Grid>

              {/* 航线信息 - 集成机场搜索 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  航线信息
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={departureOptions}
                  getOptionLabel={(option) => option.label || option}
                  value={taskForm.departureCity}
                  onChange={(event, newValue) => {
                    handleFormChange('departureCity', newValue?.code || newValue || '');
                  }}
                  onInputChange={(event, newInputValue) => {
                    handleDepartureSearch(newInputValue);
                  }}
                  loading={departureLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="出发地"
                      placeholder="搜索城市或机场"
                      variant="outlined"
                      helperText="输入城市名或机场代码搜索"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {departureLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {option.name} ({option.code})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.city}, {option.country}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={destinationOptions}
                  getOptionLabel={(option) => option.label || option}
                  value={taskForm.destinationCity}
                  onChange={(event, newValue) => {
                    handleFormChange('destinationCity', newValue?.code || newValue || '');
                  }}
                  onInputChange={(event, newInputValue) => {
                    handleDestinationSearch(newInputValue);
                  }}
                  loading={destinationLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="目的地"
                      placeholder="搜索城市或机场（可选）"
                      variant="outlined"
                      helperText="留空表示监控所有目的地"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {destinationLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {option.name} ({option.code})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.city}, {option.country}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              {/* 日期信息 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  日期信息
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="出发日期"
                  type="date"
                  value={taskForm.departDate}
                  onChange={(e) => handleFormChange('departDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="返程日期"
                  type="date"
                  value={taskForm.returnDate}
                  onChange={(e) => handleFormChange('returnDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  helperText="留空表示单程"
                />
              </Grid>

              {/* 高级设置 - 参考Ticketradar的黑名单功能 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  高级设置
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="黑名单城市"
                  value={taskForm.blacklistCities}
                  onChange={(e) => handleFormChange('blacklistCities', e.target.value)}
                  placeholder="例如：北京,上海"
                  variant="outlined"
                  helperText="用逗号分隔多个城市"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="黑名单国家"
                  value={taskForm.blacklistCountries}
                  onChange={(e) => handleFormChange('blacklistCountries', e.target.value)}
                  placeholder="例如：美国,英国"
                  variant="outlined"
                  helperText="用逗号分隔多个国家"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="PushPlus Token"
                  value={taskForm.pushplusToken}
                  onChange={(e) => handleFormChange('pushplusToken', e.target.value)}
                  placeholder="用于推送通知（可选）"
                  variant="outlined"
                  helperText="填写后将通过PushPlus发送价格提醒"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={taskForm.isActive}
                      onChange={(e) => handleFormChange('isActive', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="创建后立即启动"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setCreateDialogOpen(false)}
              disabled={submitting}
              sx={{ borderRadius: 2 }}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateTask}
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {submitting ? '创建中...' : '创建任务'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 编辑任务对话框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            resetForm();
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Edit color="primary" />
              <Typography variant="h6" fontWeight="600">
                编辑监控任务
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* 基本信息 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  基本信息
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="任务名称"
                  value={taskForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="例如：香港到东京监控"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="价格阈值"
                  type="number"
                  value={taskForm.priceThreshold}
                  onChange={(e) => handleFormChange('priceThreshold', Number(e.target.value))}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>
                  }}
                  variant="outlined"
                  helperText="低于此价格时将发送提醒"
                />
              </Grid>

              {/* 航线信息 - 出发地不可编辑 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  航线信息
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="出发地"
                  value={taskForm.departureCity}
                  variant="outlined"
                  disabled
                  helperText="出发地创建后不可修改"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={destinationOptions}
                  getOptionLabel={(option) => option.label || option}
                  value={taskForm.destinationCity}
                  onChange={(event, newValue) => {
                    handleFormChange('destinationCity', newValue?.code || newValue || '');
                  }}
                  onInputChange={(event, newInputValue) => {
                    handleDestinationSearch(newInputValue);
                  }}
                  loading={destinationLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="目的地"
                      placeholder="搜索城市或机场（可选）"
                      variant="outlined"
                      helperText="留空表示监控所有目的地"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {destinationLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {option.name} ({option.code})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.city}, {option.country}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>

              {/* 日期信息 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  日期信息
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="出发日期"
                  type="date"
                  value={taskForm.departDate}
                  onChange={(e) => handleFormChange('departDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="返程日期"
                  type="date"
                  value={taskForm.returnDate}
                  onChange={(e) => handleFormChange('returnDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  helperText="留空表示单程"
                />
              </Grid>

              {/* 高级设置 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                  高级设置
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="黑名单城市"
                  value={taskForm.blacklistCities}
                  onChange={(e) => handleFormChange('blacklistCities', e.target.value)}
                  placeholder="例如：北京,上海"
                  variant="outlined"
                  helperText="用逗号分隔多个城市"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="黑名单国家"
                  value={taskForm.blacklistCountries}
                  onChange={(e) => handleFormChange('blacklistCountries', e.target.value)}
                  placeholder="例如：美国,英国"
                  variant="outlined"
                  helperText="用逗号分隔多个国家"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="PushPlus Token"
                  value={taskForm.pushplusToken}
                  onChange={(e) => handleFormChange('pushplusToken', e.target.value)}
                  placeholder="用于推送通知（可选）"
                  variant="outlined"
                  helperText="填写后将通过PushPlus发送价格提醒"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={taskForm.isActive}
                      onChange={(e) => handleFormChange('isActive', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="任务状态：启用"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => {
                setEditDialogOpen(false);
                resetForm();
              }}
              disabled={submitting}
              sx={{ borderRadius: 2 }}
            >
              取消
            </Button>
            <Button
              onClick={handleEditTask}
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {submitting ? '保存中...' : '保存更改'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <Warning color="error" />
              <Typography variant="h6" fontWeight="600">
                确认删除
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              确定要删除监控任务 "{currentTask?.name}" 吗？此操作无法撤销。
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              取消
            </Button>
            <Button
              onClick={() => deleteTask(currentTask?.id)}
              variant="contained"
              color="error"
              startIcon={<Delete />}
              sx={{ borderRadius: 2 }}
            >
              删除
            </Button>
          </DialogActions>
        </Dialog>

        {/* 浮动操作按钮 */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <Tooltip title="创建新任务 (Ctrl+N)" placement="left">
            <Button
              variant="contained"
              size="large"
              onClick={openCreateDialog}
              sx={{
                borderRadius: '50%',
                width: 64,
                height: 64,
                minWidth: 64,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)'
                },
                transition: 'all 0.2s'
              }}
            >
              <Add sx={{ fontSize: 32 }} />
            </Button>
          </Tooltip>
        </Box>

        {/* 通知 */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Dashboard;