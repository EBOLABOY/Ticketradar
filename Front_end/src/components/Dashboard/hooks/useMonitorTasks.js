import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { monitorApi } from '../../../services/backendApi';

/**
 * 监控任务管理Hook
 * 负责监控任务的CRUD操作和状态管理
 */
export const useMonitorTasks = () => {
  const { t } = useTranslation();
  
  // 状态管理
  const [submitting, setSubmitting] = useState(false);
  
  // 表单状态
  const [taskForm, setTaskForm] = useState({
    name: '',
    departureCity: '',
    destinationCity: '',
    departDate: '',
    returnDate: '',
    priceThreshold: 2000,
    notificationMethod: 'email', // 新增：通知方式选择
    pushplusToken: '',
    blacklistCities: '',
    blacklistCountries: '',
    isActive: true
  });

  // 表单处理
  const handleFormChange = useCallback((field, value) => {
    setTaskForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // 重置表单
  const resetForm = useCallback(() => {
    setTaskForm({
      name: '',
      departureCity: '',
      destinationCity: '',
      departDate: '',
      returnDate: '',
      priceThreshold: 2000,
      notificationMethod: 'email', // 新增：通知方式选择
      pushplusToken: '',
      blacklistCities: '',
      blacklistCountries: '',
      isActive: true
    });
  }, []);

  // 表单验证
  const validateTaskForm = useCallback(() => {
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
  }, [taskForm, t]);

  // 创建任务
  const createTask = useCallback(async (onSuccess, onError) => {
    try {
      // 验证表单
      const validationErrors = validateTaskForm();
      if (validationErrors.length > 0) {
        onError(validationErrors);
        return false;
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
        // 通知设置
        notification_enabled: true,
        email_notification: taskForm.notificationMethod === 'email',
        pushplus_notification: taskForm.notificationMethod === 'pushplus',
        pushplus_token: taskForm.notificationMethod === 'pushplus' ? taskForm.pushplusToken : null,
        blacklist_cities: taskForm.blacklistCities || null,
        blacklist_countries: taskForm.blacklistCountries || null,
        is_active: taskForm.isActive,
        trip_type: taskForm.returnDate ? 'round_trip' : 'one_way'
      };

      // 调用API创建任务
      const response = await monitorApi.createMonitorTask(taskData);

      if (response.success) {
        onSuccess(response.data);
        resetForm();
        return true;
      } else {
        onError([t('dashboard.messages.createFailed') + ': ' + response.error]);
        return false;
      }
    } catch (error) {
      console.error('创建任务失败:', error);
      onError([t('dashboard.messages.createFailed')]);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [taskForm, validateTaskForm, resetForm, t]);

  // 更新任务
  const updateTask = useCallback(async (taskId, onSuccess, onError) => {
    try {
      if (!taskId) return false;

      // 验证表单
      const validationErrors = validateTaskForm();
      if (validationErrors.length > 0) {
        onError(validationErrors);
        return false;
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
        // 通知设置
        notification_enabled: true,
        email_notification: taskForm.notificationMethod === 'email',
        pushplus_notification: taskForm.notificationMethod === 'pushplus',
        pushplus_token: taskForm.notificationMethod === 'pushplus' ? taskForm.pushplusToken : null,
        blacklist_cities: taskForm.blacklistCities || null,
        blacklist_countries: taskForm.blacklistCountries || null,
        is_active: taskForm.isActive,
        trip_type: taskForm.returnDate ? 'round_trip' : 'one_way'
      };

      // 调用API更新任务
      const response = await monitorApi.updateMonitorTask(taskId, taskData);

      if (response.success) {
        onSuccess(response.data);
        resetForm();
        return true;
      } else {
        onError([t('dashboard.messages.updateFailed') + ': ' + response.error]);
        return false;
      }
    } catch (error) {
      console.error('更新任务失败:', error);
      onError([t('dashboard.messages.updateFailed')]);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [taskForm, validateTaskForm, resetForm, t]);

  // 删除任务
  const deleteTask = useCallback(async (taskId, onSuccess, onError) => {
    try {
      if (!taskId) return false;

      // 调用API删除任务
      const response = await monitorApi.deleteMonitorTask(taskId);

      if (response.success) {
        onSuccess();
        return true;
      } else {
        onError(t('dashboard.messages.deleteFailed') + ': ' + response.error);
        return false;
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      onError(t('dashboard.messages.deleteFailed'));
      return false;
    }
  }, [t]);

  // 切换任务状态
  const toggleTaskStatus = useCallback(async (taskId, currentStatus, onSuccess, onError) => {
    try {
      if (!taskId) return false;

      // 调用API切换任务状态
      const response = await monitorApi.updateMonitorTask(taskId, {
        is_active: !currentStatus
      });

      if (response.success) {
        onSuccess(!currentStatus);
        return true;
      } else {
        onError(t('dashboard.messages.operationFailed') + ': ' + response.error);
        return false;
      }
    } catch (error) {
      console.error('切换任务状态失败:', error);
      onError(t('dashboard.messages.operationFailed'));
      return false;
    }
  }, [t]);

  // 手动触发任务检查
  const triggerTaskCheck = useCallback(async (taskId, onSuccess, onError) => {
    try {
      if (!taskId) return false;

      // 这里可以调用后端API手动触发任务检查
      // const response = await monitorApi.triggerTaskCheck(taskId);

      // 模拟检查过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      onSuccess();
      return true;
    } catch (error) {
      console.error('触发任务检查失败:', error);
      onError(t('dashboard.messages.checkFailed'));
      return false;
    }
  }, [t]);

  // 填充编辑表单
  const fillEditForm = useCallback((task) => {
    setTaskForm({
      name: task.name,
      departureCity: task.departure_code,
      destinationCity: task.destination_code || '',
      departDate: task.depart_date,
      returnDate: task.return_date || '',
      priceThreshold: task.price_threshold,
      notificationMethod: task.pushplus_notification ? 'pushplus' : 'email', // 根据现有数据判断通知方式
      pushplusToken: task.pushplus_token || '',
      blacklistCities: task.blacklist_cities || '',
      blacklistCountries: task.blacklist_countries || '',
      isActive: task.is_active
    });
  }, []);

  return {
    // 状态
    taskForm,
    submitting,
    
    // 操作函数
    handleFormChange,
    resetForm,
    validateTaskForm,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    triggerTaskCheck,
    fillEditForm
  };
};