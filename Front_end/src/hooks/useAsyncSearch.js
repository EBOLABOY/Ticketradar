import { useState, useCallback, useRef } from 'react';
import { flightApi } from '../services/backendApi';

/**
 * 异步搜索Hook
 * 管理异步AI搜索的状态和轮询逻辑
 */
export const useAsyncSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const pollingIntervalRef = useRef(null);
  const delayTimeoutRef = useRef(null);
  const maxPollingTime = 600000; // 10分钟最大轮询时间
  const pollingInterval = 3000; // 3秒轮询间隔
  const initialDelay = 80000; // 80秒后开始轮询（1分20秒）
  
  // 清理轮询和延迟定时器
  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);
  
  // 开始轮询任务状态（延迟启动）
  const startPolling = useCallback((taskId) => {
    const startTime = Date.now();

    const poll = async () => {
      try {
        // 检查是否超时
        if (Date.now() - startTime > maxPollingTime) {
          clearPolling();
          setError('搜索超时，请重试');
          setIsSearching(false);
          return;
        }

        // 查询任务状态
        const statusResponse = await flightApi.getTaskStatus(taskId);

        if (statusResponse.success) {
          const taskData = statusResponse.data;
          setProgress(taskData.progress || 0);
          setStatusMessage(taskData.message || '');

          // 检查任务是否完成
          if (taskData.status === 'COMPLETED') {
            // 立即清理轮询，避免继续轮询
            clearPolling();

            // 获取搜索结果
            try {
              const resultResponse = await flightApi.getTaskResult(taskId);
              if (resultResponse.success) {
                setResult(resultResponse.data);
                setStatusMessage('搜索完成');
              } else {
                setError(resultResponse.message || '获取结果失败');
              }
            } catch (err) {
              console.error('获取搜索结果失败:', err);
              setError('获取搜索结果失败');
            }

            setIsSearching(false);
          } else if (taskData.status === 'FAILED') {
            clearPolling();
            setError(taskData.error || '搜索失败');
            setIsSearching(false);
          }
          // 如果状态是 PENDING 或 PROCESSING，继续轮询
        } else {
          // 状态查询失败
          console.error('查询任务状态失败:', statusResponse.message);
          setStatusMessage('查询状态失败，继续尝试...');
        }
      } catch (err) {
        console.error('轮询过程中出错:', err);
        setStatusMessage('网络连接异常，继续尝试...');
      }
    };

    // 设置延迟轮询 - 80秒后开始
    setStatusMessage(`AI正在深度分析航班数据，预计需要1-2分钟，请稍候...`);

    delayTimeoutRef.current = setTimeout(() => {
      // 延迟结束后，立即执行一次查询
      poll();

      // 然后设置定时轮询
      pollingIntervalRef.current = setInterval(poll, pollingInterval);
    }, initialDelay);

  }, [clearPolling, maxPollingTime, pollingInterval, initialDelay]);
  
  // 开始异步搜索
  const startAsyncSearch = useCallback(async (searchParams) => {
    try {
      // 重置状态
      setIsSearching(true);
      setError(null);
      setResult(null);
      setProgress(0);
      setStatusMessage('正在提交搜索任务...');
      
      // 提交异步搜索任务
      const response = await flightApi.startAsyncAISearch(searchParams);
      
      if (response.success) {
        const newTaskId = response.data.task_id;
        setTaskId(newTaskId);
        setStatusMessage('任务已提交，开始搜索...');
        
        // 开始轮询任务状态
        startPolling(newTaskId);
        
        return { success: true, taskId: newTaskId };
      } else {
        setError(response.message || '提交搜索任务失败');
        setIsSearching(false);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('提交异步搜索失败:', err);
      const errorMessage = err.response?.data?.detail || err.message || '提交搜索任务失败';
      setError(errorMessage);
      setIsSearching(false);
      return { success: false, error: errorMessage };
    }
  }, [startPolling]);
  
  // 取消搜索
  const cancelSearch = useCallback(() => {
    clearPolling();
    setIsSearching(false);
    setTaskId(null);
    setProgress(0);
    setStatusMessage('');
    setError(null);
    setResult(null);
  }, [clearPolling]);
  
  // 重置状态
  const resetSearch = useCallback(() => {
    clearPolling();
    setIsSearching(false);
    setTaskId(null);
    setProgress(0);
    setStatusMessage('');
    setError(null);
    setResult(null);
  }, [clearPolling]);
  
  return {
    // 状态
    isSearching,
    taskId,
    progress,
    statusMessage,
    error,
    result,
    
    // 方法
    startAsyncSearch,
    cancelSearch,
    resetSearch
  };
};
