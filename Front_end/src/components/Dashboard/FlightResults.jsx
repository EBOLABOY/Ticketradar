import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Box,
  Button,
  Chip
} from '@mui/material';
import {
  LocationOn,
  ArrowForward,
  AccessTime,
  CalendarToday,
  Whatshot,
  FlightTakeoff,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { formatPrice } from '../../utils/priceFormatter';
import { getShortAirportName } from '../../utils/flightLocalizer';
import AIAnalysisReport from '../Flight/AIAnalysisReport';
import { createAppleGlass } from '../../utils/glassmorphism';

/**
 * 航班结果展示组件
 * 负责显示航班搜索结果和相关操作
 */
const FlightResults = React.memo(({
  currentTask,
  flights,
  stats,
  searchLoading,
  onSearchFlights,
  searchResult  // 包含完整的搜索结果，包括AI分析报告
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [aiReportExpanded, setAiReportExpanded] = useState(false);

  // 从搜索结果中提取AI分析报告

  // 将机场代码转换为显示名称的辅助函数
  const getAirportDisplayName = (airportCode) => {
    if (!airportCode) return '';

    const airportObj = {
      displayCode: airportCode,
      code: airportCode,
      name: '',
      city: ''
    };

    return getShortAirportName(airportObj);
  };





  if (!currentTask) {
    return null;
  }

  return (
    <Box>
      {/* AI分析报告 */}
      {searchResult?.ai_analysis_report && (
        <AIAnalysisReport
          searchResult={searchResult}
          expanded={aiReportExpanded}
          onExpandChange={() => setAiReportExpanded(!aiReportExpanded)}
        />
      )}

      {/* 航班结果卡片 */}
      <Card
        sx={{
          ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
          borderRadius: '20px',
          mb: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography
            variant="h6"
            fontWeight="700"
            sx={{
              background: isDark
                ? 'linear-gradient(135deg, #ffffff, #e0e0e0)'
                : 'linear-gradient(135deg, #1a1a1a, #333333)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.5px',
            }}
          >
            {t('dashboard.flights.title')} - {getAirportDisplayName(currentTask.departure_code)} → {currentTask.destination_code ? getAirportDisplayName(currentTask.destination_code) : t('dashboard.task.allDestinations')}
          </Typography>

          {/* 显示航班统计信息 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                fontWeight: 600,
              }}
            >
              {flights.length} 个航班
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#1976d2',
                fontWeight: 600,
              }}
            >
              实时监控
            </Typography>
          </Box>
        </Box>

        {flights.length > 0 ? (
          <Grid container spacing={3}>
            {Array.isArray(flights) ? flights.map((flight, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    ...createAppleGlass('primary', isDark ? 'dark' : 'light'),
                    borderRadius: '16px',
                    border: flight.price <= currentTask.price_threshold ? '2px solid #0d6efd' : '1px solid #e0e0e0',
                    boxShadow: flight.price <= currentTask.price_threshold ? '0 0 0 1px rgba(13, 110, 253, 0.25)' : '0 6px 16px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
                      borderColor: '#0d6efd'
                    }
                  }}
                >
                  {/* 图片容器 */}
                  <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={flight.image || `https://picsum.photos/400/180?random=${index}`}
                      alt={flight.destination || flight.destinationCode}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease-out',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />

                    {/* 左上角：国家/地区标签 */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12
                      }}
                    >
                      <Chip
                        label={flight.country || flight.destination || flight.destinationCode}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0, 0, 0, 0.65)',
                          color: 'white',
                          fontWeight: 500,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                        }}
                      />
                    </Box>

                    {/* 右上角：低价标签 */}
                    {flight.price <= currentTask.price_threshold && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12
                        }}
                      >
                        <Chip
                          label="特价"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(13, 110, 253, 0.9)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: '22px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                          }}
                        />
                      </Box>
                    )}

                    {/* 左下角：热度火苗指示器 */}
                    {flight.hotScore && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '12px',
                          px: 1.5,
                          py: 0.5
                        }}
                      >
                        <Whatshot
                          sx={{
                            fontSize: '0.9rem',
                            color: flight.hotScore >= 80 ? '#ff4444' :
                                   flight.hotScore >= 60 ? '#ff8800' : '#ffaa00'
                          }}
                        />
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                          {flight.hotScore}
                        </Typography>
                      </Box>
                    )}

                    {/* 右下角：价格趋势指示器 */}
                    {flight.priceTrend && flight.priceChangePercent && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 12,
                          right: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          bgcolor: flight.priceTrend === 'down' ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)',
                          borderRadius: '12px',
                          px: 1.5,
                          py: 0.5
                        }}
                      >
                        {flight.priceTrend === 'down' ? (
                          <TrendingDown sx={{ fontSize: '0.9rem', color: 'white' }} />
                        ) : (
                          <TrendingUp sx={{ fontSize: '0.9rem', color: 'white' }} />
                        )}
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                          {flight.priceChangePercent ? `${Math.abs(flight.priceChangePercent)}%` : '--'}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ p: 2 }}>
                    {/* 目的地和价格 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529', mb: 0.5 }}>
                          {flight.destination || flight.destinationCode} ({flight.code || flight.destinationCode})
                        </Typography>
                        {/* 景点推荐标签 */}
                        {((flight.attractionTags && flight.attractionTags.length > 0) || (flight.attractions && flight.attractions.length > 0)) && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {(flight.attractionTags || flight.attractions)?.slice(0, 2).map((attraction, idx) => (
                              <Chip
                                key={idx}
                                label={attraction}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: '18px',
                                  borderColor: '#0d6efd',
                                  color: '#0d6efd',
                                  '& .MuiChip-label': {
                                    px: 0.5
                                  }
                                }}
                              />
                            ))}
                            {(flight.attractionTags || flight.attractions)?.length > 2 && (
                              <Chip
                                label={`+${(flight.attractionTags || flight.attractions).length - 2}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: '18px',
                                  borderColor: '#6c757d',
                                  color: '#6c757d',
                                  '& .MuiChip-label': {
                                    px: 0.5
                                  }
                                }}
                              />
                            )}
                          </Box>
                        )}

                        {/* 旅行主题标签 */}
                        {flight.themes && Array.isArray(flight.themes) && flight.themes.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {flight.themes.slice(0, 3).map((theme, idx) => (
                              <Chip
                                key={idx}
                                label={theme}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: '18px',
                                  bgcolor: 'rgba(40, 167, 69, 0.1)',
                                  color: '#28a745',
                                  border: '1px solid rgba(40, 167, 69, 0.2)',
                                  '& .MuiChip-label': {
                                    px: 0.5
                                  }
                                }}
                              />
                            ))}
                            {flight.themes.length > 3 && (
                              <Chip
                                label={`+${flight.themes.length - 3}`}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: '18px',
                                  bgcolor: 'rgba(108, 117, 125, 0.1)',
                                  color: '#6c757d',
                                  border: '1px solid rgba(108, 117, 125, 0.2)',
                                  '& .MuiChip-label': {
                                    px: 0.5
                                  }
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: flight.price <= currentTask.price_threshold ? '#0d6efd' : '#212529',
                            fontSize: '1.5rem',
                            lineHeight: 1.2
                          }}
                        >
                          {formatPrice(flight.price?.amount || flight.price || 0).formatted}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#6c757d',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            display: 'block'
                          }}
                        >
                          {formatPrice(flight.price?.amount || flight.price || 0).currency}
                        </Typography>
                      </Box>
                    </Box>

                    {/* 航班详情 */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
                        <LocationOn sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
                        <span style={{ fontWeight: 600, color: '#0d6efd' }}>{getAirportDisplayName(currentTask.departure_code)}</span>
                        <ArrowForward sx={{ fontSize: '0.8rem', mx: 0.5, color: '#6c757d' }} />
                        <span>{flight.destination || flight.destinationCode}</span>
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
                        <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
                        {currentTask.return_date ? t('common.roundTrip') : t('common.oneWay')}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
                        <AccessTime sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
                        {currentTask.return_date ?
                          `${currentTask.depart_date} - ${currentTask.return_date}` :
                          currentTask.depart_date
                        }
                      </Typography>
                    </Box>





                    {/* 预订按钮 */}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => flight.bookingUrl ? window.open(flight.bookingUrl, '_blank') : null}
                      sx={{
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        minHeight: '44px',
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(13, 110, 253, 0.8) 0%, rgba(11, 94, 215, 0.8) 100%)'
                          : 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
                        color: 'white',
                        border: 'none',
                        '&:hover': {
                          background: isDark
                            ? 'linear-gradient(135deg, rgba(11, 94, 215, 0.9) 0%, rgba(9, 80, 183, 0.9) 100%)'
                            : 'linear-gradient(135deg, #0b5ed7 0%, #0950b7 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 16px rgba(13, 110, 253, 0.3)'
                        }
                      }}
                    >
                      立即预订
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Box 
                  textAlign="center" 
                  py={6}
                  sx={{
                    ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
                    borderRadius: '16px',
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{
                      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                      fontWeight: 500,
                    }}
                  >
                    {t('dashboard.flights.flightDataError')}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        ) : (
          <Box 
            textAlign="center" 
            py={8}
            sx={{
              ...createAppleGlass('secondary', isDark ? 'dark' : 'light'),
              borderRadius: '20px',
            }}
          >
            <FlightTakeoff 
              sx={{ 
                fontSize: 64, 
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)', 
                mb: 3 
              }} 
            />
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                fontWeight: 600,
                mb: 2,
              }}
            >
              {t('dashboard.flights.noFlights')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3,
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                fontWeight: 500,
              }}
            >
              {t('dashboard.flights.searchPrompt')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<FlightTakeoff />}
              onClick={() => onSearchFlights(currentTask)}
              disabled={searchLoading}
              sx={{
                borderRadius: '12px',
                px: 3,
                py: 1.5,
                fontWeight: 600,
                border: isDark
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  borderColor: '#0d6efd',
                  color: '#0d6efd'
                },
              }}
            >
              {t('dashboard.flights.searchButton')}
            </Button>
          </Box>
        )}
        </CardContent>
      </Card>
    </Box>
  );
});

FlightResults.displayName = 'FlightResults';

export default FlightResults;