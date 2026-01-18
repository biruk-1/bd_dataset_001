import { renderHook, act } from '@testing-library/react';
import { useVirtualScroll } from '../hooks/useVirtualScroll';

describe('useVirtualScroll Hook', () => {
  const defaultProps = {
    totalItems: 100,
    itemHeight: 200,
    containerHeight: 600,
    bufferSize: 5
  };

  test('calculates initial visible range correctly', () => {
    const { result } = renderHook(() => useVirtualScroll(defaultProps));

    // With containerHeight=600 and itemHeight=200, we can fit 3 items
    // With bufferSize=5, we should render 0-8 (start=0, visible=3, buffer=5)
    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.visibleRange.end).toBe(8); // 0 + 3 + 5
  });

  test('calculates total height correctly', () => {
    const { result } = renderHook(() => useVirtualScroll(defaultProps));

    // Total height should be totalItems * itemHeight
    expect(result.current.totalHeight).toBe(100 * 200);
    expect(result.current.totalHeight).toBe(20000);
  });

  test('calculates offsetY as zero initially', () => {
    const { result } = renderHook(() => useVirtualScroll(defaultProps));

    // Initial offset should be 0
    expect(result.current.offsetY).toBe(0);
  });

  test('updates visible range when scrolling down', () => {
    const { result } = renderHook(() => useVirtualScroll(defaultProps));

    // Simulate scroll to position 1000px
    const mockScrollEvent = {
      target: { scrollTop: 1000 }
    };

    act(() => {
      result.current.handleScroll(mockScrollEvent);
    });

    // At scrollTop=1000, itemHeight=200: startIndex = floor(1000/200) = 5
    // With bufferSize=5: start = max(0, 5-5) = 0
    // visibleCount = ceil(600/200) = 3
    // end = min(100, 5+3+5) = 13
    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.visibleRange.end).toBe(13);
  });

  test('handles scroll to bottom correctly', () => {
    const { result } = renderHook(() => useVirtualScroll(defaultProps));

    // Scroll to near bottom: scrollTop = 19000 (close to totalHeight=20000)
    const mockScrollEvent = {
      target: { scrollTop: 19000 }
    };

    act(() => {
      result.current.handleScroll(mockScrollEvent);
    });

    // startIndex = floor(19000/200) = 95
    // end should not exceed totalItems
    expect(result.current.visibleRange.end).toBe(100);
    expect(result.current.visibleRange.end).toBeLessThanOrEqual(defaultProps.totalItems);
  });

  test('ensures start index never goes negative', () => {
    const { result } = renderHook(() => useVirtualScroll(defaultProps));

    // Scroll to top
    const mockScrollEvent = {
      target: { scrollTop: 0 }
    };

    act(() => {
      result.current.handleScroll(mockScrollEvent);
    });

    expect(result.current.visibleRange.start).toBeGreaterThanOrEqual(0);
  });

  test('works with different item heights', () => {
    const props = {
      ...defaultProps,
      itemHeight: 100
    };

    const { result } = renderHook(() => useVirtualScroll(props));

    // With itemHeight=100, containerHeight=600: 6 items visible
    // With bufferSize=5: 0-11
    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.visibleRange.end).toBe(11);
    expect(result.current.totalHeight).toBe(100 * 100);
  });

  test('works with small item counts', () => {
    const props = {
      ...defaultProps,
      totalItems: 5
    };

    const { result } = renderHook(() => useVirtualScroll(props));

    // With only 5 items, end should not exceed 5
    expect(result.current.visibleRange.end).toBeLessThanOrEqual(5);
    expect(result.current.totalHeight).toBe(5 * 200);
  });

  test('calculates offsetY based on start index', () => {
    const { result } = renderHook(() => useVirtualScroll(defaultProps));

    // Scroll to position where start index is 10
    const mockScrollEvent = {
      target: { scrollTop: 3000 } // startIndex = floor(3000/200) = 15, start = 15-5 = 10
    };

    act(() => {
      result.current.handleScroll(mockScrollEvent);
    });

    // offsetY should be start * itemHeight = 10 * 200 = 2000
    expect(result.current.offsetY).toBe(10 * 200);
  });

  test('handles zero buffer size', () => {
    const props = {
      ...defaultProps,
      bufferSize: 0
    };

    const { result } = renderHook(() => useVirtualScroll(props));

    // With no buffer, should only render visible items (3 items)
    expect(result.current.visibleRange.end - result.current.visibleRange.start).toBe(3);
  });

  test('handleScroll is memoized', () => {
    const { result, rerender } = renderHook(() => useVirtualScroll(defaultProps));

    const firstHandleScroll = result.current.handleScroll;
    
    rerender();

    // handleScroll reference should remain the same
    expect(result.current.handleScroll).toBe(firstHandleScroll);
  });
});
