import { generateActivities, formatTimestamp, getTypeIcon } from '../utils/activityUtils';

describe('Activity Utils', () => {
  describe('generateActivities', () => {
    test('generates correct number of activities', () => {
      const count = 50;
      const activities = generateActivities(count);
      
      expect(activities).toHaveLength(count);
    });

    test('each activity has required properties', () => {
      const activities = generateActivities(10);
      
      activities.forEach(activity => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('user');
        expect(activity).toHaveProperty('message');
        expect(activity).toHaveProperty('timestamp');
        expect(activity).toHaveProperty('details');
        expect(activity).toHaveProperty('avatar');
        expect(activity).toHaveProperty('hasAttachment');
        expect(activity).toHaveProperty('isUnread');
        expect(activity).toHaveProperty('tags');
      });
    });

    test('generates sequential IDs starting from 1', () => {
      const activities = generateActivities(5);
      
      expect(activities[0].id).toBe(1);
      expect(activities[1].id).toBe(2);
      expect(activities[4].id).toBe(5);
    });

    test('activity types are valid', () => {
      const activities = generateActivities(100);
      const validTypes = ['comment', 'log', 'event', 'mention', 'update', 'alert'];
      
      activities.forEach(activity => {
        expect(validTypes).toContain(activity.type);
      });
    });

    test('timestamps are valid ISO strings', () => {
      const activities = generateActivities(10);
      
      activities.forEach(activity => {
        const date = new Date(activity.timestamp);
        expect(date).toBeInstanceOf(Date);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });

    test('timestamps are in the past week', () => {
      const activities = generateActivities(10);
      const now = Date.now();
      const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      activities.forEach(activity => {
        const timestamp = new Date(activity.timestamp).getTime();
        expect(timestamp).toBeLessThanOrEqual(now);
        expect(timestamp).toBeGreaterThanOrEqual(weekAgo - 1000); // Small buffer for test execution
      });
    });

    test('generates activities with tags', () => {
      const activities = generateActivities(20);
      
      activities.forEach(activity => {
        expect(Array.isArray(activity.tags)).toBe(true);
        expect(activity.tags.length).toBeGreaterThanOrEqual(1);
        expect(activity.tags.length).toBeLessThanOrEqual(3);
      });
    });

    test('hasAttachment is boolean', () => {
      const activities = generateActivities(10);
      
      activities.forEach(activity => {
        expect(typeof activity.hasAttachment).toBe('boolean');
      });
    });

    test('isUnread is boolean', () => {
      const activities = generateActivities(10);
      
      activities.forEach(activity => {
        expect(typeof activity.isUnread).toBe('boolean');
      });
    });

    test('handles edge case of 0 activities', () => {
      const activities = generateActivities(0);
      expect(activities).toHaveLength(0);
    });

    test('handles large number of activities', () => {
      const activities = generateActivities(10000);
      expect(activities).toHaveLength(10000);
      expect(activities[9999].id).toBe(10000);
    });
  });

  describe('formatTimestamp', () => {
    test('formats just now correctly', () => {
      const now = new Date().toISOString();
      const result = formatTimestamp(now);
      expect(result).toBe('just now');
    });

    test('formats minutes ago correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = formatTimestamp(fiveMinutesAgo);
      expect(result).toBe('5m ago');
    });

    test('formats hours ago correctly', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      const result = formatTimestamp(threeHoursAgo);
      expect(result).toBe('3h ago');
    });

    test('formats days ago correctly', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const result = formatTimestamp(twoDaysAgo);
      expect(result).toBe('2d ago');
    });

    test('formats 59 minutes as minutes, not hours', () => {
      const time = new Date(Date.now() - 59 * 60 * 1000).toISOString();
      const result = formatTimestamp(time);
      expect(result).toBe('59m ago');
    });

    test('formats 23 hours as hours, not days', () => {
      const time = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
      const result = formatTimestamp(time);
      expect(result).toBe('23h ago');
    });
  });

  describe('getTypeIcon', () => {
    test('returns correct icon for comment', () => {
      expect(getTypeIcon('comment')).toBe('💬');
    });

    test('returns correct icon for log', () => {
      expect(getTypeIcon('log')).toBe('📋');
    });

    test('returns correct icon for event', () => {
      expect(getTypeIcon('event')).toBe('📅');
    });

    test('returns correct icon for mention', () => {
      expect(getTypeIcon('mention')).toBe('@');
    });

    test('returns correct icon for update', () => {
      expect(getTypeIcon('update')).toBe('🔄');
    });

    test('returns correct icon for alert', () => {
      expect(getTypeIcon('alert')).toBe('🔔');
    });

    test('returns default icon for unknown type', () => {
      expect(getTypeIcon('unknown')).toBe('📌');
    });

    test('returns default icon for empty string', () => {
      expect(getTypeIcon('')).toBe('📌');
    });
  });
});
