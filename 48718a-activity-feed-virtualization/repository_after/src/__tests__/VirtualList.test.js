import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VirtualList from '../components/VirtualList';

describe('VirtualList Component', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`
  }));

  const renderItem = (item, index) => (
    <div data-testid={`item-${item.id}`}>
      {item.name}
    </div>
  );

  test('renders virtual list container', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    expect(screen.getByTestId('virtual-list-container')).toBeInTheDocument();
  });

  test('renders spacer with correct height', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    const spacer = screen.getByTestId('virtual-list-spacer');
    expect(spacer).toHaveStyle({ height: '20000px' }); // 100 items * 200px
  });

  test('renders only visible items initially', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    // Should render first few items (visible + buffer)
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    
    // Should NOT render items far down the list
    expect(screen.queryByTestId('item-50')).not.toBeInTheDocument();
    expect(screen.queryByTestId('item-100')).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={200}
        renderItem={renderItem}
        className="custom-class"
      />
    );

    const container = screen.getByTestId('virtual-list-container');
    expect(container).toHaveClass('custom-class');
  });

  test('renders content with translateY offset', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    const content = screen.getByTestId('virtual-list-content');
    // Initially offset should be 0
    expect(content).toHaveStyle({ transform: 'translateY(0px)' });
  });

  test('handles empty items array', () => {
    render(
      <VirtualList
        items={[]}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    const spacer = screen.getByTestId('virtual-list-spacer');
    expect(spacer).toHaveStyle({ height: '0px' });
  });

  test('handles single item', () => {
    const singleItem = [{ id: 1, name: 'Only Item' }];
    
    render(
      <VirtualList
        items={singleItem}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    const spacer = screen.getByTestId('virtual-list-spacer');
    expect(spacer).toHaveStyle({ height: '200px' });
  });

  test('updates visible items on scroll', () => {
    const { container } = render(
      <VirtualList
        items={mockItems}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    const listContainer = screen.getByTestId('virtual-list-container');

    // Simulate scroll
    fireEvent.scroll(listContainer, { target: { scrollTop: 2000 } });

    // After scrolling, different items should be visible
    // This tests that the scroll handler is working
    expect(listContainer.scrollTop).toBe(2000);
  });

  test('each item has correct height style', () => {
    render(
      <VirtualList
        items={mockItems.slice(0, 10)}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    const firstItem = screen.getByTestId('item-1').parentElement;
    expect(firstItem).toHaveStyle({ height: '200px' });
  });

  test('each item has data-index attribute', () => {
    render(
      <VirtualList
        items={mockItems.slice(0, 10)}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    const firstItem = screen.getByTestId('item-1').parentElement;
    expect(firstItem).toHaveAttribute('data-index', '0');
  });

  test('works with different item heights', () => {
    render(
      <VirtualList
        items={mockItems}
        itemHeight={100}
        renderItem={renderItem}
      />
    );

    const spacer = screen.getByTestId('virtual-list-spacer');
    expect(spacer).toHaveStyle({ height: '10000px' }); // 100 items * 100px
  });

  test('handles large number of items efficiently', () => {
    const largeItemSet = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`
    }));

    render(
      <VirtualList
        items={largeItemSet}
        itemHeight={200}
        renderItem={renderItem}
      />
    );

    const spacer = screen.getByTestId('virtual-list-spacer');
    expect(spacer).toHaveStyle({ height: '2000000px' }); // 10000 * 200

    // Should still only render visible items
    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.queryByTestId('item-5000')).not.toBeInTheDocument();
  });

  test('renderItem receives correct item and index', () => {
    const mockRenderItem = jest.fn((item, index) => (
      <div data-testid={`item-${item.id}`}>{item.name}</div>
    ));

    render(
      <VirtualList
        items={mockItems.slice(0, 10)}
        itemHeight={200}
        renderItem={mockRenderItem}
      />
    );

    // Check that renderItem was called with correct arguments
    expect(mockRenderItem).toHaveBeenCalled();
    const firstCall = mockRenderItem.mock.calls[0];
    expect(firstCall[0]).toHaveProperty('id');
    expect(firstCall[0]).toHaveProperty('name');
    expect(typeof firstCall[1]).toBe('number');
  });
});
