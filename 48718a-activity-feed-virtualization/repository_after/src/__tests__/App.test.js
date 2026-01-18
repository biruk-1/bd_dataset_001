import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders application', () => {
    render(<App />);
    
    expect(screen.getByText(/Activity Feed - Virtual Scrolling Optimization/i)).toBeInTheDocument();
  });

  test('displays optimization banner', () => {
    render(<App />);
    
    expect(screen.getByText(/virtual scrolling/i)).toBeInTheDocument();
    expect(screen.getByText(/smooth performance with 10,000\+ activities/i)).toBeInTheDocument();
  });

  test('renders item count input with default value', () => {
    render(<App />);
    
    const input = screen.getByTestId('item-count-input');
    expect(input).toHaveValue(5000);
  });

  test('renders reload button', () => {
    render(<App />);
    
    const button = screen.getByTestId('reload-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/Load 5,000 items/i);
  });

  test('displays performance badges', () => {
    render(<App />);
    
    expect(screen.getByText(/Only ~15-20 DOM nodes rendered/i)).toBeInTheDocument();
    expect(screen.getByText(/60 FPS maintained/i)).toBeInTheDocument();
  });

  test('updates input value when typing', () => {
    render(<App />);
    
    const input = screen.getByTestId('item-count-input');
    
    fireEvent.change(input, { target: { value: '1000' } });
    
    expect(input).toHaveValue(1000);
  });

  test('updates button text when input changes', () => {
    render(<App />);
    
    const input = screen.getByTestId('item-count-input');
    const button = screen.getByTestId('reload-button');
    
    fireEvent.change(input, { target: { value: '2000' } });
    
    expect(button).toHaveTextContent(/Load 2,000 items/i);
  });

  test('reloads activity feed when button clicked', () => {
    render(<App />);
    
    const input = screen.getByTestId('item-count-input');
    const button = screen.getByTestId('reload-button');
    
    // Change to different count
    fireEvent.change(input, { target: { value: '1000' } });
    
    // Click reload
    fireEvent.click(button);
    
    // Should show loading state
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('renders ActivityFeed component', () => {
    render(<App />);
    
    // Should see loading first, then feed
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('input respects min and max constraints', () => {
    render(<App />);
    
    const input = screen.getByTestId('item-count-input');
    
    expect(input).toHaveAttribute('min', '100');
    expect(input).toHaveAttribute('max', '10000');
    expect(input).toHaveAttribute('step', '500');
  });

  test('handles invalid input gracefully', () => {
    render(<App />);
    
    const input = screen.getByTestId('item-count-input');
    
    // Try to input non-number
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Input should handle this (browser will prevent non-numeric input in type="number")
    expect(input).toBeInTheDocument();
  });

  test('displays both badge types with correct styling', () => {
    render(<App />);
    
    const badges = screen.getAllByText(/DOM nodes|FPS/i);
    expect(badges.length).toBeGreaterThanOrEqual(2);
  });

  test('feed wrapper has correct styling structure', () => {
    const { container } = render(<App />);
    
    const feedWrapper = container.querySelector('.feed-wrapper');
    expect(feedWrapper).toBeInTheDocument();
  });

  test('controls section is properly structured', () => {
    const { container } = render(<App />);
    
    const controls = container.querySelector('.controls');
    expect(controls).toBeInTheDocument();
    expect(controls).toHaveClass('controls');
  });

  test('banner section is properly structured', () => {
    const { container } = render(<App />);
    
    const banner = container.querySelector('.banner');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass('banner');
  });

  test('maintains input value on re-render', () => {
    const { rerender } = render(<App />);
    
    const input = screen.getByTestId('item-count-input');
    fireEvent.change(input, { target: { value: '3000' } });
    
    expect(input).toHaveValue(3000);
    
    rerender(<App />);
    
    expect(input).toHaveValue(3000);
  });

  test('label is associated with input', () => {
    render(<App />);
    
    const label = screen.getByText('Item Count:');
    const input = screen.getByTestId('item-count-input');
    
    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'item-count-input');
  });

  test('handles multiple reload clicks', () => {
    render(<App />);
    
    const button = screen.getByTestId('reload-button');
    
    // Click multiple times
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    // Should still work
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  test('updates correctly when changing to edge values', () => {
    render(<App />);
    
    const input = screen.getByTestId('item-count-input');
    
    // Test minimum
    fireEvent.change(input, { target: { value: '100' } });
    expect(input).toHaveValue(100);
    
    // Test maximum
    fireEvent.change(input, { target: { value: '10000' } });
    expect(input).toHaveValue(10000);
  });
});
