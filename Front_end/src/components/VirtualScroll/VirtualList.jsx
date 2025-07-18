import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { useMobile } from '../../hooks/useMobile';
import { mobilePerformance } from '../../utils/mobileUtils';

/**
 * 虚拟滚动列表组件
 * 优化大量数据的渲染性能
 */
const VirtualList = ({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  onScroll,
  onEndReached,
  endReachedThreshold = 0.8,
  estimatedItemHeight,
  getItemHeight,
  horizontal = false,
  sx = {},
  ...props
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerSize, setContainerSize] = useState(containerHeight);
  const containerRef = useRef(null);
  const scrollElementRef = useRef(null);
  const { isMobile, performanceLevel } = useMobile();

  // 根据性能等级调整overscan
  const optimizedOverscan = useMemo(() => {
    if (performanceLevel === 'low') return Math.min(overscan, 3);
    if (performanceLevel === 'medium') return overscan;
    return overscan + 2;
  }, [overscan, performanceLevel]);

  // 动态计算项目高度
  const getItemSize = useCallback((index) => {
    if (getItemHeight) {
      return getItemHeight(index);
    }
    return estimatedItemHeight || itemHeight;
  }, [getItemHeight, estimatedItemHeight, itemHeight]);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (items.length === 0) return { start: 0, end: 0 };

    let start = 0;
    let end = 0;
    let offset = 0;

    // 找到开始索引
    for (let i = 0; i < items.length; i++) {
      const size = getItemSize(i);
      if (offset + size > scrollOffset) {
        start = Math.max(0, i - optimizedOverscan);
        break;
      }
      offset += size;
    }

    // 找到结束索引
    offset = 0;
    for (let i = 0; i < items.length; i++) {
      const size = getItemSize(i);
      if (i >= start) {
        if (offset > containerSize + scrollOffset) {
          end = Math.min(items.length - 1, i + optimizedOverscan);
          break;
        }
      }
      if (i >= start) {
        offset += size;
      } else {
        // 跳过start之前的项目
        for (let j = 0; j < start; j++) {
          offset += getItemSize(j);
        }
        i = start - 1; // 下次循环从start开始
      }
    }

    if (end === 0) {
      end = items.length - 1;
    }

    return { start, end };
  }, [items.length, scrollOffset, containerSize, getItemSize, optimizedOverscan]);

  // 计算总高度
  const totalSize = useMemo(() => {
    return items.reduce((total, _, index) => total + getItemSize(index), 0);
  }, [items, getItemSize]);

  // 计算偏移量
  const getOffsetForIndex = useCallback((index) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemSize(i);
    }
    return offset;
  }, [getItemSize]);

  // 节流滚动处理
  const throttledScrollHandler = useMemo(
    () => mobilePerformance.throttle((e) => {
      const element = e.target;
      const newScrollOffset = horizontal ? element.scrollLeft : element.scrollTop;
      
      setScrollOffset(newScrollOffset);
      onScroll?.(e, newScrollOffset);

      // 检查是否到达底部
      const scrollRatio = horizontal
        ? (element.scrollLeft + element.clientWidth) / element.scrollWidth
        : (element.scrollTop + element.clientHeight) / element.scrollHeight;

      if (scrollRatio >= endReachedThreshold) {
        onEndReached?.();
      }
    }, isMobile ? 16 : 8), // 移动端降低频率
    [horizontal, onScroll, onEndReached, endReachedThreshold, isMobile]
  );

  // 监听容器大小变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const size = horizontal ? entry.contentRect.width : entry.contentRect.height;
        setContainerSize(size);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [horizontal]);

  // 渲染可见项目
  const renderVisibleItems = () => {
    const items_to_render = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (i >= items.length) break;
      
      const item = items[i];
      const offset = getOffsetForIndex(i);
      const size = getItemSize(i);
      
      const style = horizontal
        ? {
            position: 'absolute',
            left: offset,
            width: size,
            height: '100%',
            top: 0
          }
        : {
            position: 'absolute',
            top: offset,
            height: size,
            width: '100%',
            left: 0
          };

      items_to_render.push(
        <div key={i} style={style}>
          {renderItem(item, i, style)}
        </div>
      );
    }

    return items_to_render;
  };

  // 滚动到指定索引
  const scrollToIndex = useCallback((index, align = 'auto') => {
    if (!scrollElementRef.current) return;

    const offset = getOffsetForIndex(index);
    const size = getItemSize(index);

    let scrollTo = offset;

    if (align === 'center') {
      scrollTo = offset - (containerSize - size) / 2;
    } else if (align === 'end') {
      scrollTo = offset - containerSize + size;
    }

    scrollTo = Math.max(0, Math.min(scrollTo, totalSize - containerSize));

    if (horizontal) {
      scrollElementRef.current.scrollLeft = scrollTo;
    } else {
      scrollElementRef.current.scrollTop = scrollTo;
    }
  }, [getOffsetForIndex, getItemSize, containerSize, totalSize, horizontal]);

  // 滚动到指定偏移量
  const scrollToOffset = useCallback((offset) => {
    if (!scrollElementRef.current) return;

    if (horizontal) {
      scrollElementRef.current.scrollLeft = offset;
    } else {
      scrollElementRef.current.scrollTop = offset;
    }
  }, [horizontal]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: horizontal ? 'auto' : containerHeight,
        width: horizontal ? containerHeight : 'auto',
        overflow: 'hidden',
        position: 'relative',
        ...sx
      }}
      {...props}
    >
      <Box
        ref={scrollElementRef}
        onScroll={throttledScrollHandler}
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'auto',
          // 移动端滚动优化
          WebkitOverflowScrolling: 'touch',
          overflowScrolling: 'touch',
          // 隐藏滚动条（可选）
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: isMobile ? '2px' : '6px',
            height: isMobile ? '2px' : '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '3px'
          }
        }}
      >
        {/* 虚拟容器 */}
        <Box
          sx={{
            position: 'relative',
            height: horizontal ? '100%' : totalSize,
            width: horizontal ? totalSize : '100%',
            minHeight: horizontal ? 'auto' : 1,
            minWidth: horizontal ? 1 : 'auto'
          }}
        >
          {renderVisibleItems()}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * 虚拟网格组件
 */
