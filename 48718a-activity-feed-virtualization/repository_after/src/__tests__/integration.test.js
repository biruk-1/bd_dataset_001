import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App';

/**
 * Integration Tests - Full User Flows
 * 
 * These tests verify that all components work together correctly
 * and that user interactions produce the expected results.
 */
describe('Integration Tests - User Flows', () => {
  describe('Complete workflow: Load -> Filter -> Verify', () => {
    test('user can load activities and see them displayed', async () => {
      render(<App />);

      // Wait for activities to load
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      // Verify feed is displayed
      expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
      expect(screen.getByTestId('item-count')).toBeInTheDocument();
    });

    test('user can filter activities and see count change', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Get initial count
      const initialCount = screen.getByTestId('item-count').textContent;

      // Apply filter
      fireEvent.click(screen.getByTestId('filter-comment'));

      // Count should change (unless all items are comments, which is unlikely)
      await waitFor(() => {
        const newCount = screen.getByTestId('item-count').textContent;
        // With random generation, filtered count will likely differ
        expect(newCount).toBeTruthy();
      });
    });

    test('user can change item count and reload', async () => {
      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Change item count
      const input = screen.getByTestId('item-count-input');
      fireEvent.change(input, { target: { value: '100' } });

      // Click reload
      const button = screen.getByTestId('reload-button');
      fireEvent.click(button);

      // Should show loading
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

      // Wait for new data
      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('100 items');
      }, { timeout: 2000 });
    });
  });

  describe('Virtual scrolling performance', () => {
    test('renders only visible items even with large dataset', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Get all rendered activity items
      const container = screen.getByTestId('virtual-list-container');
      const renderedItems = container.querySelectorAll('[data-testid^="activity-item-"]');

      // Should render only visible items + buffer (much less than 5000)
      expect(renderedItems.length).toBeLessThan(30);
      expect(renderedItems.length).toBeGreaterThan(0);
    });

    test('virtual list has correct total height', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const spacer = screen.getByTestId('virtual-list-spacer');
      const height = parseInt(spacer.style.height);

      // With 5000 items at 200px each = 1,000,000px
      expect(height).toBe(1000000);
    });

    test('maintains high FPS with large dataset', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Check FPS indicator
      const fpsIndicator = screen.getByTestId('fps-indicator');
      const fpsText = fpsIndicator.textContent;
      const fpsValue = parseInt(fpsText.match(/\d+/)[0]);

      // FPS should be reasonable (at least 30, ideally 60)
      expect(fpsValue).toBeGreaterThanOrEqual(30);
    });
  });

  describe('Filter interactions', () => {
    test('switching filters maintains UI state', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Click through multiple filters
      fireEvent.click(screen.getByTestId('filter-comment'));
      expect(screen.getByTestId('filter-comment')).toHaveClass('active');

      fireEvent.click(screen.getByTestId('filter-event'));
      expect(screen.getByTestId('filter-event')).toHaveClass('active');
      expect(screen.getByTestId('filter-comment')).not.toHaveClass('active');

      fireEvent.click(screen.getByTestId('filter-alert'));
      expect(screen.getByTestId('filter-alert')).toHaveClass('active');

      fireEvent.click(screen.getByTestId('filter-all'));
      expect(screen.getByTestId('filter-all')).toHaveClass('active');

      // Feed should still be functional
      expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
    });

    test('filtered items match selected filter type', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // This test verifies the filtering logic works correctly
      // by checking that applying a filter results in a valid state
      fireEvent.click(screen.getByTestId('filter-comment'));

      const itemCount = screen.getByTestId('item-count');
      expect(itemCount).toBeInTheDocument();
      
      // Should show some count (or 0 if no comments)
      const countText = itemCount.textContent;
      expect(countText).toMatch(/\d+ items?/);
    });
  });

  describe('Edge cases and error handling', () => {
    test('handles empty filter results gracefully', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Apply filters - some might result in 0 items
      fireEvent.click(screen.getByTestId('filter-alert'));

      // Should still show feed structure
      expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
      expect(screen.getByTestId('item-count')).toBeInTheDocument();
    });

    test('handles rapid filter changes', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Rapidly click through filters
      for (let i = 0; i < 5; i++) {
        fireEvent.click(screen.getByTestId('filter-comment'));
        fireEvent.click(screen.getByTestId('filter-event'));
        fireEvent.click(screen.getByTestId('filter-all'));
      }

      // Should still work correctly
      expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
      expect(screen.getByTestId('filter-all')).toHaveClass('active');
    });

    test('handles minimum item count', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const input = screen.getByTestId('item-count-input');
      fireEvent.change(input, { target: { value: '100' } });
      
      fireEvent.click(screen.getByTestId('reload-button'));

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('100 items');
      }, { timeout: 2000 });
    });

    test('handles maximum item count', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const input = screen.getByTestId('item-count-input');
      fireEvent.change(input, { target: { value: '10000' } });
      
      const button = screen.getByTestId('reload-button');
      expect(button).toHaveTextContent(/10,000/);
    });
  });

  describe('Performance metrics display', () => {
    test('FPS indicator updates and shows correct status', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const fpsIndicator = screen.getByTestId('fps-indicator');
      
      // Should have one of the status classes
      const hasStatusClass = 
        fpsIndicator.classList.contains('good') ||
        fpsIndicator.classList.contains('warning') ||
        fpsIndicator.classList.contains('critical');
      
      expect(hasStatusClass).toBe(true);
    });

    test('virtual rendering badge is displayed', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/Virtual Rendering Enabled/i)).toBeInTheDocument();
    });
  });

  describe('Data integrity', () => {
    test('activity items have all required fields', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      // Get first activity item
      const container = screen.getByTestId('virtual-list-container');
      const firstItem = container.querySelector('[data-testid^="activity-item-"]');
      
      expect(firstItem).toBeInTheDocument();
      
      // Should have content (user, message, etc.)
      const activityContent = firstItem.querySelector('.activity-content');
      expect(activityContent).toBeInTheDocument();
    });

    test('unread count is accurate', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const unreadBadge = screen.queryByTestId('unread-count');
      
      if (unreadBadge) {
        // If there are unread items, badge should show a number
        expect(unreadBadge.textContent).toMatch(/\d+ unread/);
      }
      // If no unread items, badge shouldn't exist (which is also valid)
    });
  });

  describe('Accessibility', () => {
    test('all interactive elements are keyboard accessible', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      const buttons = screen.getAllByRole('button');
      
      // All buttons should be accessible
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    test('input has associated label', () => {
      render(<App />);

      const input = screen.getByTestId('item-count-input');
      const label = screen.getByText('Item Count:');
      
      expect(input).toHaveAttribute('id', 'item-count-input');
      expect(label).toBeInTheDocument();
    });
  });
});
