import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stack,
  Paper
} from '@mui/material';
import SimpleFlightCard from '../components/SimpleFlightCard';
import FlightDetailsModal from '../components/FlightDetailsModal';

// 演示数据
const demoFlights = [
  {
    id: 1,
    flight_type: 'regular',
    price: { amount: 2580, currency: 'CNY', formatted: '¥2,580' },
    duration_formatted: '9h 50m',
    stops: 0,
    legs: [
      {
        departure_datetime: '2025-06-30T20:25:00',
        arrival_datetime: '2025-07-01T13:15:00',
        departure_airport: { code: 'LHR', city: '伦敦', name: '希思罗机场' },
        arrival_airport: { code: 'PEK', city: '北京', name: '首都国际机场' },
        airline: { name: '中国国际航空', code: 'CA' },
        flight_number: 'CA938'
      }
    ]
  },
  {
    id: 2,
    flight_type: 'hidden_city',
    price: { amount: 1980, currency: 'CNY', formatted: '¥1,980' },
    duration_formatted: '12h 30m',
    stops: 1,
    legs: [
      {
        departure_datetime: '2025-06-30T22:40:00',
        arrival_datetime: '2025-07-01T08:20:00',
        departure_airport: { code: 'LHR', city: '伦敦', name: '希思罗机场' },
        arrival_airport: { code: 'DOH', city: '多哈', name: '哈马德国际机场' },
        airline: { name: '卡塔尔航空', code: 'QR' },
        flight_number: 'QR003'
      },
      {
        departure_datetime: '2025-07-01T10:30:00',
        arrival_datetime: '2025-07-01T15:25:00',
        departure_airport: { code: 'DOH', city: '多哈', name: '哈马德国际机场' },
        arrival_airport: { code: 'PEK', city: '北京', name: '首都国际机场' },
        airline: { name: '卡塔尔航空', code: 'QR' },
        flight_number: 'QR895'
      }
    ],
    layovers: [
      { duration: '2h 10m', airport: '多哈哈马德国际机场', airport_code: 'DOH' }
    ]
  },
  {
    id: 3,
    flight_type: 'ai_suggested',
    price: { amount: 1650, currency: 'CNY', formatted: '¥1,650' },
    duration_formatted: '15h 45m',
    stops: 2,
    legs: [
      {
        departure_datetime: '2025-06-30T14:30:00',
        arrival_datetime: '2025-06-30T18:45:00',
        departure_airport: { code: 'LHR', city: '伦敦', name: '希思罗机场' },
        arrival_airport: { code: 'IST', city: '伊斯坦布尔', name: '阿塔图尔克机场' },
        airline: { name: '土耳其航空', code: 'TK' },
        flight_number: 'TK1980'
      },
      {
        departure_datetime: '2025-06-30T21:15:00',
        arrival_datetime: '2025-07-01T04:30:00',
        departure_airport: { code: 'IST', city: '伊斯坦布尔', name: '阿塔图尔克机场' },
        arrival_airport: { code: 'PVG', city: '上海', name: '浦东国际机场' },
        airline: { name: '土耳其航空', code: 'TK' },
        flight_number: 'TK026'
      },
      {
        departure_datetime: '2025-07-01T06:15:00',
        arrival_datetime: '2025-07-01T08:15:00',
        departure_airport: { code: 'PVG', city: '上海', name: '浦东国际机场' },
        arrival_airport: { code: 'PEK', city: '北京', name: '首都国际机场' },
        airline: { name: '中国东方航空', code: 'MU' },
        flight_number: 'MU5137'
      }
    ],
    layovers: [
      { duration: '2h 30m', airport: '伊斯坦布尔阿塔图尔克机场', airport_code: 'IST' },
      { duration: '1h 45m', airport: '上海浦东国际机场', airport_code: 'PVG' }
    ]
  }
];

const FlightDesignDemo = () => {
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleViewDetails = (flight) => {
    setSelectedFlight(flight);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedFlight(null);
  };

  const handleBook = (flight) => {
    alert(`预订航班: ${flight.legs[0].departure_airport.code} → ${flight.legs[flight.legs.length - 1].arrival_airport.code}\n价格: ${flight.price.formatted}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* 页面标题 */}
        <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            ✈️ 全新航班卡片设计
          </Typography>
          <Typography variant="h6" color="text.secondary">
            简洁明了，一眼就能看懂的航班信息展示
          </Typography>
        </Paper>

        {/* 设计特点说明 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🎨 设计特点
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                📍 清晰的时间显示
              </Typography>
              <Typography variant="body2" color="text.secondary">
                大字体显示出发和到达时间，机场代码突出显示
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                🛫 直观的航线图
              </Typography>
              <Typography variant="body2" color="text.secondary">
                可视化航线，中转点清晰标记，飞行时长一目了然
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                💰 醒目的价格展示
              </Typography>
              <Typography variant="body2" color="text.secondary">
                价格用红色大字体显示，航班类型用彩色标签区分
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                📱 响应式设计
              </Typography>
              <Typography variant="body2" color="text.secondary">
                桌面和移动端都有优化的布局，操作按钮清晰可见
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 搜索结果统计 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            搜索结果演示
          </Typography>
          <Typography variant="body2" color="text.secondary">
            找到 {demoFlights.length} 个航班选项 (包含 1 个常规航班、1 个隐藏城市航班、1 个AI推荐航班)
          </Typography>
        </Paper>

        {/* 航班列表 */}
        <Stack spacing={2}>
          {demoFlights.map((flight, index) => (
            <SimpleFlightCard
              key={flight.id}
              flight={flight}
              onViewDetails={() => handleViewDetails(flight)}
              onBook={() => handleBook(flight)}
            />
          ))}
        </Stack>

        {/* 底部说明 */}
        <Paper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🚀 使用说明
          </Typography>
          <Typography variant="body1" color="text.secondary">
            点击"查看详情"按钮可以查看完整的航班信息，包括每个航段的详细信息和中转时间。
            点击"立即预订"按钮可以进行航班预订（演示版本）。
          </Typography>
        </Paper>
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

export default FlightDesignDemo;
