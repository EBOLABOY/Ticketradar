import { useSimpleNotification as useNotificationContext } from '../components/Notification/SimpleNotificationSystem';

/**
 * 简化的通知Hook，提供向后兼容性
 * 可以直接替换现有的showSnackbar函数
 */
export const useNotification = () => {
  const notification = useNotificationContext();

  // 向后兼容的showSnackbar函数
  const showSnackbar = (message, severity = 'info', options = {}) => {
    switch (severity) {
      case 'success':
        return notification.success(message, options);
      case 'error':
        return notification.error(message, options);
      case 'warning':
        return notification.warning(message, options);
      case 'info':
      default:
        return notification.info(message, options);
    }
  };

  return {
    // 新的API
    ...notification,
    
    // 向后兼容的API
    showSnackbar,
    
    // 便捷方法
    notifySuccess: (message, title) => notification.success(message, { title }),
    notifyError: (message, title) => notification.error(message, { title }),
    notifyWarning: (message, title) => notification.warning(message, { title }),
    notifyInfo: (message, title) => notification.info(message, { title }),
    notifyLoading: (message, title) => notification.info(message, { title }), // 简化版本使用info代替loading
    
    // API错误处理
    handleApiError: (error, defaultMessage = '操作失败') => {
      let message = defaultMessage;
      let title = '错误';
      
      if (error?.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      
      // 根据HTTP状态码设置标题
      if (error?.response?.status) {
        switch (error.response.status) {
          case 400:
            title = '请求错误';
            break;
          case 401:
            title = '认证失败';
            break;
          case 403:
            title = '权限不足';
            break;
          case 404:
            title = '资源不存在';
            break;
          case 422:
            title = '数据验证失败';
            break;
          case 500:
            title = '服务器错误';
            break;
          default:
            title = `错误 ${error.response.status}`;
        }
      }
      
      return notification.error(message, { title });
    },
    
    // 表单验证错误处理
    handleValidationErrors: (errors) => {
      if (Array.isArray(errors)) {
        if (errors.length === 1) {
          return notification.warning(errors[0], { title: '验证失败' });
        } else if (errors.length > 1) {
          return notification.warning(
            `发现 ${errors.length} 个问题：${errors[0]}`, 
            { title: '验证失败' }
          );
        }
      } else if (typeof errors === 'string') {
        return notification.warning(errors, { title: '验证失败' });
      }
    },
    
    // 操作成功通知
    notifyOperationSuccess: (operation, details) => {
      const messages = {
        create: '创建成功',
        update: '更新成功',
        delete: '删除成功',
        save: '保存成功',
        submit: '提交成功',
        login: '登录成功',
        logout: '退出成功',
        register: '注册成功'
      };
      
      const message = messages[operation] || '操作成功';
      return notification.success(details || message, { title: '成功' });
    },
    
    // 网络错误处理
    handleNetworkError: (error) => {
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return notification.error('网络连接失败，请检查网络设置', { title: '网络错误' });
      } else if (error.code === 'TIMEOUT') {
        return notification.error('请求超时，请稍后重试', { title: '超时错误' });
      } else {
        return notification.error('网络请求失败', { title: '网络错误' });
      }
    }
  };
};

export default useNotification;
