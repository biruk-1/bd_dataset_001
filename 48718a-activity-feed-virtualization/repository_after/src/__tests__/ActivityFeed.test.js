import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivityFeed from '../components/ActivityFeed';

describe('ActivityFeed Component', () => {
  test('shows loading state initially', () => {
    render(<ActivityFeed itemCount={100} />);
    
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByText(/Generating 100 activities/i)).toBeInTheDocument();
  });

  test('loads and displays activities after loading', async () => {
    render(<ActivityFeed itemCount={100} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
  });

  test('displays correct item count', async () => {
    render(<ActivityFeed itemCount={100} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('100 items');
    });
  });

  test('displays unread count', async () => {
    render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      const unreadBadge = screen.queryByTestId('unread-count');
      if (unreadBadge) {
        expect(unreadBadge).toHaveTextContent(/\d+ unread/);
      }
    });
  });

  test('renders filter buttons', async () => {
    render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    });

    expect(screen.getByTestId('filter-comment')).toBeInTheDocument();
    expect(screen.getByTestId('filter-event')).toBeInTheDocument();
    expect(screen.getByTestId('filter-alert')).toBeInTheDocument();
  });

  test('"All" filter is active by default', async () => {
    render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      const allButton = screen.getByTestId('filter-all');
      expect(allButton).toHaveClass('active');
    });
  });

  test('clicking filter changes active state', async () => {
    render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    });

    const commentButton = screen.getByTestId('filter-comment');
    fireEvent.click(commentButton);

    expect(commentButton).toHaveClass('active');
    expect(screen.getByTestId('filter-all')).not.toHaveClass('active');
  });

  test('filtering updates item count', async () => {
    render(<ActivityFeed itemCount={100} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('100 items');
    });

    const commentButton = screen.getByTestId('filter-comment');
    fireEvent.click(commentButton);

    await waitFor(() => {
      const itemCount = screen.getByTestId('item-count').textContent;
      // Should show fewer items after filtering (not exactly 100)
      expect(itemCount).not.toBe('100 items');
    });
  });

  test('displays FPS indicator', async () => {
    render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('fps-indicator')).toBeInTheDocument();
    });

    const fpsIndicator = screen.getByTestId('fps-indicator');
    expect(fpsIndicator).toHaveTextContent(/FPS: \d+/);
  });

  test('FPS indicator has correct class based on performance', async () => {
    render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      const fpsIndicator = screen.getByTestId('fps-indicator');
      // Should have one of these classes
      expect(
        fpsIndicator.classList.contains('good') ||
        fpsIndicator.classList.contains('warning') ||
        fpsIndicator.classList.contains('critical')
      ).toBe(true);
    });
  });

  test('displays virtual rendering badge', async () => {
    render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Virtual Rendering Enabled/i)).toBeInTheDocument();
    });
  });

  test('renders VirtualList component', async () => {
    render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('virtual-list-container')).toBeInTheDocument();
    });
  });

  test('handles switching between filters', async () => {
    render(<ActivityFeed itemCount={100} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    });

    // Click comment filter
    fireEvent.click(screen.getByTestId('filter-comment'));
    expect(screen.getByTestId('filter-comment')).toHaveClass('active');

    // Click event filter
    fireEvent.click(screen.getByTestId('filter-event'));
    expect(screen.getByTestId('filter-event')).toHaveClass('active');
    expect(screen.getByTestId('filter-comment')).not.toHaveClass('active');

    // Click back to all
    fireEvent.click(screen.getByTestId('filter-all'));
    expect(screen.getByTestId('filter-all')).toHaveClass('active');
  });

  test('handles zero items', async () => {
    render(<ActivityFeed itemCount={0} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('item-count')).toHaveTextContent('0 items');
  });

  test('handles large number of items', async () => {
    render(<ActivityFeed itemCount={5000} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('5,000 items');
    }, { timeout: 3000 });

    // Should still render efficiently with virtual scrolling
    expect(screen.getByTestId('virtual-list-container')).toBeInTheDocument();
  });

  test('maintains filter state when re-rendering', async () => {
    const { rerender } = render(<ActivityFeed itemCount={50} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('filter-comment'));
    expect(screen.getByTestId('filter-comment')).toHaveClass('active');

    // Re-render with same props
    rerender(<ActivityFeed itemCount={50} />);

    // Filter state should be maintained during the component lifecycle
    // Note: Since we're using a key in App, this test checks internal state persistence
    expect(screen.getByTestId('filter-comment')).toHaveClass('active');
  });
});
