import { useState, useCallback, useMemo } from 'react';

export function useVirtualScroll({ 
  totalItems, 
  itemHeight, 
  containerHeight,
  bufferSize = 5 
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Calculate which items should be rendered based on scroll position
  // Only renders visible items + buffer to prevent flickering during fast scrolling
  const visibleRange = useMemo(() => {
    // Calculate first visible item index from scroll position
    const startIndex = Math.floor(scrollTop / itemHeight);
    // Calculate how many items fit in viewport
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    // Add buffer above and below viewport for smooth scrolling
    const start = Math.max(0, startIndex - bufferSize);
    const end = Math.min(totalItems, startIndex + visibleCount + bufferSize);
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, totalItems, bufferSize]);

  // Total height maintains correct scrollbar size
  const totalHeight = totalItems * itemHeight;
  // Offset positions visible items correctly in the virtual space
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
    scrollTop
  };
}
