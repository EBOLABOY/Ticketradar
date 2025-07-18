import { useCallback, useState, useEffect } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Container,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import SearchBar from "../components/Home/SearchBar";
import SimpleFlightCard from "../components/SimpleFlightCard";
import FlightDetailsModal from "../components/FlightDetailsModal";
import AIAnalysisReport from "../components/Flight/AIAnalysisReport";
import { useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { formatBackendPrice } from "../utils/priceFormatter";
import { useTheme as useCustomTheme } from "../contexts/ThemeContext";
import { createAppleGlass } from "../utils/glassmorphism";
import { useAsyncSearch } from "../hooks/useAsyncSearch";
import { useLoading } from "../hooks/useLoading";
import { flightApi } from "../services/backendApi";

dayjs.extend(duration);

// 这些工具函数已移至组件内部或其他工具文件中

// 旧的FlightCard组件已被SimpleFlightCard替代

// 旧的FlightDetails组件已被FlightDetailsModal替代

const FlightsList = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useCustomTheme();
  const { stopLoading } = useLoading();
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [asyncFlightData, setAsyncFlightData] = useState(null);

  const location = useLocation();
  const flightData = location.state?.flightData;
  const isAsyncSearch = location.state?.isAsyncSearch;
  const taskId = location.state?.taskId;
  const searchParams = location.state?.searchParams;

  // 异步搜索Hook - 只保留错误处理需要的部分
  const {
    error: searchError,
  } = useAsyncSearch();

  // 处理异步搜索结果
  useEffect(() => {
    if (isAsyncSearch && taskId && !asyncFlightData) {
      let delayTimeout;
      let pollingInterval;

      // 轮询任务状态的函数
      const pollExistingTask = async () => {
        try {
          // 检查任务状态
          const statusResponse = await flightApi.getTaskStatus(taskId);
          if (statusResponse.success) {
            const taskData = statusResponse.data;

            if (taskData.status === 'COMPLETED') {
              // 获取搜索结果
              const resultResponse = await flightApi.getTaskResult(taskId);
              if (resultResponse.success) {
                setAsyncFlightData(resultResponse.data);
                // 任务完成后停止流程动画
                stopLoading();
                // 任务完成后清理轮询
                if (pollingInterval) {
                  clearInterval(pollingInterval);
                  pollingInterval = null;
                }
              }
            }
          }
        } catch (error) {
          console.error('检查任务状态失败:', error);
        }
      };

      // 延迟80秒后开始轮询
      delayTimeout = setTimeout(() => {
        pollExistingTask();
        pollingInterval = setInterval(pollExistingTask, 3000);
      }, 80000);

      // 清理函数
      return () => {
        if (delayTimeout) {
          clearTimeout(delayTimeout);
        }
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    }
  }, [isAsyncSearch, taskId, asyncFlightData]);

  // 当异步搜索结果已经获取到时，确保停止所有轮询
  useEffect(() => {
    if (asyncFlightData && isAsyncSearch) {
      console.log('✅ 异步搜索结果已获取，确保停止轮询');
      // 这里可以添加额外的清理逻辑，确保没有遗留的轮询
    }
  }, [asyncFlightData, isAsyncSearch]);

  // 监听搜索错误，在出现错误时停止流程动画
  useEffect(() => {
    if (searchError && isAsyncSearch) {
      console.log('❌ 搜索出现错误，停止流程动画');
      stopLoading();
    }
  }, [searchError, isAsyncSearch, stopLoading]);

  // 确定使用哪个数据源
  const currentFlightData = asyncFlightData || flightData;

  // 获取玻璃效果样式
  const glassStyle = createAppleGlass('secondary', isDarkMode ? 'dark' : 'light');

  // 获取航班数据并进行数据转换
  const rawFlights = currentFlightData?.data?.itineraries || [];

  // 获取AI分析报告
  const aiAnalysisReport = currentFlightData?.ai_analysis_report;
  const processingInfo = currentFlightData?.ai_processing?.processing_info;

  // 强制调试AI报告提取
  console.log('🔍 AI报告提取调试:');
  console.log('- isAsyncSearch:', isAsyncSearch);
  console.log('- taskId:', taskId);
  console.log('- flightData存在:', !!flightData);
  console.log('- asyncFlightData存在:', !!asyncFlightData);
  console.log('- currentFlightData存在:', !!currentFlightData);
  console.log('- ai_analysis_report字段:', currentFlightData?.ai_analysis_report ? '存在' : '不存在');
  console.log('- aiAnalysisReport变量:', aiAnalysisReport ? '已提取' : '提取失败');
  console.log('- 报告长度:', aiAnalysisReport?.length || 0);

  // 数据转换函数 - 确保数据格式一致
  const normalizeFlightData = (flight) => {
    // 如果数据已经是正确格式，直接返回
    if (flight.legs && flight.legs.length > 0 && flight.legs[0].departure_datetime) {
      return flight;
    }

    // 如果是旧格式，进行转换
    const normalizedFlight = { ...flight };

    if (flight.legs) {
      normalizedFlight.legs = flight.legs.map(leg => ({
        ...leg,
        // 确保时间字段存在
        departure_datetime: leg.departure_datetime || leg.departure,
        arrival_datetime: leg.arrival_datetime || leg.arrival,
        // 确保机场字段存在
        departure_airport: leg.departure_airport || { code: leg.origin, name: leg.origin },
        arrival_airport: leg.arrival_airport || { code: leg.destination, name: leg.destination },
        // 确保航空公司字段存在
        airline: leg.airline || (leg.carriers?.marketing?.[0] ? {
          name: leg.carriers.marketing[0].name,
          code: leg.carriers.marketing[0].code
        } : { name: '未知航空公司', code: 'XX' })
      }));
    }

    return normalizedFlight;
  };

  const flights = rawFlights.map(normalizeFlightData);

  // 详细调试信息
  console.log('=== FlightsList 重构版本调试 ===');
  console.log('1. 原始 flightData:', flightData);
  console.log('2. flightData.data:', flightData?.data);
  console.log('3. flightData.data.itineraries:', flightData?.data?.itineraries);
  console.log('4. 航班数据:', flights);
  console.log('5. 数据长度:', flights.length);
  console.log('6. AI分析报告:', aiAnalysisReport);
  console.log('7. AI分析报告长度:', aiAnalysisReport ? aiAnalysisReport.length : 0);
  console.log('8. 处理信息:', processingInfo);
  console.log('9. flightData.ai_analysis_report:', flightData?.ai_analysis_report);
  console.log('10. flightData.ai_processing:', flightData?.ai_processing);
  console.log('11. AI报告是否存在:', !!flightData?.ai_analysis_report);
  console.log('12. AI报告前100字符:', flightData?.ai_analysis_report?.substring(0, 100));
  if (flights.length > 0) {
    console.log('11. 第一个航班完整数据:', JSON.stringify(flights[0], null, 2));
    console.log('12. 第一个航班的legs:', flights[0].legs);
    console.log('13. 第一个航班的price字段:', flights[0].price);
    console.log('14. 价格格式化测试:', formatBackendPrice(flights[0].price));
    if (flights[0].legs && flights[0].legs.length > 0) {
      console.log('15. 第一个航段数据:', JSON.stringify(flights[0].legs[0], null, 2));
    }
  }

  // 处理查看详情
  const handleViewDetails = useCallback((flight) => {
    setSelectedFlight(flight);
    setDetailsModalOpen(true);
  }, []);

  // 处理关闭详情模态框
  const handleCloseDetails = useCallback(() => {
    setDetailsModalOpen(false);
    setSelectedFlight(null);
  }, []);

  return (
    <Container maxWidth="lg">
      <SearchBar bg={"none"} />

      <Box sx={{ my: 4 }}>
        {/* 异步搜索错误显示 */}
        {isAsyncSearch && searchError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>搜索失败</AlertTitle>
            {searchError}
          </Alert>
        )}

        {/* AI分析报告 */}
        {(aiAnalysisReport || currentFlightData?.ai_analysis_report) && (
          <AIAnalysisReport
            searchResult={currentFlightData}
          />
        )}

        {/* 搜索结果统计 - 只在有航班数据时显示 */}
        {flights && flights.length > 0 ? (
          <Box sx={{
            mb: 3,
            p: 3,
            borderRadius: 3,
            ...glassStyle,
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDarkMode
                ? '0 20px 40px rgba(0,0,0,0.3)'
                : '0 20px 40px rgba(0,0,0,0.1)'
            }
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              搜索结果
            </Typography>
            <Typography variant="body2" color="text.secondary">
              找到 {flights.length} 个航班选项
              {flightData?.search_stages && (
                <span>
                  {' '}(包含 {flightData.search_stages.stage1?.flight_count || 0} 个常规航班、
                  {flightData.search_stages.stage2?.flight_count || 0} 个隐藏城市航班、
                  {flightData.search_stages.stage3?.flight_count || 0} 个AI发现航班)
                </span>
              )}
            </Typography>
          </Box>
        ) : null}

        {/* 航班列表 - 使用简化设计 */}
        {flights && flights.length > 0 ? (
          <Stack spacing={2}>
            {flights.map((flight, index) => (
              <SimpleFlightCard
                key={index}
                flight={flight}
                onViewDetails={() => handleViewDetails(flight)}
                onBook={(flightData) => {
                  // 预订功能 - 可以在这里添加预订逻辑
                  console.log('预订航班:', flightData);
                  // 可以跳转到预订页面或打开预订链接
                  if (flightData.booking_url) {
                    window.open(flightData.booking_url, '_blank');
                  } else {
                    alert(t('flights.bookingInDevelopment'));
                  }
                }}
              />
            ))}
          </Stack>
        ) : !(aiAnalysisReport || flightData?.ai_analysis_report) ? (
          <Box sx={{ minHeight: "35vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Alert severity="info" sx={{ maxWidth: 400 }}>
              <AlertTitle>{t('flights.noFlightInfo')}</AlertTitle>
              {t('flights.searchFlightsFirst')}
            </Alert>
          </Box>
        ) : (
          // 有AI分析报告但没有航班数据时，显示提示信息
          <Box sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            ...glassStyle,
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            textAlign: 'center'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              ✨ AI智能分析完成
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI已为您分析了所有可用的航班选项，并生成了详细的分析报告。请查看上方的AI分析内容获取最佳推荐。
            </Typography>
          </Box>
        )}
      </Box>

      {/* 航班详情模态框 */}
      <FlightDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        flight={selectedFlight}
      />
    </Container>
  );
};

export default FlightsList;