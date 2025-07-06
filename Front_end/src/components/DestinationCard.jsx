
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  AccessTime,
  ArrowForward,
  Whatshot,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import { createAppleGlass, createGlassButton } from '../utils/glassmorphism';

const DestinationCard = ({ flight, currentCity, priceThreshold = 2000, onBooking }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useCustomTheme();



  // 获取玻璃效果样式
  const glassStyle = createAppleGlass('secondary', isDarkMode ? 'dark' : 'light');
  const buttonGlassStyle = createGlassButton(isDarkMode ? 'dark' : 'light');
  return (
    <Card
      sx={{
        borderRadius: 3,
        ...glassStyle,
        border: flight.price < priceThreshold
          ? `2px solid ${isDarkMode ? 'rgba(13, 110, 253, 0.8)' : '#0d6efd'}`
          : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: isDarkMode
            ? '0 20px 40px rgba(0,0,0,0.4)'
            : '0 20px 40px rgba(0,0,0,0.15)',
          borderColor: isDarkMode ? 'rgba(13, 110, 253, 0.8)' : '#0d6efd'
        }
      }}
    >
      {/* 图片容器 */}
      <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="180"
          image={flight.image}
          alt={flight.destination}
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
        
        {/* 左上角：国家标签 */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12
          }}
        >
          <Chip
            label={flight.country}
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

        {/* 右上角：签证信息 */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5
          }}
        >
          {/* 签证状态 - 只显示免签和落地签，中国国内航班不显示 */}
          {flight.visaStatus && flight.visaStatus !== null && (flight.visaStatus === 'visa_free' || flight.visaStatus === 'visa_on_arrival') && (
            <Chip
              label={flight.visaStatus === 'visa_free' ? t('common.visaFree') : t('common.visaOnArrival')}
              size="small"
              sx={{
                bgcolor: flight.visaStatus === 'visa_free' ? 'rgba(40, 167, 69, 0.9)' : 'rgba(255, 193, 7, 0.9)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                textShadow: '0 1px 1px rgba(0,0,0,0.2)'
              }}
            />
          )}
          
          {/* 低价标签 */}
          {flight.price < priceThreshold && (
            <Chip
              label={t('common.lowPrice')}
              size="small"
              sx={{
                bgcolor: 'rgba(13, 110, 253, 0.85)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                textShadow: '0 1px 1px rgba(0,0,0,0.2)'
              }}
            />
          )}
        </Box>

        {/* 底部：热度指示器 */}
        {(flight.hotScore || flight.popularity) && (
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
                color: (flight.hotScore || flight.popularity) >= 80 ? '#ff4444' :
                       (flight.hotScore || flight.popularity) >= 60 ? '#ff8800' : '#ffaa00'
              }}
            />
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
              {flight.hotScore || flight.popularity}
            </Typography>
          </Box>
        )}

        {/* 价格趋势指示器 */}
        {flight.priceTrend && flight.priceTrend !== 'stable' && (
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
              py: 0.5,

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
              {flight.destination} ({flight.code})
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
              variant="h6"
              sx={{
                fontWeight: 700,
                color: flight.price < priceThreshold ? '#0d6efd' : '#212529',
                fontSize: '1.3rem'
              }}
            >
              {flight.price}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.7rem' }}>
              {flight.currency || 'CNY'}
            </Typography>

            {/* 价格变化信息 */}
            {flight.previousPrice && flight.priceChange && flight.priceChange !== 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: flight.priceTrend === 'down' ? '#28a745' : '#dc3545',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textDecoration: 'line-through'
                  }}
                >
                  ¥{flight.previousPrice}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: flight.priceTrend === 'down' ? '#28a745' : '#dc3545',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    ml: 0.5
                  }}
                >
                  {flight.priceTrend === 'down' ? '↓' : '↑'}{Math.abs(flight.priceChangePercent)}%
                </Typography>
              </Box>
            )}
          </Box>
        </Box>





        {/* 航班详情 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
            <LocationOn sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
            <span style={{ fontWeight: 600, color: '#0d6efd' }}>{currentCity}</span>
            <ArrowForward sx={{ fontSize: '0.8rem', mx: 0.5, color: '#6c757d' }} />
            <span>{flight.destination}</span>
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
            <CalendarToday sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
            {t('common.roundTrip')}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.8, color: '#495057' }}>
            <AccessTime sx={{ fontSize: '1rem', mr: 1, color: '#0d6efd', width: 16 }} />
            {flight.departDate} - {flight.returnDate}
          </Typography>

        </Box>

        {/* 预订按钮 */}
        <Button
          fullWidth
          variant="contained"
          onClick={() => onBooking && onBooking(flight)}
          sx={{
            borderRadius: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            minHeight: '44px',
            ...buttonGlassStyle,
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(13, 110, 253, 0.8) 0%, rgba(11, 94, 215, 0.8) 100%)'
              : 'linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)',
            '&:hover': {
              ...buttonGlassStyle['&:hover'],
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(11, 94, 215, 0.9) 0%, rgba(9, 78, 180, 0.9) 100%)'
                : 'linear-gradient(135deg, #0b5ed7 0%, #094eb4 100%)',
              transform: 'translateY(-2px) scale(1.02)'
            }
          }}
        >
          {t('flight.bookNow')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DestinationCard;
