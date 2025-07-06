import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Flight as FlightIcon,
  Schedule as TimeIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { localizeAirportName } from '../utils/flightLocalizer';
import { useTranslation } from 'react-i18next';
import { createAppleGlass, createGlassCard, createGlassButton } from '../utils/glassmorphism';

// 简化的航班卡片 - 一眼就能看懂的设计
const SimpleFlightCard = ({ flight, onViewDetails, onBook }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

  // 获取主要航段信息
  const firstLeg = flight.legs?.[0] || {};
  const lastLeg = flight.legs?.[flight.legs.length - 1] || {};

  // 格式化时间显示（只显示时间）
  const formatTime = (datetime) => {
    if (!datetime) return '--:--';
    try {
      return new Date(datetime).toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return '--:--';
    }
  };

  // 格式化日期显示
  const formatDate = (datetime) => {
    if (!datetime) return '--';
    try {
      return new Date(datetime).toLocaleDateString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return '--';
    }
  };

  // 获取机场代码
  const getDepartureCode = () => firstLeg.departure_airport?.code || 'N/A';
  const getArrivalCode = () => lastLeg.arrival_airport?.code || 'N/A';

  // 获取本地化的机场名称
  const getDepartureCity = () => {
    const code = firstLeg.departure_airport?.code;
    const name = firstLeg.departure_airport?.name;
    const city = firstLeg.departure_airport?.city;

    if (!code) return 'N/A';

    // 使用本地化工具获取中文机场名称
    const localizedName = localizeAirportName(code, name);
    if (localizedName && localizedName !== code) {
      return localizedName;
    }

    // 如果没有本地化名称，使用城市或原名称
    return city || name || code;
  };

  const getArrivalCity = () => {
    const code = lastLeg.arrival_airport?.code;
    const name = lastLeg.arrival_airport?.name;
    const city = lastLeg.arrival_airport?.city;

    if (!code) return 'N/A';

    // 使用本地化工具获取中文机场名称
    const localizedName = localizeAirportName(code, name);
    if (localizedName && localizedName !== code) {
      return localizedName;
    }

    // 如果没有本地化名称，使用城市或原名称
    return city || name || code;
  };

  // 格式化价格
  const formatPrice = (price) => {
    if (!price) return t('flight.priceToBeChecked');
    if (typeof price === 'object') {
      return price.formatted || `¥${price.amount || 0}`;
    }
    return typeof price === 'number' ? `¥${price}` : price.toString();
  };

  // 航班类型配置
  const getFlightTypeInfo = () => {
    if (flight.flight_type === 'hidden_city') {
      return { label: t('flight.hiddenCity'), color: '#ff9800', bgColor: '#fff3e0' };
    }
    if (flight.flight_type === 'ai_suggested') {
      return { label: t('flight.aiRecommended'), color: '#9c27b0', bgColor: '#f3e5f5' };
    }
    return { label: t('flight.regularFlight'), color: '#2196f3', bgColor: '#e3f2fd' };
  };

  const flightTypeInfo = getFlightTypeInfo();

  // 获取玻璃效果样式
  const glassCardStyle = createGlassCard(theme.palette.mode);
  const glassButtonStyle = createGlassButton(theme.palette.mode);
  const priceGlassStyle = createAppleGlass('tertiary', theme.palette.mode);

  return (
    <Card
      sx={{
        mb: 2,
        ...glassCardStyle,
        // Apple风格卡片特效
        '&:hover': {
          transform: 'translateY(-4px) translateZ(0)',
          boxShadow: theme.palette.mode === 'light'
            ? '0 12px 32px rgba(31, 38, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
            : '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        },
        '&:active': {
          transform: 'translateY(-2px) translateZ(0)',
        },
        // 移动端优化
        ...(isMobile && {
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        }),
      }}
    >
      <CardContent sx={{
        p: 3,
        // 内容区域微妙的玻璃分层效果
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
        }
      }}>
        {/* 主要信息区域 - 横向布局 */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: 2
        }}>
          
          {/* 左侧：出发信息 */}
          <Box sx={{ textAlign: 'center', minWidth: 100 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {formatTime(firstLeg.departure_datetime)}
            </Typography>
            <Typography variant="h6" fontWeight="600" sx={{ mt: 0.5 }}>
              {getDepartureCode()}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {getDepartureCity()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(firstLeg.departure_datetime)}
            </Typography>
          </Box>

          {/* 中间：航班路线和时长 */}
          <Box sx={{ flex: 1, mx: 2, textAlign: 'center', minWidth: 200 }}>
            {/* 航班路线图 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: 'primary.main' 
              }} />
              <Box sx={{ 
                flex: 1, 
                height: 3, 
                backgroundColor: 'primary.main',
                position: 'relative',
                mx: 1
              }}>
                {/* 中转点标记 */}
                {flight.stops > 0 && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'warning.main',
                    border: '2px solid white'
                  }} />
                )}
              </Box>
              <FlightIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              <Box sx={{ 
                flex: 1, 
                height: 3, 
                backgroundColor: 'primary.main',
                mx: 1
              }} />
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: 'primary.main' 
              }} />
            </Box>
            
            {/* 飞行时长 */}
            <Typography variant="body1" fontWeight="500" color="text.primary">
              {flight.duration_formatted || t('flights.unknownDuration')}
            </Typography>

            {/* 中转信息 */}
            <Typography variant="body2" color="text.secondary">
              {flight.stops === 0 ? t('flights.direct') : t('flights.stopsCount', { count: flight.stops })}
            </Typography>
          </Box>

          {/* 右侧：到达信息 */}
          <Box sx={{ textAlign: 'center', minWidth: 100 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {formatTime(lastLeg.arrival_datetime)}
            </Typography>
            <Typography variant="h6" fontWeight="600" sx={{ mt: 0.5 }}>
              {getArrivalCode()}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {getArrivalCity()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(lastLeg.arrival_datetime)}
            </Typography>
          </Box>

          {/* 最右侧：价格和操作 */}
          <Box sx={{ textAlign: 'center', minWidth: 140 }}>
            {/* 价格区域 - 使用tertiary玻璃效果突出显示 */}
            <Box sx={{
              ...priceGlassStyle,
              p: 2,
              mb: 2,
              borderRadius: 2,
              // 价格区域特殊光晕效果
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: theme.palette.mode === 'light'
                  ? '0 4px 16px rgba(244, 67, 54, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  : '0 4px 16px rgba(244, 67, 54, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              },
            }}>
              <Typography variant="h3" fontWeight="bold" color="error.main">
                {formatPrice(flight.price)}
              </Typography>
            </Box>
            
            {/* 航班类型标签 - 玻璃效果 */}
            <Chip
              label={flightTypeInfo.label}
              size="small"
              sx={{
                ...createAppleGlass('tertiary', theme.palette.mode),
                backgroundColor: 'transparent',
                color: flightTypeInfo.color,
                fontWeight: 'bold',
                fontSize: '0.75rem',
                mb: 2,
                border: `1px solid ${flightTypeInfo.color}40`,
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: `${flightTypeInfo.color}20`,
                },
              }}
            />

            {/* 操作按钮 - 玻璃按钮效果 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => onBook && onBook(flight)}
                sx={{
                  ...glassButtonStyle,
                  background: theme.palette.mode === 'light'
                    ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(21, 101, 192, 0.9))'
                    : 'linear-gradient(135deg, rgba(100, 181, 246, 0.9), rgba(66, 165, 245, 0.9))',
                  color: 'white',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'translateY(-1px) scale(1.02)',
                    background: theme.palette.mode === 'light'
                      ? 'linear-gradient(135deg, rgba(33, 150, 243, 1), rgba(21, 101, 192, 1))'
                      : 'linear-gradient(135deg, rgba(100, 181, 246, 1), rgba(66, 165, 245, 1))',
                  },
                }}
              >
                {t('flight.bookNow')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onViewDetails && onViewDetails(flight)}
                sx={{
                  ...glassButtonStyle,
                  borderRadius: 2,
                  textTransform: 'none',
                  border: `1px solid ${theme.palette.primary.main}60`,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    transform: 'translateY(-1px) scale(1.02)',
                    backgroundColor: `${theme.palette.primary.main}20`,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {t('flight.viewDetails')}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* 移动端适配：垂直布局 - 添加玻璃分割线 */}
        {isMobile && (
          <Box sx={{
            mt: 2,
            pt: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ...createAppleGlass('tertiary', theme.palette.mode),
                px: 2,
                py: 1,
                borderRadius: 1,
              }}>
                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {flight.duration_formatted || t('flights.unknownDuration')}
                </Typography>
              </Box>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ...createAppleGlass('tertiary', theme.palette.mode),
                px: 2,
                py: 1,
                borderRadius: 1,
              }}>
                <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {flight.stops === 0 ? t('flights.direct') : t('flights.stopsCount', { count: flight.stops })}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleFlightCard;
