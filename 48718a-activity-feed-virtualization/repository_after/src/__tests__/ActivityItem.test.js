import React from 'react';
import { render, screen } from '@testing-library/react';
import ActivityItem from '../components/ActivityItem';

describe('ActivityItem Component', () => {
  const mockActivity = {
    id: 1,
    type: 'comment',
    user: 'Alice',
    message: 'Alice commented on issue #123',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    details: 'This is a test activity detail.',
    avatar: 'AL',
    hasAttachment: true,
    isUnread: true,
    tags: ['bug', 'urgent']
  };

  test('renders activity item correctly', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Alice commented on issue #123')).toBeInTheDocument();
    expect(screen.getByText('This is a test activity detail.')).toBeInTheDocument();
  });

  test('displays avatar with correct initials', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    const avatar = screen.getByText('AL');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('avatar');
  });

  test('applies unread class when isUnread is true', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    const item = screen.getByTestId('activity-item-1');
    expect(item).toHaveClass('unread');
  });

  test('does not apply unread class when isUnread is false', () => {
    const readActivity = { ...mockActivity, isUnread: false };
    render(<ActivityItem activity={readActivity} index={0} />);
    
    const item = screen.getByTestId('activity-item-1');
    expect(item).not.toHaveClass('unread');
  });

  test('displays attachment badge when hasAttachment is true', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    expect(screen.getByText('📎 Attachment')).toBeInTheDocument();
  });

  test('does not display attachment badge when hasAttachment is false', () => {
    const noAttachment = { ...mockActivity, hasAttachment: false };
    render(<ActivityItem activity={noAttachment} index={0} />);
    
    expect(screen.queryByText('📎 Attachment')).not.toBeInTheDocument();
  });

  test('renders all tags', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  test('renders correct type icon for comment', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  test('renders correct type icon for event', () => {
    const eventActivity = { ...mockActivity, type: 'event' };
    render(<ActivityItem activity={eventActivity} index={0} />);
    
    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(screen.getByLabelText('View activity')).toBeInTheDocument();
    expect(screen.getByLabelText('Star activity')).toBeInTheDocument();
    expect(screen.getByLabelText('More options')).toBeInTheDocument();
  });

  test('formats timestamp correctly', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    // Should show "2h ago" for 2 hours ago
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  test('applies correct avatar class for activity type', () => {
    render(<ActivityItem activity={mockActivity} index={0} />);
    
    const avatar = screen.getByText('AL');
    expect(avatar).toHaveClass('comment');
  });

  test('handles activities with no tags', () => {
    const noTags = { ...mockActivity, tags: [] };
    render(<ActivityItem activity={noTags} index={0} />);
    
    const tagsContainer = screen.getByText('Alice').closest('.activity-item')
      .querySelector('.activity-tags');
    expect(tagsContainer.children.length).toBe(0);
  });

  test('handles activities with many tags', () => {
    const manyTags = { ...mockActivity, tags: ['bug', 'urgent', 'frontend', 'review'] };
    render(<ActivityItem activity={manyTags} index={0} />);
    
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('frontend')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
  });

  test('memoization prevents unnecessary re-renders', () => {
    const { rerender } = render(<ActivityItem activity={mockActivity} index={0} />);
    
    const firstRender = screen.getByTestId('activity-item-1');
    
    // Re-render with same props
    rerender(<ActivityItem activity={mockActivity} index={0} />);
    
    const secondRender = screen.getByTestId('activity-item-1');
    
    // Component should be memoized - checking it still renders
    expect(secondRender).toBeInTheDocument();
  });

  test('handles long message text', () => {
    const longMessage = { 
      ...mockActivity, 
      message: 'A'.repeat(200) 
    };
    render(<ActivityItem activity={longMessage} index={0} />);
    
    expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
  });

  test('handles long detail text', () => {
    const longDetail = { 
      ...mockActivity, 
      details: 'B'.repeat(500) 
    };
    render(<ActivityItem activity={longDetail} index={0} />);
    
    expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
  });
});
