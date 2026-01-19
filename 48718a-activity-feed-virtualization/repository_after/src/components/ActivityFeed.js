import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import VirtualList from './VirtualList';
import ActivityItem from './ActivityItem';
import { generateActivities } from '../utils/activityUtils';
import './ActivityFeed.css';

const ActivityFeed = ({ itemCount = 5000 }) => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [fps, setFps] = useState(60);
  const fpsRef = useRef({ frames: 0, lastTime: performance.now() });

  useEffect(() => {
    const timer = setTimeout(() => {
      const data = generateActivities(itemCount);
      setActivities(data);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [itemCount]);

  useEffect(() => {
    let animationId;
    
    const measureFPS = () => {
      fpsRef.current.frames++;
      const now = performance.now();
      const elapsed = now - fpsRef.current.lastTime;
      
      if (elapsed >= 1000) {
        const currentFps = Math.round((fpsRef.current.frames * 1000) / elapsed);
        setFps(currentFps);
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Memoize filtered list to avoid recalculating on every render
  const filteredActivities = useMemo(() => {
    if (filter === 'all') {
      return activities;
    }
    return activities.filter(activity => activity.type === filter);
  }, [activities, filter]);

  const unreadCount = useMemo(() => {
    return activities.filter(a => a.isUnread).length;
  }, [activities]);

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const renderActivity = useCallback((activity, index) => {
    return <ActivityItem activity={activity} index={index} />;
  }, []);

  if (loading) {
    return (
      <div className="loading" data-testid="loading-indicator">
        Generating {itemCount.toLocaleString()} activities...
      </div>
    );
  }

  return (
    <div className="activity-feed-container" data-testid="activity-feed">
      <div className="feed-header">
        <div className="header-left">
          <h2>Activity Feed</h2>
          <span className="item-count" data-testid="item-count">
            {filteredActivities.length.toLocaleString()} items
          </span>
          {unreadCount > 0 && (
            <span className="unread-count" data-testid="unread-count">
              {unreadCount} unread
            </span>
          )}
        </div>
        
        <div className="filter-controls">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => handleFilterChange('all')}
            data-testid="filter-all"
          >
            All
          </button>
          <button 
            className={filter === 'comment' ? 'active' : ''} 
            onClick={() => handleFilterChange('comment')}
            data-testid="filter-comment"
          >
            💬 Comments
          </button>
          <button 
            className={filter === 'event' ? 'active' : ''} 
            onClick={() => handleFilterChange('event')}
            data-testid="filter-event"
          >
            📅 Events
          </button>
          <button 
            className={filter === 'alert' ? 'active' : ''} 
            onClick={() => handleFilterChange('alert')}
            data-testid="filter-alert"
          >
            🔔 Alerts
          </button>
        </div>
      </div>

      <div className="performance-metrics">
        <div 
          className={`fps-indicator ${fps < 30 ? 'critical' : fps < 50 ? 'warning' : 'good'}`}
          data-testid="fps-indicator"
        >
          FPS: {fps}
        </div>
        <div className="rendered-count" data-testid="rendered-count">
          Virtual Rendering Enabled ✓
        </div>
      </div>

      {/* VirtualList only renders visible items instead of all items */}
      <VirtualList
        items={filteredActivities}
        itemHeight={200}
        renderItem={renderActivity}
        className="activity-list"
      />
    </div>
  );
};

export default ActivityFeed;
