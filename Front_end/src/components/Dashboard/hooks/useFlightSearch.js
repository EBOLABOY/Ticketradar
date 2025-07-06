import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { flightApi } from '../../../services/backendApi';
import { useLoading } from '../../../hooks/useLoading';

/**
 * 航班搜索管理Hook
 * 负责航班搜索、机场搜索和相关状态管理
 */
export const useFlightSearch = () => {
  const { t } = useTranslation();
  const { startLoading, stopLoading } = useLoading();
  
  // 状态管理
  const [flights, setFlights] = useState([]);
  const [searchResult, setSearchResult] = useState(null); // 存储完整的搜索结果，包括AI分析报告
  const [departureOptions, setDepartureOptions] = useState([]);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [departureLoading, setDepartureLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);

  // 机场搜索API调用
  const searchAirports = useCallback(async (query) => {
    if (!query || query.length < 2) return [];

    try {
      // 修正：使用全局的语言设置，而不是硬编码
      const currentLanguage = localStorage.getItem('i18nextLng') || 'zh';
      const langParam = currentLanguage.startsWith('zh') ? 'zh' : 'en';
      const response = await flightApi.searchAirports(query, langParam);
      console.log('机场搜索响应:', response); // 调试日志

      // 修复数据结构：后端返回的是 response.data.airports
      const airports = response.success && response.data && response.data.airports ? response.data.airports : [];

      if (airports.length > 0) {
        return airports.map(airport => ({
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
  }, []);

  // 出发地搜索
  const handleDepartureSearch = useCallback(async (query) => {
    console.log('出发地搜索:', query); // 调试日志
    if (!query || query.length < 2) {
      setDepartureOptions([]);
      return;
    }

    setDepartureLoading(true);
    try {
      const airports = await searchAirports(query);
      console.log('出发地搜索结果:', airports); // 调试日志
      setDepartureOptions(airports);
    } catch (error) {
      console.error('出发地搜索失败:', error);
    } finally {
      setDepartureLoading(false);
    }
  }, [searchAirports]);

  // 目的地搜索
  const handleDestinationSearch = useCallback(async (query) => {
    console.log('目的地搜索:', query); // 调试日志
    if (!query || query.length < 2) {
      setDestinationOptions([]);
      return;
    }

    setDestinationLoading(true);
    try {
      const airports = await searchAirports(query);
      console.log('目的地搜索结果:', airports); // 调试日志
      setDestinationOptions(airports);
    } catch (error) {
      console.error('目的地搜索失败:', error);
    } finally {
      setDestinationLoading(false);
    }
  }, [searchAirports]);

  // 为监控任务搜索航班
  const searchFlightsForTask = useCallback(async (task, onSuccess, onError) => {
    try {
      if (!task) return;

      const loadingSteps = [
        t('loadingSteps.step1', '正在搜索航班...'),
        t('loadingSteps.step2', '正在获取隐藏航班...'),
        t('loadingSteps.step3', 'AI正在分析...'),
        t('loadingSteps.step4', '正在整理...')
      ];
      startLoading(loadingSteps);

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

          // 存储完整的搜索结果（包括AI分析报告）
          if (response.success) {
            setSearchResult(response);
          }

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

      // 计算统计信息
      const flightStats = {
        totalFlights: sortedFlights.length,
        lowPriceCount: sortedFlights.filter(f => (f.price?.amount || 0) <= task.price_threshold).length,
        minPrice: sortedFlights.length > 0 ? Math.min(...sortedFlights.map(f => f.price?.amount || 0)) : 0,
        lastUpdate: new Date().toLocaleString()
      };

      if (sortedFlights.length > 0) {
        onSuccess(sortedFlights.slice(0, 12), flightStats, t('dashboard.messages.foundFlights', { count: sortedFlights.length }));
      } else {
        onSuccess([], flightStats, t('dashboard.messages.noFlightsFound'));
      }
    } catch (error) {
      console.error('搜索航班失败:', error);
      onError(t('dashboard.messages.searchFlightsFailed'));
    } finally {
      stopLoading();
    }
  }, [t, startLoading, stopLoading]);

  // 清空搜索选项
  const clearSearchOptions = useCallback(() => {
    setDepartureOptions([]);
    setDestinationOptions([]);
  }, []);

  // 清空航班结果
  const clearFlights = useCallback(() => {
    setFlights([]);
    setSearchResult(null);
  }, []);

  return {
    // 状态
    flights,
    searchResult, // 添加完整的搜索结果
    departureOptions,
    destinationOptions,
    departureLoading,
    destinationLoading,

    // 操作函数
    handleDepartureSearch,
    handleDestinationSearch,
    searchFlightsForTask,
    clearSearchOptions,
    clearFlights,
    setFlights
  };
};