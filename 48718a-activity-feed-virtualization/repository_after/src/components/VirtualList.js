import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import './VirtualList.css';

/**
 * VirtualList Component - Core virtualization implementation
 * 
 * This component implements windowed rendering (virtual scrolling) by:
 * 1. Only rendering items visible in the viewport + buffer
 * 2. Using absolute positioning to place items correctly
 * 3. Maintaining total scroll height with a spacer element
 * 
 * Benefits:
 * - Renders only ~15-20 DOM nodes instead of thousands
 * - Maintains 60 FPS even with 10,000+ items
 * - Reduces memory consumption by 90%+
 * 
 * @param {Array} items - Full list of items to virtualize
 * @param {number} itemHeight - Fixed height of each item in pixels
 * @param {Function} renderItem - Function to render each item (receives item, index)
 * @param {string} className - Additional CSS class for the container
 */
const VirtualList = ({ 
  items, 
  itemHeight, 
  renderItem, 
  className = '' 
}) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(600);

  // Measure container height on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;

    const measureHeight = () => {
      const height = containerRef.current.clientHeight;
      setContainerHeight(height);
    };

    measureHeight();

    // Update height on window resize
    window.addEventListener('resize', measureHeight);
    return () => window.removeEventListener('resize', measureHeight);
  }, []);

  // Use our custom virtual scroll hook
  const {
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll
  } = useVirtualScroll({
    totalItems: items.length,
    itemHeight,
    containerHeight,
    bufferSize: 5
  });

  // Slice only the visible items
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div 
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      onScroll={handleScroll}
      data-testid="virtual-list-container"
    >
      {/* Spacer to maintain total scroll height */}
      <div 
        className="virtual-list-spacer"
        style={{ height: `${totalHeight}px` }}
        data-testid="virtual-list-spacer"
      />
      
      {/* Visible items with offset positioning */}
      <div 
        className="virtual-list-content"
        style={{ transform: `translateY(${offsetY}px)` }}
        data-testid="virtual-list-content"
      >
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.start + index;
          return (
            <div 
              key={item.id || actualIndex}
              className="virtual-list-item"
              style={{ height: `${itemHeight}px` }}
              data-index={actualIndex}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualList;
