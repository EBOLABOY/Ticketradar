import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Collapse,
  Divider,
  LinearProgress,
  Skeleton
} from '@mui/material';
import {
  MoreVert,
  ExpandMore,
  Share,
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';
import { TouchCard } from '../TouchEnhanced';
import { LazyImage } from '../LazyLoad';
import { useMobile } from '../../hooks/useMobile';
import { createAppleGlass } from '../../utils/glassmorphism';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

/**
 * 移动端优化的基础卡片组件
 */
const MobileCard = ({
  title,
  subtitle,
  content,
  image,
  avatar,
  actions = [],
  chips = [],
  expandable = false,
  expandedContent,
  loading = false,
  onClick,
  onShare,
  onFavorite,
  onBookmark,
  isFavorited = false,
  isBookmarked = false,
  progress,
  sx = {},
  ...props
}) => {
  const [expanded, setExpanded] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const { isMobile } = useMobile();
  const { isDarkMode, theme: themeMode } = useCustomTheme();

  const createGlassCard = () => {
    const baseGlass = createAppleGlass('secondary', themeMode);
    return {
      ...baseGlass,
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
      '&:hover': {
        transform: onClick ? 'translateY(-2px)' : 'none',
        boxShadow: onClick ? (isDarkMode 
          ? '0 12px 32px rgba(0, 0, 0, 0.6)' 
          : '0 12px 32px rgba(31, 38, 135, 0.4)') : undefined
      }
    };
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setFavorited(!favorited);
    onFavorite?.(!favorited);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    onBookmark?.(!bookmarked);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    onShare?.();
  };

  if (loading) {
    return (
      <Card sx={{ ...createGlassCard(), ...sx }} elevation={0}>
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton variant="text" width="60%" />}
          subheader={<Skeleton variant="text" width="40%" />}
        />
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <TouchCard
      onClick={onClick}
      enableHaptic={isMobile}
      sx={{ ...createGlassCard(), ...sx }}
      {...props}
    >
      <Card elevation={0} sx={{ backgroundColor: 'transparent' }}>
        {/* 卡片头部 */}
        {(title || subtitle || avatar) && (
          <CardHeader
            avatar={avatar}
            title={
              <Typography
                variant="h6"
                sx={{
                  fontSize: isMobile ? '16px' : '14px',
                  fontWeight: 600,
                  color: isDarkMode ? '#e8eaed' : '#202124'
                }}
              >
                {title}
              </Typography>
            }
            subheader={
              subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: isMobile ? '14px' : '12px',
                    color: isDarkMode ? '#9aa0a6' : '#5f6368',
                    mt: 0.5
                  }}
                >
                  {subtitle}
                </Typography>
              )
            }
            action={
              <IconButton
                size="small"
                sx={{ color: isDarkMode ? '#9aa0a6' : '#5f6368' }}
              >
                <MoreVert />
              </IconButton>
            }
            sx={{
              pb: image ? 1 : 2,
              '& .MuiCardHeader-content': {
                overflow: 'hidden'
              }
            }}
          />
        )}

        {/* 进度条 */}
        {progress !== undefined && (
          <Box sx={{ px: 2, pb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }}
            />
          </Box>
        )}

        {/* 图片 */}
        {image && (
          <Box sx={{ position: 'relative' }}>
            <LazyImage
              src={image}
              alt={title}
              width="100%"
              height={isMobile ? 200 : 160}
              objectFit="cover"
              showSkeleton
            />
            
            {/* 图片上的操作按钮 */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 1
              }}
            >
              {onShare && (
                <IconButton
                  size="small"
                  onClick={handleShareClick}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    }
                  }}
                >
                  <Share fontSize="small" />
                </IconButton>
              )}
              
              {onFavorite && (
                <IconButton
                  size="small"
                  onClick={handleFavoriteClick}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: favorited ? '#f44336' : 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    }
                  }}
                >
                  {favorited ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                </IconButton>
              )}
            </Box>
          </Box>
        )}

        {/* 标签 */}
        {chips.length > 0 && (
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {chips.map((chip, index) => (
                <Chip
                  key={index}
                  label={chip.label}
                  size="small"
                  variant={chip.variant || 'outlined'}
                  color={chip.color || 'default'}
                  sx={{
                    fontSize: isMobile ? '12px' : '11px',
                    height: isMobile ? 24 : 20
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 卡片内容 */}
        {content && (
          <CardContent sx={{ pt: chips.length > 0 ? 1 : 2 }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: isMobile ? '14px' : '13px',
                lineHeight: 1.5,
                color: isDarkMode ? '#e8eaed' : '#202124'
              }}
            >
              {content}
            </Typography>
          </CardContent>
        )}

        {/* 可展开内容 */}
        {expandable && expandedContent && (
          <Collapse in={expanded} timeout={300}>
            <Divider sx={{ borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' }} />
            <CardContent>
              {expandedContent}
            </CardContent>
          </Collapse>
        )}

        {/* 卡片操作 */}
        {(actions.length > 0 || expandable || onBookmark) && (
          <CardActions
            sx={{
              justifyContent: 'space-between',
              px: 2,
              py: 1.5
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actions.map((action, index) => (
                <IconButton
                  key={index}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.(e);
                  }}
                  sx={{
                    color: isDarkMode ? '#9aa0a6' : '#5f6368',
                    minWidth: isMobile ? 44 : 36,
                    minHeight: isMobile ? 44 : 36
                  }}
                >
                  {action.icon}
                </IconButton>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {onBookmark && (
                <IconButton
                  size="small"
                  onClick={handleBookmarkClick}
                  sx={{
                    color: bookmarked ? '#1976d2' : (isDarkMode ? '#9aa0a6' : '#5f6368'),
                    minWidth: isMobile ? 44 : 36,
                    minHeight: isMobile ? 44 : 36
                  }}
                >
                  {bookmarked ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                </IconButton>
              )}
              
              {expandable && (
                <IconButton
                  size="small"
                  onClick={handleExpandClick}
                  sx={{
                    color: isDarkMode ? '#9aa0a6' : '#5f6368',
                    minWidth: isMobile ? 44 : 36,
                    minHeight: isMobile ? 44 : 36,
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <ExpandMore fontSize="small" />
                </IconButton>
              )}
            </Box>
          </CardActions>
        )}
      </Card>
    </TouchCard>
  );
};

/**
 * 移动端航班卡片组件
 */
const MobileFlightCard = ({
  flight,
  onSelect,
  onBookmark,
  isBookmarked = false,
  sx = {},
  ...props
}) => {
  const { isMobile } = useMobile();
  const { isDarkMode } = useCustomTheme();

  const formatTime = (datetime) => {
    return new Date(datetime).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <MobileCard
      onClick={() => onSelect?.(flight)}
      onBookmark={onBookmark}
      isBookmarked={isBookmarked}
      sx={{
        mb: 2,
        ...sx
      }}
      {...props}
    >
      <CardContent sx={{ p: isMobile ? 2 : 1.5 }}>
        {/* 航空公司信息 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={flight.airline?.logoUrl}
            sx={{ width: 32, height: 32, mr: 1.5 }}
          >
            {flight.airline?.name?.[0]}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontSize: isMobile ? '14px' : '12px',
                color: isDarkMode ? '#e8eaed' : '#202124'
              }}
            >
              {flight.airline?.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? '#9aa0a6' : '#5f6368',
                fontSize: isMobile ? '12px' : '10px'
              }}
            >
              {flight.flightNumber}
            </Typography>
          </Box>
        </Box>

        {/* 航班路线 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: isMobile ? '18px' : '16px',
                color: isDarkMode ? '#e8eaed' : '#202124'
              }}
            >
              {formatTime(flight.departureTime)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? '#9aa0a6' : '#5f6368',
                fontSize: isMobile ? '12px' : '10px'
              }}
            >
              {flight.origin}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', flex: 1, px: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? '#9aa0a6' : '#5f6368',
                fontSize: isMobile ? '11px' : '9px'
              }}
            >
              {formatDuration(flight.duration)}
            </Typography>
            <Box
              sx={{
                height: 2,
                backgroundColor: isDarkMode ? '#9aa0a6' : '#5f6368',
                my: 0.5,
                position: 'relative',
                '&::after': {
                  content: '✈️',
                  position: 'absolute',
                  right: -8,
                  top: -8,
                  fontSize: '12px'
                }
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? '#9aa0a6' : '#5f6368',
                fontSize: isMobile ? '11px' : '9px'
              }}
            >
              {flight.stops === 0 ? '直飞' : `${flight.stops}次中转`}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: isMobile ? '18px' : '16px',
                color: isDarkMode ? '#e8eaed' : '#202124'
              }}
            >
              {formatTime(flight.arrivalTime)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? '#9aa0a6' : '#5f6368',
                fontSize: isMobile ? '12px' : '10px'
              }}
            >
              {flight.destination}
            </Typography>
          </Box>
        </Box>

        {/* 价格信息 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1976d2',
                fontSize: isMobile ? '20px' : '18px'
              }}
            >
              ¥{flight.price}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDarkMode ? '#9aa0a6' : '#5f6368',
                fontSize: isMobile ? '11px' : '9px'
              }}
            >
              含税费
            </Typography>
          </Box>

          {flight.priceChange && (
            <Chip
              label={`${flight.priceChange > 0 ? '+' : ''}¥${flight.priceChange}`}
              size="small"
              color={flight.priceChange > 0 ? 'error' : 'success'}
              sx={{
                fontSize: isMobile ? '11px' : '9px',
                height: isMobile ? 24 : 20
              }}
            />
          )}
        </Box>
      </CardContent>
    </MobileCard>
  );
};

export { MobileCard, MobileFlightCard };
export default MobileCard;
