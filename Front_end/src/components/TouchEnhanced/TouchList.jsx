import React, { useState, useRef, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Collapse,
  Typography
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import GestureDetector from './GestureDetector';
import { TouchIconButton } from './TouchButton';
import { useMobile, useMobilePerformance } from '../../hooks/useMobile';

/**
 * 触摸优化的列表项组件
 */
const TouchListItem = ({
  primary,
  secondary,
  icon,
  avatar,
  actions = [],
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  enableSwipeActions = true,
  enableLongPress = true,
  children,
  sx = {},
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { isMobile } = useMobile();
  const { getOptimizedConfig } = useMobilePerformance();
  
  const config = getOptimizedConfig({
    enableTransitions: true,
    animationDuration: 200
  });

  // 处理滑动显示操作按钮
  const handleSwipeLeft = useCallback((e, gestureData) => {
    if (enableSwipeActions && actions.length > 0) {
      setShowActions(true);
      // 触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
    onSwipeLeft?.(e, gestureData);
  }, [enableSwipeActions, actions.length, onSwipeLeft]);

  // 处理滑动隐藏操作按钮
  const handleSwipeRight = useCallback((e, gestureData) => {
    if (showActions) {
      setShowActions(false);
    }
    onSwipeRight?.(e, gestureData);
  }, [showActions, onSwipeRight]);

  // 处理长按
  const handleLongPress = useCallback((e, gestureData) => {
    if (enableLongPress) {
      setShowActions(!showActions);
      // 触觉反馈
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
    onLongPress?.(e, gestureData);
  }, [enableLongPress, showActions, onLongPress]);

  // 处理点击
  const handleTap = useCallback((e) => {
    if (showActions) {
      setShowActions(false);
      return;
    }
    onTap?.(e);
  }, [showActions, onTap]);

  // 切换展开状态
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        ...sx
      }}
    >
      <GestureDetector
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onLongPress={handleLongPress}
        enableSwipe={isMobile}
        enableLongPress={isMobile && enableLongPress}
        swipeThreshold={30}
      >
        <ListItem
          disablePadding
          sx={{
            transition: config.enableTransitions 
              ? `transform ${config.animationDuration}ms ease`
              : 'none',
            transform: showActions ? 'translateX(-80px)' : 'translateX(0)',
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          {...props}
        >
          <ListItemButton
            onClick={handleTap}
            sx={{
              minHeight: isMobile ? 56 : 48,
              px: 2,
              py: 1
            }}
          >
            {icon && (
              <ListItemIcon sx={{ minWidth: 40 }}>
                {icon}
              </ListItemIcon>
            )}
            
            {avatar && (
              <Box sx={{ mr: 2 }}>
                {avatar}
              </Box>
            )}
            
            <ListItemText
              primary={primary}
              secondary={secondary}
              primaryTypographyProps={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 500
              }}
              secondaryTypographyProps={{
                fontSize: isMobile ? '12px' : '14px',
                color: 'text.secondary'
              }}
            />
            
            {children && (
              <TouchIconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded();
                }}
              >
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </TouchIconButton>
            )}
          </ListItemButton>
        </ListItem>
      </GestureDetector>

      {/* 滑动操作按钮 */}
      {actions.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'error.main',
            transition: config.enableTransitions 
              ? `opacity ${config.animationDuration}ms ease`
              : 'none',
            opacity: showActions ? 1 : 0,
            pointerEvents: showActions ? 'auto' : 'none'
          }}
        >
          {actions.map((action, index) => (
            <TouchIconButton
              key={index}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                action.onClick?.(e);
                setShowActions(false);
              }}
              sx={{
                color: 'white',
                mx: 0.5
              }}
            >
              {action.icon}
            </TouchIconButton>
          ))}
        </Box>
      )}

      {/* 可展开内容 */}
      {children && (
        <Collapse in={isExpanded} timeout={config.animationDuration}>
          <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
            {children}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

/**
 * 触摸优化的列表组件
 */
const TouchList = ({
  items = [],
  renderItem,
  onItemTap,
  onItemSwipeLeft,
  onItemSwipeRight,
  onItemLongPress,
  enableVirtualization = false,
  itemHeight = 56,
  maxHeight,
  emptyText = '暂无数据',
  emptyIcon,
  sx = {},
  ...props
}) => {
  const listRef = useRef(null);

  // 渲染空状态
  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        color: 'text.secondary'
      }}
    >
      {emptyIcon && (
        <Box sx={{ mb: 2, opacity: 0.5 }}>
          {emptyIcon}
        </Box>
      )}
      <Typography variant="body2" color="text.secondary">
        {emptyText}
      </Typography>
    </Box>
  );

  // 渲染列表项
  const renderListItem = (item, index) => {
    if (renderItem) {
      return renderItem(item, index);
    }

    return (
      <TouchListItem
        key={item.id || index}
        primary={item.primary}
        secondary={item.secondary}
        icon={item.icon}
        avatar={item.avatar}
        actions={item.actions}
        onTap={(e) => onItemTap?.(item, index, e)}
        onSwipeLeft={(e, gestureData) => onItemSwipeLeft?.(item, index, e, gestureData)}
        onSwipeRight={(e, gestureData) => onItemSwipeRight?.(item, index, e, gestureData)}
        onLongPress={(e, gestureData) => onItemLongPress?.(item, index, e, gestureData)}
      >
        {item.children}
      </TouchListItem>
    );
  };

  return (
    <List
      ref={listRef}
      sx={{
        width: '100%',
        maxHeight,
        overflow: 'auto',
        // 移动端滚动优化
        WebkitOverflowScrolling: 'touch',
        overflowScrolling: 'touch',
        ...sx
      }}
      {...props}
    >
      {items.length === 0 ? renderEmptyState() : items.map(renderListItem)}
    </List>
  );
};

export { TouchListItem, TouchList };
export default TouchList;
