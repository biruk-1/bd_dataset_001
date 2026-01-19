import React, { useMemo } from 'react';
import { formatTimestamp, getTypeIcon } from '../utils/activityUtils';
import './ActivityItem.css';

// Memoized to prevent unnecessary re-renders when parent updates
const ActivityItem = React.memo(({ activity, index }) => {
  const formattedTime = useMemo(
    () => formatTimestamp(activity.timestamp),
    [activity.timestamp]
  );

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
  // Only re-render if activity ID or unread status changes
  // This prevents re-renders when other activities update
  return prevProps.activity.id === nextProps.activity.id &&
         prevProps.activity.isUnread === nextProps.activity.isUnread;
});

ActivityItem.displayName = 'ActivityItem';

export default ActivityItem;
