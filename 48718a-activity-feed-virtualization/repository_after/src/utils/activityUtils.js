/**
 * Generates mock activity data for testing and demonstration
 * 
 * @param {number} count - Number of activities to generate
 * @returns {Array} Array of activity objects
 */
export const generateActivities = (count) => {
  const types = ['comment', 'log', 'event', 'mention', 'update', 'alert'];
  const users = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];
  const actions = [
    'commented on issue #',
    'updated pull request #',
    'mentioned you in',
    'deployed to production',
    'created a new branch',
    'merged pull request #',
    'opened issue #',
    'closed issue #',
    'assigned you to',
    'reviewed code in'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const itemNumber = Math.floor(Math.random() * 9999) + 1;
    
    return {
      id: i + 1,
      type,
      user,
      message: `${user} ${action}${itemNumber}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      details: `This is additional detail text for activity ${i + 1}. It contains information about the specific action taken, including contextual metadata, file changes, and other relevant information that might be useful to the user.`,
      avatar: user.substring(0, 2).toUpperCase(),
      hasAttachment: Math.random() > 0.7,
      isUnread: Math.random() > 0.5,
      tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        ['bug', 'feature', 'urgent', 'review', 'backend', 'frontend'][Math.floor(Math.random() * 6)]
      )
    };
  });
};

/**
 * Formats a timestamp into a human-readable relative time
 * 
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted relative time (e.g., "2h ago")
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

/**
 * Gets an emoji icon for an activity type
 * 
 * @param {string} type - Activity type
 * @returns {string} Emoji icon
 */
export const getTypeIcon = (type) => {
  const icons = {
    comment: '💬',
    log: '📋',
    event: '📅',
    mention: '@',
    update: '🔄',
    alert: '🔔'
  };
  return icons[type] || '📌';
};