const VirtualGrid = ({
  items = [],
  itemWidth = 200,
  itemHeight = 200,
  containerWidth = 800,
  containerHeight = 600,
  columnCount,
  renderItem,
  gap = 8,
  overscan = 5,
  onScroll,
  sx = {},
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const { isMobile, performanceLevel } = useMobile();

  // 计算列数
  const actualColumnCount = columnCount || Math.floor((containerWidth + gap) / (itemWidth + gap));
  
  // 计算行数
  const rowCount = Math.ceil(items.length / actualColumnCount);
  
  // 根据性能调整overscan
  const optimizedOverscan = performanceLevel === 'low' ? Math.min(overscan, 2) : overscan;

  // 计算可见行范围
  const visibleRowRange = useMemo(() => {
    const rowHeight = itemHeight + gap;
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - optimizedOverscan);
    const endRow = Math.min(
      rowCount - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + optimizedOverscan
    );
    
    return { start: startRow, end: endRow };
  }, [scrollTop, containerHeight, itemHeight, gap, rowCount, optimizedOverscan]);

  // 节流滚动处理
  const throttledScrollHandler = useMobile(
    () => mobilePerformance.throttle((e) => {
      setScrollTop(e.target.scrollTop);
      onScroll?.(e);
    }, isMobile ? 16 : 8),
    [onScroll, isMobile]
  );

  // 渲染可见项目
  const renderVisibleItems = () => {
    const visibleItems = [];
    
    for (let row = visibleRowRange.start; row <= visibleRowRange.end; row++) {
      for (let col = 0; col < actualColumnCount; col++) {
        const index = row * actualColumnCount + col;
        if (index >= items.length) break;
        
        const item = items[index];
        const x = col * (itemWidth + gap);
        const y = row * (itemHeight + gap);
        
        const style = {
          position: 'absolute',
          left: x,
          top: y,
          width: itemWidth,
          height: itemHeight
        };
        
        visibleItems.push(
          <div key={index} style={style}>
            {renderItem(item, index, { row, col })}
          </div>
        );
      }
    }
    
    return visibleItems;
  };

  const totalHeight = rowCount * (itemHeight + gap) - gap;

  return (
    <Box
      ref={containerRef}
      sx={{
        width: containerWidth,
        height: containerHeight,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        overflowScrolling: 'touch',
        ...sx
      }}
      onScroll={throttledScrollHandler}
      {...props}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: totalHeight
        }}
      >
        {renderVisibleItems()}
      </Box>
    </Box>
  );
};

export { VirtualList, VirtualGrid };
export default VirtualList;
