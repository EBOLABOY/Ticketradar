import React, { createContext, useState, useCallback, useRef } from 'react';

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const stepIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startLoading = useCallback((loadingSteps = []) => {
    setSteps(loadingSteps);
    setCurrentStepIndex(0);
    setElapsedTime(0);
    setIsLoading(true);

    // 启动计时器
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);

    // 模拟步骤推进
    if (loadingSteps.length > 0) {
      stepIntervalRef.current = setInterval(() => {
        setCurrentStepIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= loadingSteps.length) {
            // 步骤完成后，只清除步骤计时器，总计时器和loading状态由API返回后调用stopLoading()来停止
            if (stepIntervalRef.current) {
              clearInterval(stepIntervalRef.current);
              stepIntervalRef.current = null;
            }
          }
          return nextIndex;
        });
      }, 12 * 1000); // 每12秒模拟一步
    }
  }, []);

  const value = {
    isLoading,
    steps,
    currentStepIndex,
    elapsedTime,
    startLoading,
    stopLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};