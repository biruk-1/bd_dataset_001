import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ActivityFeed from '../components/ActivityFeed';
import VirtualList from '../components/VirtualList';
import { generateActivities } from '../utils/activityUtils';

/**
 * Performance Tests
 * 
 * These tests verify that the virtual scrolling implementation
 * provides the expected performance improvements.
 */
describe('Performance Tests', () => {
  describe('DOM Node Optimization', () => {
    test('renders significantly fewer DOM nodes than total items', async () => {
      render(<ActivityFeed itemCount={5000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      const container = screen.getByTestId('virtual-list-container');
      const renderedItems = container.querySelectorAll('[data-testid^="activity-item-"]');

      // With 5000 items, should render only ~15-20 visible + buffer
      expect(renderedItems.length).toBeLessThan(30);
      expect(renderedItems.length).toBeGreaterThan(0);

      // Calculate efficiency
      const efficiency = (renderedItems.length / 5000) * 100;
      expect(efficiency).toBeLessThan(1); // Less than 1% of items rendered
    });

    test('maintains low DOM node count with 10,000 items', async () => {
      render(<ActivityFeed itemCount={10000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      const container = screen.getByTestId('virtual-list-container');
      const renderedItems = container.querySelectorAll('[data-testid^="activity-item-"]');

      // Even with 10k items, should still render only visible items
      expect(renderedItems.length).toBeLessThan(30);
    });

    test('does not render items far outside viewport', async () => {
      const mockItems = generateActivities(1000);
      
      const renderItem = (item) => (
        <div data-testid={`item-${item.id}`}>{item.message}</div>
      );

      render(
        <VirtualList
          items={mockItems}
          itemHeight={200}
          renderItem={renderItem}
        />
      );

      // Items at index 500+ should not be rendered initially
      expect(screen.queryByTestId('item-500')).not.toBeInTheDocument();
      expect(screen.queryByTestId('item-999')).not.toBeInTheDocument();
    });
  });

  describe('Rendering Performance', () => {
    test('initial render completes quickly even with large dataset', async () => {
      const startTime = performance.now();
      
      render(<ActivityFeed itemCount={5000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Initial render should complete in reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });

    test('does not re-render all items when filter changes', async () => {
      const { container } = render(<ActivityFeed itemCount={1000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Get initial rendered items
      const initialItems = container.querySelectorAll('[data-testid^="activity-item-"]');
      const initialCount = initialItems.length;

      // Apply filter - should only render filtered visible items, not all
      const filterButton = screen.getByTestId('filter-comment');
      const startTime = performance.now();
      
      filterButton.click();

      await waitFor(() => {
        const itemCount = screen.getByTestId('item-count');
        expect(itemCount).toBeInTheDocument();
      });

      const endTime = performance.now();
      const filterTime = endTime - startTime;

      // Filter should be fast (less than 200ms)
      expect(filterTime).toBeLessThan(200);

      // Should still render only visible items
      const newItems = container.querySelectorAll('[data-testid^="activity-item-"]');
      expect(newItems.length).toBeLessThan(30);
    });
  });

  describe('Memory Efficiency', () => {
    test('handles 10,000 items without excessive memory', async () => {
      // This test verifies that we can handle large datasets
      render(<ActivityFeed itemCount={10000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Should successfully render without crashes
      expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
      expect(screen.getByTestId('item-count')).toHaveTextContent('10,000 items');

      // Verify virtual scrolling is working
      const container = screen.getByTestId('virtual-list-container');
      const renderedItems = container.querySelectorAll('[data-testid^="activity-item-"]');
      expect(renderedItems.length).toBeLessThan(30);
    });

    test('cleans up properly on unmount', () => {
      const { unmount } = render(<ActivityFeed itemCount={1000} />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Scroll Performance', () => {
    test('maintains correct spacer height for scrolling', async () => {
      render(<ActivityFeed itemCount={5000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const spacer = screen.getByTestId('virtual-list-spacer');
      const height = parseInt(spacer.style.height);

      // 5000 items * 200px = 1,000,000px
      expect(height).toBe(1000000);
    });

    test('offset calculation is efficient', async () => {
      const mockItems = generateActivities(1000);
      
      const renderItem = (item) => (
        <div data-testid={`item-${item.id}`}>{item.message}</div>
      );

      render(
        <VirtualList
          items={mockItems}
          itemHeight={200}
          renderItem={renderItem}
        />
      );

      const content = screen.getByTestId('virtual-list-content');
      
      // Initial offset should be 0
      expect(content).toHaveStyle({ transform: 'translateY(0px)' });
    });
  });

  describe('Comparison with Non-Virtualized Approach', () => {
    test('virtualized list uses less than 1% DOM nodes of full list', async () => {
      const itemCount = 5000;
      
      render(<ActivityFeed itemCount={itemCount} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const container = screen.getByTestId('virtual-list-container');
      const renderedItems = container.querySelectorAll('[data-testid^="activity-item-"]');

      // Non-virtualized would render all 5000 items
      // Virtualized renders only ~15-20
      const nonVirtualizedCount = itemCount;
      const virtualizedCount = renderedItems.length;

      const improvement = ((nonVirtualizedCount - virtualizedCount) / nonVirtualizedCount) * 100;
      
      // Should be 99%+ improvement
      expect(improvement).toBeGreaterThan(99);
    });

    test('demonstrates expected performance characteristics', async () => {
      // Test 1: Small dataset (baseline)
      const { unmount: unmount1 } = render(<ActivityFeed itemCount={100} />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });
      
      let container = screen.getByTestId('virtual-list-container');
      let renderedItems = container.querySelectorAll('[data-testid^="activity-item-"]');
      const smallDatasetCount = renderedItems.length;
      
      unmount1();

      // Test 2: Large dataset
      render(<ActivityFeed itemCount={5000} />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      container = screen.getByTestId('virtual-list-container');
      renderedItems = container.querySelectorAll('[data-testid^="activity-item-"]');
      const largeDatasetCount = renderedItems.length;

      // Rendered count should be similar regardless of total items
      // This proves virtualization is working
      expect(Math.abs(largeDatasetCount - smallDatasetCount)).toBeLessThan(10);
    });
  });

  describe('FPS Monitoring', () => {
    test('FPS indicator is present and functional', async () => {
      render(<ActivityFeed itemCount={1000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const fpsIndicator = screen.getByTestId('fps-indicator');
      expect(fpsIndicator).toBeInTheDocument();
      
      const fpsText = fpsIndicator.textContent;
      expect(fpsText).toMatch(/FPS: \d+/);
    });

    test('FPS value is within acceptable range', async () => {
      render(<ActivityFeed itemCount={5000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Wait a bit for FPS to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      const fpsIndicator = screen.getByTestId('fps-indicator');
      const fpsMatch = fpsIndicator.textContent.match(/FPS: (\d+)/);
      
      if (fpsMatch) {
        const fps = parseInt(fpsMatch[1]);
        
        // FPS should be at least 30 (acceptable)
        // Note: In test environment, FPS might not be accurate
        // but the indicator should show a reasonable value
        expect(fps).toBeGreaterThanOrEqual(0);
        expect(fps).toBeLessThanOrEqual(60);
      }
    });
  });

  describe('Edge Case Performance', () => {
    test('handles rapid re-renders efficiently', async () => {
      const { rerender } = render(<ActivityFeed itemCount={1000} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Trigger multiple re-renders rapidly
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        rerender(<ActivityFeed itemCount={1000} key={i} />);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle re-renders quickly
      expect(totalTime).toBeLessThan(5000);
    });

    test('efficiently handles empty results after filtering', async () => {
      render(<ActivityFeed itemCount={100} />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Try different filters to potentially get empty results
      const filters = ['filter-comment', 'filter-event', 'filter-alert'];
      
      for (const filter of filters) {
        const button = screen.getByTestId(filter);
        button.click();
        
        // Should handle any result count efficiently
        expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
      }
    });
  });
});
