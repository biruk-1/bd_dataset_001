import React, { useRef, useEffect, useState } from 'react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import './VirtualList.css';

const VirtualList = ({ 
  items, 
  itemHeight, 
  renderItem, 
  className = '' 
}) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;

    const measureHeight = () => {
      setContainerHeight(containerRef.current.clientHeight);
    };

    measureHeight();
    window.addEventListener('resize', measureHeight);
    return () => window.removeEventListener('resize', measureHeight);
  }, []);

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

  // Only slice the items that need to be rendered (core virtualization logic)
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div 
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      onScroll={handleScroll}
      data-testid="virtual-list-container"
    >
      {/* Spacer maintains total scroll height so scrollbar works correctly */}
      <div 
        className="virtual-list-spacer"
        style={{ height: `${totalHeight}px` }}
        data-testid="virtual-list-spacer"
      />
      
      {/* Transform positions visible items in virtual space without affecting layout */}
      <div 
        className="virtual-list-content"
        style={{ transform: `translateY(${offsetY}px)` }}
        data-testid="virtual-list-content"
      >
        {visibleItems.map((item, index) => {
          // Calculate actual index in full list for proper item identification
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
