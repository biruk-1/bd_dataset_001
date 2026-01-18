import React, { useMemo } from 'react';
import { formatTimestamp, getTypeIcon } from '../utils/activityUtils';
import './ActivityItem.css';

/**
 * ActivityItem Component - Optimized with React.memo
 * 
 * This component represents a single activity in the feed.
 * It's memoized to prevent unnecessary re-renders when parent updates.
 * 
 * Key optimizations:
 * - Wrapped in React.memo with custom comparison
 * - Expensive computations are memoized
 * - Formatted timestamp is cached
 */
const ActivityItem = React.memo(({ activity, index }) => {
  // Memoize the formatted timestamp to avoid recalculating on every render
  const formattedTime = useMemo(
    () => formatTimestamp(activity.timestamp),
    [activity.timestamp]
  );

  // Memoize the type icon
  const typeIcon = useMemo(
    () => getTypeIcon(activity.type),
    [activity.type]
  );

  return (
    <div 
      className={`activity-item ${activity.isUnread ? 'unread' : ''}`}
      data-testid={`activity-item-${activity.id}`}
    >
      <div className="activity-left">
        <div className={`avatar ${activity.type}`}>
          {activity.avatar}
        </div>
      </div>
      
      <div className="activity-content">
        <div className="activity-header">
          <span className="activity-user">{activity.user}</span>
          <span className="activity-type-icon">{typeIcon}</span>
          <span className="activity-timestamp">{formattedTime}</span>
        </div>
        
        <div className="activity-message">
          {activity.message}
        </div>
        
        <div className="activity-details">
          {activity.details}
        </div>
        
        <div className="activity-footer">
          <div className="activity-tags">
            {activity.tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
          
          {activity.hasAttachment && (
            <span className="attachment-badge">📎 Attachment</span>
          )}
        </div>
      </div>
      
      <div className="activity-actions">
        <button className="action-btn" aria-label="View activity">👁️</button>
        <button className="action-btn" aria-label="Star activity">⭐</button>
        <button className="action-btn" aria-label="More options">...</button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if activity ID changed
  // This is safe because activities are immutable in our implementation
  return prevProps.activity.id === nextProps.activity.id &&
         prevProps.activity.isUnread === nextProps.activity.isUnread;
});

ActivityItem.displayName = 'ActivityItem';

export default ActivityItem;
