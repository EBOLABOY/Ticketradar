import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';

// 导入子组件
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import CurrentTaskDetail from '../components/Dashboard/CurrentTaskDetail';
import FlightResults from '../components/Dashboard/FlightResults';
import FlightSearchForm from '../components/Dashboard/FlightSearchForm';
import DashboardActions from '../components/Dashboard/DashboardActions';

// 导入自定义Hooks
import { useDashboardData } from '../components/Dashboard/hooks/useDashboardData';
import { useMonitorTasks } from '../components/Dashboard/hooks/useMonitorTasks';
import { useFlightSearch } from '../components/Dashboard/hooks/useFlightSearch';

// 导入样式

/**
 * 重构后的Dashboard主组件
 * 职责：组合各个子组件，管理全局状态和事件处理
 */
const Dashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 使用自定义Hooks管理状态
  const {
    user,
    currentTask,
    monitorFlights, // 添加航班数据
    stats,
    loading,
    refreshing,
    error,
    loadDashboardData,
    refreshData,
    setCurrentTask,
    setMonitorTasks,
    setStats
  } = useDashboardData();

  const {
    taskForm,
    submitting,
    handleFormChange,
    resetForm,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    triggerTaskCheck,
    fillEditForm
  } = useMonitorTasks();

  const {
    searchResult, // 添加完整的搜索结果
    searchLoading,
    searchFlightsForTask,
    setFlights
  } = useFlightSearch();

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 按钮引用状态，用于定位对话框
  const [createButtonRef, setCreateButtonRef] = useState(null);
  const [editButtonRef, setEditButtonRef] = useState(null);
  const [deleteButtonRef, setDeleteButtonRef] = useState(null);

  // 通知状态
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // 通知函数
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  // 显示详细的验证错误
  const showValidationErrors = useCallback((errors) => {
    if (errors.length === 1) {
      showSnackbar(errors[0], 'warning');
    } else if (errors.length > 1) {
      showSnackbar(`${t('common.error')} ${errors.length} ${t('common.info')}：${errors[0]}`, 'warning');
    }
  }, [showSnackbar, t]);

  // 数据加载
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 键盘快捷键
  const openCreateDialog = useCallback(() => {
    resetForm();
    setCreateDialogOpen(true);
  }, [resetForm]);

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

    return () => {
      clearInterval(interval);
    };
  }, [refreshing, submitting, loadDashboardData]);

  // 对话框处理函数

  const openEditDialog = useCallback(() => {
    if (!currentTask) return;
    fillEditForm(currentTask);
    setEditDialogOpen(true);
  }, [currentTask, fillEditForm]);

  const openDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  // 任务操作处理函数
  const handleCreateTask = useCallback(async () => {
    await createTask(
      (newTask) => {
        // 成功回调
        setMonitorTasks(prev => [newTask, ...prev]);
        setCurrentTask(newTask);
        setStats(prev => ({
          ...prev,
          totalTasks: prev.totalTasks + 1,
          activeTasks: newTask.is_active ? prev.activeTasks + 1 : prev.activeTasks,
          lastUpdate: new Date().toLocaleString()
        }));
        showSnackbar(t('dashboard.messages.taskCreated'), 'success');
        setCreateDialogOpen(false);
      },
      (errors) => {
        // 错误回调
        showValidationErrors(errors);
      }
    );
  }, [createTask, setMonitorTasks, setCurrentTask, setStats, showSnackbar, showValidationErrors, t]);

  const handleEditTask = useCallback(async () => {
    if (!currentTask) return;

    await updateTask(
      currentTask.id,
      (updatedTask) => {
        // 成功回调
        setMonitorTasks(prev => prev.map(task =>
          task.id === currentTask.id ? updatedTask : task
        ));
        setCurrentTask(updatedTask);
        showSnackbar(t('dashboard.messages.taskUpdated'), 'success');
        setEditDialogOpen(false);
      },
      (errors) => {
        // 错误回调
        showValidationErrors(errors);
      }
    );
  }, [currentTask, updateTask, setMonitorTasks, setCurrentTask, showSnackbar, showValidationErrors, t]);

  const handleDeleteTask = useCallback(async () => {
    if (!currentTask) return;

    await deleteTask(
      currentTask.id,
      () => {
        // 成功回调
        setMonitorTasks(prev => prev.filter(task => task.id !== currentTask.id));
        setCurrentTask(null);
        setFlights([]);
        setStats(prev => ({
          ...prev,
          totalTasks: prev.totalTasks - 1,
          activeTasks: currentTask.is_active ? prev.activeTasks - 1 : prev.activeTasks,
          lastUpdate: new Date().toLocaleString()
        }));
        showSnackbar(t('dashboard.messages.taskDeleted'), 'success');
        setDeleteDialogOpen(false);
      },
      (error) => {
        // 错误回调
        showSnackbar(error, 'error');
      }
    );
  }, [currentTask, deleteTask, setMonitorTasks, setCurrentTask, setFlights, setStats, showSnackbar, t]);

  const handleToggleTaskStatus = useCallback(async (taskId, currentStatus) => {
    await toggleTaskStatus(
      taskId,
      currentStatus,
      (newStatus) => {
        // 成功回调
        setMonitorTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, is_active: newStatus } : t
        ));

        if (currentTask && currentTask.id === taskId) {
          setCurrentTask(prev => ({ ...prev, is_active: newStatus }));
        }

        setStats(prev => ({
          ...prev,
          activeTasks: currentStatus ? prev.activeTasks - 1 : prev.activeTasks + 1,
          lastUpdate: new Date().toLocaleString()
        }));

        showSnackbar(newStatus ? t('dashboard.messages.taskStarted') : t('dashboard.messages.taskPaused'), 'success');
      },
      (error) => {
        // 错误回调
        showSnackbar(error, 'error');
      }
    );
  }, [toggleTaskStatus, setMonitorTasks, currentTask, setCurrentTask, setStats, showSnackbar, t]);

  const handleTriggerTaskCheck = useCallback(async (taskId) => {
    await triggerTaskCheck(
      taskId,
      () => {
        // 成功回调
        loadDashboardData();
        showSnackbar(t('dashboard.messages.taskCheckCompleted'), 'success');
      },
      (error) => {
        // 错误回调
        showSnackbar(error, 'error');
      }
    );
  }, [triggerTaskCheck, loadDashboardData, showSnackbar, t]);

  const handleSearchFlights = useCallback(async (task) => {
    await searchFlightsForTask(
      task,
      (flightResults, flightStats, message) => {
        // 成功回调
        setStats(prev => ({
          ...prev,
          ...flightStats
        }));
        showSnackbar(message, 'success');
      },
      (error) => {
        // 错误回调
        showSnackbar(error, 'error');
      }
    );
  }, [searchFlightsForTask, setStats, showSnackbar]);

  // 加载状态
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
            {t('common.loading')}
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
        // 使用与主页相同的简洁白色背景
        background: isDark
          ? 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        // 添加微妙的背景纹理
        backgroundAttachment: 'fixed',
        position: 'relative',
        py: 3,
        // 添加非常微妙的背景装饰
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? 'radial-gradient(circle at 20% 80%, rgba(66, 165, 245, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(144, 202, 249, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(66, 165, 245, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* 页面标题 */}
        <DashboardHeader
          user={user}
          refreshing={refreshing}
          onRefresh={refreshData}
          onCreateTask={openCreateDialog}
        />



        {/* 当前任务详情 */}
        <CurrentTaskDetail
          currentTask={currentTask}
          stats={stats}
          refreshing={refreshing}
          onEdit={openEditDialog}
          onToggleStatus={handleToggleTaskStatus}
          onDelete={openDeleteDialog}
          onTriggerCheck={handleTriggerTaskCheck}
          onEditButtonRef={setEditButtonRef} // 传递编辑按钮引用回调
          onDeleteButtonRef={setDeleteButtonRef} // 传递删除按钮引用回调
        />

        {/* 航班搜索结果 */}
        {currentTask && (
          <FlightResults
            currentTask={currentTask}
            flights={monitorFlights} // 使用Trip.com监控数据
            stats={stats}
            searchLoading={searchLoading}
            onSearchFlights={handleSearchFlights}
            searchResult={searchResult} // 传递完整的搜索结果
          />
        )}



        {/* 创建任务表单 */}
        <FlightSearchForm
          open={createDialogOpen}
          mode="create"
          taskForm={taskForm}
          submitting={submitting}
          onClose={() => setCreateDialogOpen(false)}
          onSubmit={handleCreateTask}
          onFormChange={handleFormChange}
          anchorEl={createButtonRef} // 传递按钮引用
        />

        {/* 编辑任务表单 */}
        <FlightSearchForm
          open={editDialogOpen}
          mode="edit"
          taskForm={taskForm}
          submitting={submitting}
          onClose={() => {
            setEditDialogOpen(false);
            resetForm();
          }}
          onSubmit={handleEditTask}
          onFormChange={handleFormChange}
          anchorEl={editButtonRef} // 传递编辑按钮引用
        />

        {/* 操作按钮和对话框 */}
        <DashboardActions
          deleteDialogOpen={deleteDialogOpen}
          currentTask={currentTask}
          onDeleteConfirm={handleDeleteTask}
          onDeleteCancel={() => setDeleteDialogOpen(false)}
          deleteButtonRef={deleteButtonRef} // 传递删除按钮引用
          snackbar={snackbar}
          onSnackbarClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          error={error}
          refreshing={refreshing}
          onRefresh={refreshData}
          onCreateTask={openCreateDialog}
          onCreateButtonRef={setCreateButtonRef} // 传递按钮引用回调
        />
      </Container>
    </Box>
  );
};

export default Dashboard;