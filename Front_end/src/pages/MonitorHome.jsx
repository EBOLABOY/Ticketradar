import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Flight,
  Refresh,
  Email,
  Notifications,
  MonitorHeart,
  AccessTime,
  AttachMoney,
  FlightTakeoff,
  FlightLand,
  ArrowForward,
  Add
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { monitorApi, monitorDatesApi } from '../services/backendApi';
import DestinationCard from '../components/DestinationCard';

const MonitorHome = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [selectedCity, setSelectedCity] = useState('HKG'); // 默认选择香港
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US'));
  const [loading, setLoading] = useState(true); // 初始加载状态为true
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [allCitiesData, setAllCitiesData] = useState({}); // 存储所有城市的数据
  const [flightData, setFlightData] = useState([]);
  const [stats, setStats] = useState({ total: 0, lowPrice: 0, minPrice: 0 });
  const [monitorDates, setMonitorDates] = useState({
    departure_date: '2025-09-30',
    return_date: '2025-10-08'
  });
  const [cities, setCities] = useState([
    { code: 'HKG', name: i18n.language === 'zh' ? '香港' : 'Hong Kong', flag: '🇭🇰' },
    { code: 'SZX', name: i18n.language === 'zh' ? '深圳' : 'Shenzhen', flag: '🇨🇳' },
    { code: 'CAN', name: i18n.language === 'zh' ? '广州' : 'Guangzhou', flag: '🇨🇳' },
    { code: 'MFM', name: i18n.language === 'zh' ? '澳门' : 'Macau', flag: '🇲🇴' }
  ]);

  // 处理城市切换
  const handleCityChange = useCallback((cityCode) => {
    setSelectedCity(cityCode);

    // 如果已有该城市的数据，直接显示
    if (allCitiesData[cityCode]) {
      setFlightData(allCitiesData[cityCode].flights || []);
      setStats(allCitiesData[cityCode].stats || { total: 0, lowPrice: 0, minPrice: 0 });
      setLastUpdate(allCitiesData[cityCode].lastUpdate || new Date().toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US'));
    }
  }, [allCitiesData, i18n.language]);

  // 处理从主页传递过来的机场参数
  useEffect(() => {
    if (location.state?.selectedAirport) {
      handleCityChange(location.state.selectedAirport);
    }
  }, [location.state, handleCityChange]);

  // 加载城市列表
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await monitorApi.getMonitorCities();
        if (response.success && response.data.cities) {
          setCities(response.data.cities);
        }
      } catch (error) {
        // 静默处理，使用默认城市列表
      }
    };
    loadCities();
  }, []);

  // 加载所有城市的监控数据
  const loadAllCitiesData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      // 并行加载所有4个城市的数据
      const cityPromises = cities.map(async (city) => {
        try {
          // 传递监控日期设置中的日期参数
          const response = await monitorApi.getMonitorData(
            city.code,
            null, // blacklistCities
            null, // blacklistCountries
            monitorDates.departure_date,
            monitorDates.return_date
          );
          return {
            cityCode: city.code,
            success: response.success,
            data: response.success ? response.data : null,
            error: response.success ? null : response.error
          };
        } catch (error) {
          return {
            cityCode: city.code,
            success: false,
            data: null,
            error: error.message
          };
        }
      });

      const results = await Promise.all(cityPromises);

      // 处理结果
      const newAllCitiesData = {};
      let totalFlights = 0;
      let totalLowPrice = 0;
      let minPrice = Infinity;
      let latestUpdate = null;

      results.forEach(result => {
        if (result.success && result.data) {
          newAllCitiesData[result.cityCode] = result.data;
          totalFlights += (result.data.flights || []).length;
          totalLowPrice += result.data.stats?.lowPrice || 0;
          if (result.data.stats?.minPrice && result.data.stats.minPrice < minPrice) {
            minPrice = result.data.stats.minPrice;
          }
          if (result.data.lastUpdate) {
            latestUpdate = result.data.lastUpdate;
          }
        } else {
          // 静默处理加载失败的城市数据
        }
      });

      setAllCitiesData(newAllCitiesData);

      // 更新当前选中城市的数据
      if (newAllCitiesData[selectedCity]) {
        setFlightData(newAllCitiesData[selectedCity].flights || []);
        setStats(newAllCitiesData[selectedCity].stats || { total: 0, lowPrice: 0, minPrice: 0 });
        setLastUpdate(newAllCitiesData[selectedCity].lastUpdate || new Date().toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US'));
      } else {
        // 如果当前选中城市没有数据，显示汇总数据
        setFlightData([]);
        setStats({
          total: totalFlights,
          lowPrice: totalLowPrice,
          minPrice: minPrice === Infinity ? 0 : minPrice
        });
        setLastUpdate(latestUpdate || new Date().toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US'));
      }

    } catch (error) {
      console.error('加载监控数据失败:', error);
      setError('网络连接失败，请稍后重试');
      setFlightData([]);
      setStats({ total: 0, lowPrice: 0, minPrice: 0 });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [cities, selectedCity, i18n.language, monitorDates.departure_date, monitorDates.return_date]);



  // 加载监控日期
  const loadMonitorDates = async () => {
    try {
      const response = await monitorDatesApi.getMonitorDates();
      if (response.success) {
        setMonitorDates(response.data);
      }
    } catch (error) {
      console.error('获取监控日期失败:', error);
      // 使用默认日期
    }
  };

  // 初始加载数据
  useEffect(() => {
    loadAllCitiesData(true);
    loadMonitorDates();
  }, [loadAllCitiesData]); // 包含loadAllCitiesData依赖

  // 监听选中城市变化
  useEffect(() => {
    if (allCitiesData[selectedCity]) {
      setFlightData(allCitiesData[selectedCity].flights || []);
      setStats(allCitiesData[selectedCity].stats || { total: 0, lowPrice: 0, minPrice: 0 });
      setLastUpdate(allCitiesData[selectedCity].lastUpdate || new Date().toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US'));
    }
  }, [selectedCity, allCitiesData, i18n.language]);

  // 实时数据更新 - 每5分钟自动刷新一次
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !refreshing) {
        loadAllCitiesData(false);
      }
    }, 5 * 60 * 1000); // 5分钟

    return () => clearInterval(interval);
  }, [loading, refreshing, loadAllCitiesData]);

  const priceThreshold = 2000;

  // 邮箱订阅相关状态
  const [subscribeDialogOpen, setSubscribeDialogOpen] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // 刷新所有城市的数据
      const refreshPromises = cities.map(city =>
        monitorApi.refreshMonitorData(city.code).catch(err => {
          // 静默处理刷新失败
          return { success: false, error: err.message };
        })
      );

      await Promise.all(refreshPromises);

      // 重新加载所有城市数据
      await loadAllCitiesData(false);
      setLastUpdate(new Date().toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US'));

    } catch (error) {
      console.error('刷新数据失败:', error);
      setError('刷新失败，请稍后重试');
    } finally {
      setRefreshing(false);
    }
  };

  const currentCity = cities.find(city => city.code === selectedCity);

  // 处理邮箱订阅
  const handleEmailSubscribe = async () => {
    if (!subscribeEmail || !subscribeEmail.includes('@')) {
      alert('请输入有效的邮箱地址');
      return;
    }

    setSubscribeLoading(true);
    try {
      // 这里可以调用后端API进行邮箱订阅
      // const response = await monitorApi.subscribeEmail(subscribeEmail, selectedCity);

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubscribeSuccess(true);
      setTimeout(() => {
        setSubscribeDialogOpen(false);
        setSubscribeSuccess(false);
        setSubscribeEmail('');
      }, 2000);
    } catch (error) {
      console.error('邮箱订阅失败:', error);
      alert('订阅失败，请稍后重试');
    } finally {
      setSubscribeLoading(false);
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('common.loading', '加载中...')}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f8f9fa',
        py: 2
      }}
    >
      <Container maxWidth="lg">
        {/* 错误提示 */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* 页面标题 - 简化版 */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0d6efd',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <Flight sx={{ fontSize: 'inherit', transform: 'rotate(-10deg)' }} />
            Ticketradar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            实时监控低价机票，助您找到最佳出行选择
          </Typography>
        </Box>

        {/* 城市选择 - 参考Ticketradar风格 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 3 }}>
          {cities.map((city) => (
            <Button
              key={city.code}
              variant={selectedCity === city.code ? "contained" : "outlined"}
              onClick={() => handleCityChange(city.code)}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                fontWeight: 500,
                textTransform: 'none',
                border: '1px solid #0d6efd',
                color: selectedCity === city.code ? 'white' : '#0d6efd',
                backgroundColor: selectedCity === city.code ? '#0d6efd' : 'transparent',
                '&:hover': {
                  backgroundColor: selectedCity === city.code ? '#0b5ed7' : 'rgba(13, 110, 253, 0.1)',
                  borderColor: '#0b5ed7'
                }
              }}
            >
              <span style={{ marginRight: '8px', fontSize: '1.1em' }}>{city.flag}</span>
              {city.name}
            </Button>
          ))}
        </Box>

        {/* 行程信息卡片 - 参考Ticketradar风格 */}
        <Card
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* 路线信息 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  {currentCity?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCity}
                </Typography>
              </Box>
              <ArrowForward sx={{ mx: 3, color: '#0d6efd', fontSize: '1.5rem' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                  全球
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Global
                </Typography>
              </Box>
            </Box>

            {/* 日期信息 */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              backgroundColor: 'rgba(13, 110, 253, 0.05)',
              borderRadius: '20px',
              p: 2,
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlightTakeoff sx={{ color: '#0d6efd', fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0d6efd' }}>
                  去程
                </Typography>
                <Typography variant="body2">
                  {monitorDates.departure_date}
                </Typography>
              </Box>
              <Typography sx={{ color: '#adb5bd' }}>-</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlightLand sx={{ color: '#0d6efd', fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0d6efd' }}>
                  回程
                </Typography>
                <Typography variant="body2">
                  {monitorDates.return_date}
                </Typography>
              </Box>
            </Box>

            {/* 最后更新时间和刷新按钮 */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                最后更新时间: {lastUpdate}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  borderRadius: '20px',
                  px: 2,
                  textTransform: 'none',
                  fontSize: '0.85rem'
                }}
              >
                {refreshing ? '刷新中...' : '刷新'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 统计信息 - 参考Ticketradar风格 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ color: '#0d6efd', fontWeight: 600, mb: 1 }}>
                  {currentCity?.name}航线
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#0d6efd', mb: 1 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  航线数
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ color: '#dc3545', fontWeight: 600, mb: 1 }}>
                  低价航线
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#dc3545', mb: 1 }}>
                  {stats.lowPrice}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  低价航线
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" sx={{ color: '#28a745', fontWeight: 600, mb: 1 }}>
                  最低价格
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#28a745', mb: 1 }}>
                  {stats.minPrice}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  最低价格
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 监控设置和订阅通知 - 参考Ticketradar风格 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonitorHeart sx={{ color: '#0d6efd' }} />
                  监控设置
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney sx={{ fontSize: '1rem', color: '#0d6efd' }} />
                      价格阈值:
                    </Typography>
                    <Chip label={`${priceThreshold}.0 元`} size="small" sx={{ bgcolor: '#e9ecef', fontWeight: 500 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: '1rem', color: '#0d6efd' }} />
                      检测频率:
                    </Typography>
                    <Chip label="每 5 分钟" size="small" sx={{ bgcolor: '#e9ecef', fontWeight: 500 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Notifications sx={{ fontSize: '1rem', color: '#0d6efd' }} />
                      通知方式:
                    </Typography>
                    <Chip label="邮箱通知" size="small" sx={{ bgcolor: '#e9ecef', fontWeight: 500 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ color: '#0d6efd' }} />
                  订阅低价通知
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  接收{currentCity?.name}低价提醒
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  输入邮箱地址，第一时间获取低价机票通知
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setSubscribeDialogOpen(true)}
                  sx={{
                    bgcolor: '#0d6efd',
                    borderRadius: '20px',
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: '#0b5ed7'
                    }
                  }}
                >
                  邮箱订阅
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 航班推荐 - 参考Ticketradar风格 */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          {currentCity?.name}出发目的地推荐 (Top {flightData.length})
        </Typography>

        {!selectedCity ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px dashed #ced4da',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Flight sx={{ fontSize: 64, opacity: 0.3, mb: 2, color: '#adb5bd' }} />
            <Typography variant="h6" gutterBottom sx={{ color: '#495057' }}>
              {t('monitor.noTasksTitle', '还没有设定监控任务')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('monitor.noTasksDesc', '请先设定监控任务，系统将为您监控特价机票并及时通知')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowTaskDialog(true)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              {t('monitor.createTask', '创建监控任务')}
            </Button>
          </Box>
        ) : flightData.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px dashed #ced4da',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Flight sx={{ fontSize: 64, opacity: 0.3, mb: 2, color: '#adb5bd' }} />
            <Typography variant="h6" gutterBottom sx={{ color: '#495057' }}>
              正在寻找特价机票...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              暂时没有符合条件的目的地，请稍后再试或调整监控设置
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {flightData.map((flight, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <DestinationCard
                  flight={flight}
                  currentCity={currentCity?.name}
                  priceThreshold={priceThreshold}
                  onBooking={(flightData) => {
                    if (flightData.bookingUrl && flightData.bookingUrl !== '#') {
                      window.open(flightData.bookingUrl, '_blank');
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* 页脚 - 参考Ticketradar风格 */}
        <Box
          component="footer"
          sx={{
            mt: 5,
            pt: 3,
            borderTop: '1px solid #e9ecef',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © Ticketradar | 数据来源: Trip.com
          </Typography>
        </Box>

        {/* 邮箱订阅对话框 */}
        <Dialog
          open={subscribeDialogOpen}
          onClose={() => setSubscribeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <Email sx={{ color: '#0d6efd', fontSize: '2rem', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              订阅{currentCity?.name}低价机票通知
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              输入您的邮箱地址，我们将在发现低价机票时第一时间通知您
            </Typography>
            <TextField
              fullWidth
              label="邮箱地址"
              type="email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              placeholder="请输入您的邮箱地址"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px'
                }
              }}
              disabled={subscribeLoading || subscribeSuccess}
            />
            {subscribeSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                订阅成功！您将收到{currentCity?.name}的低价机票通知
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={() => setSubscribeDialogOpen(false)}
              disabled={subscribeLoading}
              sx={{ borderRadius: '20px' }}
            >
              取消
            </Button>
            <Button
              variant="contained"
              onClick={handleEmailSubscribe}
              disabled={subscribeLoading || subscribeSuccess || !subscribeEmail}
              sx={{
                bgcolor: '#0d6efd',
                borderRadius: '20px',
                px: 3,
                '&:hover': {
                  bgcolor: '#0b5ed7'
                }
              }}
            >
              {subscribeLoading ? (
                <>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  订阅中...
                </>
              ) : subscribeSuccess ? (
                '订阅成功'
              ) : (
                '确认订阅'
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 创建监控任务对话框 */}
        <Dialog
          open={showTaskDialog}
          onClose={() => setShowTaskDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('monitor.createTask', '创建监控任务')}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              {t('monitor.createTaskDesc', '请前往监控管理页面创建和管理您的监控任务')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>
            <Button
              onClick={() => setShowTaskDialog(false)}
              sx={{ borderRadius: '20px', mr: 1 }}
            >
              {t('common.cancel', '取消')}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowTaskDialog(false);
                // 这里可以导航到监控管理页面
                window.location.href = '/monitor-tasks';
              }}
              sx={{
                bgcolor: '#0d6efd',
                borderRadius: '20px',
                px: 3,
                '&:hover': {
                  bgcolor: '#0b5ed7'
                }
              }}
            >
              {t('monitor.goToTasks', '前往管理')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MonitorHome;
