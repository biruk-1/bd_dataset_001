import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Custom hook for virtual scrolling
 * 
 * This hook calculates which items should be rendered based on the scroll position.
 * It only renders items that are visible in the viewport plus a buffer zone above and below.
 * 
 * @param {number} totalItems - Total number of items in the list
 * @param {number} itemHeight - Height of each item in pixels (must be fixed)
 * @param {number} containerHeight - Height of the scrollable container
 * @param {number} bufferSize - Number of items to render above/below viewport
 * @returns {object} - Contains visible range, total height, offset, and scroll handler
 */
export function useVirtualScroll({ 
  totalItems, 
  itemHeight, 
  containerHeight,
  bufferSize = 5 
}) {
  const [scrollTop, setScrollTop] = useState(0);

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Calculate which items are visible
  const visibleRange = useMemo(() => {
    // Calculate the first visible item index
    const startIndex = Math.floor(scrollTop / itemHeight);
    
    // Calculate how many items fit in the viewport
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    // Add buffer above and below
    const start = Math.max(0, startIndex - bufferSize);
    const end = Math.min(
      totalItems,
      startIndex + visibleCount + bufferSize
    );

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, totalItems, bufferSize]);

  // Calculate total height for the scrollable area
  const totalHeight = totalItems * itemHeight;

  // Calculate offset to position visible items correctly
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll,
    scrollTop
  };
}
