import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Sort,
  TuneRounded
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 移动端组件
import { BottomNavigation, MobileAppBar } from '../components/Mobile';
import MobileSearchForm from '../components/Mobile/MobileSearchForm';
import { MobileFlightCard } from '../components/Mobile/MobileCard';
import { TouchButton } from '../components/TouchEnhanced';

// Hooks和工具
import { useMobile } from '../hooks/useMobile';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { createAppleGlass } from '../utils/glassmorphism';

/**
 * 移动端优化的搜索页面
 */
const MobileSearch = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedFlights, setBookmarkedFlights] = useState(new Set());
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile, performanceLevel } = useMobile();
  const { theme: themeMode } = useCustomTheme();

  // 模拟机场数据
  const airports = [
    { code: 'PEK', name: '北京首都国际机场', city: '北京' },
    { code: 'PVG', name: '上海浦东国际机场', city: '上海' },
    { code: 'CAN', name: '广州白云国际机场', city: '广州' },
    { code: 'SZX', name: '深圳宝安国际机场', city: '深圳' },
    { code: 'CTU', name: '成都双流国际机场', city: '成都' },
    { code: 'HGH', name: '杭州萧山国际机场', city: '杭州' }
  ];

  // 模拟航班数据
  const mockFlights = [
    {
      id: '1',
      flightNumber: 'CA1234',
      airline: { name: '中国国航', logoUrl: '/airlines/ca.png' },
      origin: 'PEK',
      destination: 'PVG',
      departureTime: '2024-01-15T08:00:00',
      arrivalTime: '2024-01-15T10:30:00',
      duration: 150,
      price: 1280,
      stops: 0,
      priceChange: -50
    },
    {
      id: '2',
      flightNumber: 'MU5678',
      airline: { name: '中国东航', logoUrl: '/airlines/mu.png' },
      origin: 'PEK',
      destination: 'PVG',
      departureTime: '2024-01-15T14:00:00',
      arrivalTime: '2024-01-15T16:45:00',
      duration: 165,
      price: 1150,
      stops: 0,
      priceChange: 30
    },
    {
      id: '3',
      flightNumber: '9C8765',
      airline: { name: '春秋航空', logoUrl: '/airlines/9c.png' },
      origin: 'PEK',
      destination: 'PVG',
      departureTime: '2024-01-15T18:30:00',
      arrivalTime: '2024-01-15T21:15:00',
      duration: 165,
      price: 890,
      stops: 0,
      priceChange: 0
    }
  ];

  // 处理搜索
  const handleSearch = async (searchData) => {
    setLoading(true);
    setError(null);
    setSearchParams(searchData);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 根据性能等级调整数据量
      const flightCount = performanceLevel === 'low' ? 10 : 
                         performanceLevel === 'medium' ? 20 : 50;
      
      const generatedFlights = Array.from({ length: flightCount }, (_, index) => ({
        ...mockFlights[index % mockFlights.length],
        id: `flight-${index}`,
        price: mockFlights[index % mockFlights.length].price + Math.random() * 200 - 100
      }));

      setFlights(generatedFlights);
    } catch (err) {
      setError('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理航班选择
  const handleFlightSelect = (flight) => {
    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // 导航到详情页面
    navigate(`/flight/${flight.id}`, { state: { flight } });
  };

  // 处理收藏
  const handleBookmark = (flightId) => {
    setBookmarkedFlights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(flightId)) {
        newSet.delete(flightId);
      } else {
        newSet.add(flightId);
      }
      return newSet;
    });

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  // 排序航班
  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'duration':
        return a.duration - b.duration;
      case 'departure':
        return new Date(a.departureTime) - new Date(b.departureTime);
      default:
        return 0;
    }
  });

  // 渲染航班列表项
  const renderFlightItem = (flight, index) => (
    <MobileFlightCard
      key={flight.id}
      flight={flight}
      onSelect={handleFlightSelect}
      onBookmark={() => handleBookmark(flight.id)}
      isBookmarked={bookmarkedFlights.has(flight.id)}
      sx={{ mx: 2, mb: 1 }}
    />
  );

  // 创建玻璃效果样式
  const createGlassContainer = () => {
    const baseGlass = createAppleGlass('secondary', themeMode);
    return {
      ...baseGlass,
      borderRadius: 0,
      minHeight: '100vh'
    };
  };

  return (
    <Box sx={createGlassContainer()}>
      {/* 移动端应用栏 */}
      {isMobile && (
        <MobileAppBar
          title={t('search.title', '搜索航班')}
          showBack={true}
          onBack={() => navigate(-1)}
          actions={[
            {
              icon: <TuneRounded />,
              onClick: () => setShowFilters(!showFilters)
            }
          ]}
        />
      )}

      <Container 
        maxWidth="lg" 
        sx={{ 
          pt: isMobile ? 8 : 2,
          pb: isMobile ? 10 : 2,
          px: isMobile ? 0 : 2
        }}
      >
        {/* 搜索表单 */}
        <MobileSearchForm
          onSearch={handleSearch}
          airports={airports}
          loading={loading}
          sx={{ mb: 2 }}
        />

        {/* 搜索结果 */}
        {searchParams && (
          <Box>
            {/* 结果统计和排序 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              px: 2,
              py: 1,
              mb: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                {loading ? '搜索中...' : `找到 ${flights.length} 个航班`}
              </Typography>
              
              <TouchButton
                variant="outlined"
                size="small"
                startIcon={<Sort />}
                onClick={() => {
                  // 循环切换排序方式
                  const sortOptions = ['price', 'duration', 'departure'];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex]);
                }}
                sx={{ minWidth: 'auto' }}
              >
                {sortBy === 'price' ? '价格' : 
                 sortBy === 'duration' ? '时长' : '起飞'}
              </TouchButton>
            </Box>

            {/* 航班列表 */}
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>正在搜索航班...</Typography>
              </Box>
            ) : flights.length > 0 ? (
              <Box>
                {sortedFlights.map(renderFlightItem)}
              </Box>
            ) : searchParams ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  未找到符合条件的航班
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
      </Container>

      {/* 移动端底部导航 */}
      {isMobile && (
        <BottomNavigation 
          showFab={false}
        />
      )}

      {/* 错误提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileSearch;
