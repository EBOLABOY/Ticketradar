
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  useTheme,
  IconButton,
  Card,
  CardContent,
  Stack,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  Flight as FlightIcon,
  FlightTakeoff as TakeoffIcon,
  FlightLand as LandIcon,
  AccessTime as TimeIcon,
  Timeline as RouteIcon
} from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { createAppleGlass, createGlassButton } from '../utils/glassmorphism';

const FlightDetailsModal = ({ open, onClose, flight }) => {
  const theme = useTheme();
  const { isDarkMode } = useCustomTheme();

  // 获取玻璃效果样式
  const glassStyle = createAppleGlass('primary', isDarkMode ? 'dark' : 'light');
  const buttonGlassStyle = createGlassButton(isDarkMode ? 'dark' : 'light');

  if (!flight) return null;

  // 格式化时间显示
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
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch {
      return '--';
    }
  };

  // 格式化价格
  const formatPrice = (price) => {
    if (!price) return '价格待查';
    if (typeof price === 'object') {
      return price.formatted || `¥${price.amount || 0}`;
    }
    return typeof price === 'number' ? `¥${price}` : price.toString();
  };

  // 获取航班类型信息
  const getFlightTypeInfo = () => {
    if (flight.flight_type === 'hidden_city') {
      return { label: '隐藏城市航班', color: '#ff9800', description: '通过隐藏城市策略找到的优惠航班' };
    }
    if (flight.flight_type === 'ai_suggested') {
      return { label: 'AI推荐航班', color: '#9c27b0', description: 'AI分析推荐的隐藏城市航班' };
    }
    return { label: '常规航班', color: '#2196f3', description: '通过常规搜索找到的航班' };
  };

  const flightTypeInfo = getFlightTypeInfo();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          ...glassStyle,
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: isDarkMode
            ? '0 25px 50px rgba(0,0,0,0.5)'
            : '0 25px 50px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            航班详情
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatPrice(flight.price)} • {flight.duration_formatted || '时长未知'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* 航班类型标签 */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={flightTypeInfo.label}
            sx={{
              backgroundColor: flightTypeInfo.color + '20',
              color: flightTypeInfo.color,
              fontWeight: 'bold',
              mb: 1
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {flightTypeInfo.description}
          </Typography>
        </Box>

        {/* 航班概览 */}
        <Box sx={{ 
          p: 3, 
          backgroundColor: theme.palette.grey[50], 
          borderRadius: 2, 
          mb: 3 
        }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {formatTime(flight.legs?.[0]?.departure_datetime)}
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  {flight.legs?.[0]?.departure_airport?.code || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {flight.legs?.[0]?.departure_airport?.city || 
                   flight.legs?.[0]?.departure_airport?.name || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(flight.legs?.[0]?.departure_datetime)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
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
                <Typography variant="body1" fontWeight="500">
                  {flight.duration_formatted || '时长未知'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {flight.stops === 0 ? '直飞' : `${flight.stops}次中转`}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {formatTime(flight.legs?.[flight.legs?.length - 1]?.arrival_datetime)}
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  {flight.legs?.[flight.legs?.length - 1]?.arrival_airport?.code || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {flight.legs?.[flight.legs?.length - 1]?.arrival_airport?.city || 
                   flight.legs?.[flight.legs?.length - 1]?.arrival_airport?.name || 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(flight.legs?.[flight.legs?.length - 1]?.arrival_datetime)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* 航班路线图 - 简约设计 */}
        {flight.legs && flight.legs.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <RouteIcon color="primary" />
              航班路线
            </Typography>

            {/* 路线时间轴 */}
            <Box sx={{ position: 'relative', pl: 2 }}>
              {flight.legs.map((leg, index) => (
                <Box key={index}>
                  {/* 航段卡片 */}
                  <Card sx={{
                    mb: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: 'visible',
                    position: 'relative'
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      {/* 航段标题 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{
                          width: 32,
                          height: 32,
                          bgcolor: 'primary.main',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {leg.airline?.name || '未知航空公司'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {leg.flight_number || 'N/A'} • {leg.duration_formatted || '未知时长'}
                          </Typography>
                        </Box>
                        <Chip
                          label={leg.aircraft_type || '未知机型'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </Box>

                      {/* 出发到达信息 */}
                      <Stack direction="row" spacing={3} alignItems="center">
                        {/* 出发 */}
                        <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <TakeoffIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" color="text.secondary">出发</Typography>
                          </Box>
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            {formatTime(leg.departure_datetime)}
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {leg.departure_airport?.code || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {leg.departure_airport?.city || leg.departure_airport?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(leg.departure_datetime)}
                          </Typography>
                        </Box>

                        {/* 飞行路径 */}
                        <Box sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          py: 2
                        }}>
                          <Box sx={{
                            width: '100%',
                            height: 2,
                            bgcolor: 'primary.main',
                            borderRadius: 1,
                            position: 'relative'
                          }}>
                            <FlightIcon sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: 'primary.main',
                              fontSize: 20,
                              bgcolor: 'background.paper',
                              borderRadius: '50%',
                              p: 0.5
                            }} />
                          </Box>
                        </Box>

                        {/* 到达 */}
                        <Box sx={{ textAlign: 'center', minWidth: 100 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <LandIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="caption" color="text.secondary">到达</Typography>
                          </Box>
                          <Typography variant="h5" fontWeight="bold" color="success.main">
                            {formatTime(leg.arrival_datetime)}
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {leg.arrival_airport?.code || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {leg.arrival_airport?.city || leg.arrival_airport?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(leg.arrival_datetime)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* 中转等待 */}
                  {index < flight.legs.length - 1 && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 1,
                      mb: 2
                    }}>
                      <Chip
                        icon={<TimeIcon />}
                        label={`中转等待 ${flight.layovers?.[index]?.duration || '未知'}`}
                        variant="outlined"
                        color="warning"
                        sx={{
                          bgcolor: theme.palette.warning.light + '10',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
            '&:hover': {
              borderColor: isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }
          }}
        >
          关闭
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            // 预订逻辑
            if (flight.booking_url) {
              window.open(flight.booking_url, '_blank');
            } else {
              alert('预订功能开发中...');
            }
          }}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            ...buttonGlassStyle,
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(26, 115, 232, 0.8) 0%, rgba(52, 168, 83, 0.8) 100%)'
              : 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
            '&:hover': {
              ...buttonGlassStyle['&:hover'],
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(21, 87, 176, 0.9) 0%, rgba(46, 125, 50, 0.9) 100%)'
                : 'linear-gradient(135deg, #1557b0 0%, #2e7d32 100%)',
              transform: 'translateY(-1px) scale(1.02)'
            }
          }}
        >
          立即预订
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlightDetailsModal;
