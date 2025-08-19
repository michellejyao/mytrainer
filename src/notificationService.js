import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

// Use the existing Firebase app instance
const messaging = getMessaging(app);

class NotificationService {
  constructor() {
    this.notificationSettings = {
      smsEnabled: false,
      pushEnabled: false,
      phoneNumber: null,
      notificationTimes: {
        morning: '08:00',
        afternoon: '12:00',
        evening: '18:00'
      }
    };
    this.schedule = null;
    this.userData = null;
  }

  // Initialize notification service
  async initialize(userData, schedule) {
    this.userData = userData;
    this.schedule = schedule;
    
    // Load notification settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      this.notificationSettings = { ...this.notificationSettings, ...JSON.parse(savedSettings) };
    }

    // Request notification permissions
    await this.requestNotificationPermission();
    
    // Set up notification schedules
    this.setupNotificationSchedules();
    
    return this.notificationSettings;
  }

  // Request permission for push notifications
  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.notificationSettings.pushEnabled = true;
        await this.getFCMToken();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  // Get FCM token for push notifications
  async getFCMToken() {
    try {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
      });
      
      if (token) {
        localStorage.setItem('fcmToken', token);
        // Send token to your backend
        await this.sendTokenToServer(token);
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  }

  // Send FCM token to backend
  async sendTokenToServer(token) {
    try {
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId: this.userData?.id || 'anonymous',
          userData: this.userData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to register token');
      }
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // Set up notification schedules
  setupNotificationSchedules() {
    if (!this.schedule || !this.userData) return;

    // Clear existing schedules
    this.clearNotificationSchedules();

    // Set up daily notification schedules
    this.setupDailyNotifications();
    
    // Set up activity-specific notifications
    this.setupActivityNotifications();
  }

  // Set up daily reminder notifications
  setupDailyNotifications() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const dayActivities = this.schedule.schedule[day]?.activities || [];
      if (dayActivities.length > 0) {
        // Morning motivation notification
        this.scheduleNotification({
          type: 'morning_motivation',
          day: day,
          time: '07:30',
          message: `Good morning! Ready to crush your goals today? You have ${dayActivities.length} activities planned. Let's make today count! 💪`,
          activity: null
        });

        // Evening reflection notification
        this.scheduleNotification({
          type: 'evening_reflection',
          day: day,
          time: '21:00',
          message: `Great work today! Take a moment to reflect on your progress. What went well? What can you improve tomorrow? 📝`,
          activity: null
        });
      }
    });
  }

  // Set up activity-specific notifications
  setupActivityNotifications() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const dayActivities = this.schedule.schedule[day]?.activities || [];
      
      dayActivities.forEach((activity, index) => {
        if (activity.time && activity.activity) {
          // Parse activity time
          const [startTime] = activity.time.split('-');
          const [hours, minutes] = startTime.split(':');
          
          // Schedule notification 5 minutes before activity
          const notificationTime = new Date();
          notificationTime.setHours(parseInt(hours), parseInt(minutes) - 5, 0, 0);
          
          // Only schedule if time is in the future
          if (notificationTime > new Date()) {
            this.scheduleNotification({
              type: 'activity_reminder',
              day: day,
              time: `${hours}:${minutes.padStart(2, '0')}`,
              message: `⏰ Time for: ${activity.activity}\n\n${activity.description || ''}\n\n💡 Tip: ${activity.tips || 'Stay focused and give it your best!'}`,
              activity: activity
            });
          }
        }
      });
    });
  }

  // Schedule a notification
  scheduleNotification({ type, day, time, message, activity }) {
    const [hours, minutes] = time.split(':');
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Adjust for day of week
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
    const currentDayIndex = now.getDay();
    const daysUntilTarget = (dayIndex - currentDayIndex + 7) % 7;
    
    scheduledTime.setDate(scheduledTime.getDate() + daysUntilTarget);
    
    // If time has passed today, schedule for next week
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 7);
    }
    
    const timeUntilNotification = scheduledTime.getTime() - now.getTime();
    
    // Schedule the notification
    setTimeout(() => {
      this.sendNotification(message, activity);
      
      // Recurring weekly notification
      setInterval(() => {
        this.sendNotification(message, activity);
      }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    }, timeUntilNotification);
  }

  // Send notification (SMS and/or Push)
  async sendNotification(message, activity = null) {
    const notifications = [];
    
    // Send SMS if enabled
    if (this.notificationSettings.smsEnabled && this.notificationSettings.phoneNumber) {
      notifications.push(this.sendSMS(message));
    }
    
    // Send push notification if enabled
    if (this.notificationSettings.pushEnabled) {
      notifications.push(this.sendPushNotification(message, activity));
    }
    
    // Send browser notification as fallback
    if (Notification.permission === 'granted') {
      notifications.push(this.sendBrowserNotification(message, activity));
    }
    
    try {
      await Promise.all(notifications);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  // Send SMS via Twilio
  async sendSMS(message) {
    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.notificationSettings.phoneNumber,
          message: message,
          userId: this.userData?.id || 'anonymous'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }
      
      console.log('SMS notification sent successfully');
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }

  // Send push notification via Firebase
  async sendPushNotification(message, activity) {
    try {
      const token = localStorage.getItem('fcmToken');
      if (!token) return;
      
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          message: message,
          activity: activity,
          userId: this.userData?.id || 'anonymous'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send push notification');
      }
      
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Send browser notification
  sendBrowserNotification(message, activity = null) {
    if (Notification.permission === 'granted') {
      const notification = new Notification('MyTrainer Reminder', {
        body: message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: activity ? `activity-${activity.activity}` : 'general',
        requireInteraction: false,
        silent: false
      });
      
      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }

  // Update notification settings
  updateSettings(newSettings) {
    this.notificationSettings = { ...this.notificationSettings, ...newSettings };
    localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    
    // Re-setup notifications with new settings
    this.setupNotificationSchedules();
  }

  // Clear all notification schedules
  clearNotificationSchedules() {
    // This would typically clear any scheduled notifications
    // For now, we'll rely on the browser's setTimeout management
    console.log('Notification schedules cleared');
  }

  // Get current notification settings
  getSettings() {
    return this.notificationSettings;
  }

  // Test notification
  async testNotification() {
    const testMessage = `🧪 Test notification from MyTrainer!\n\nThis is a test to ensure your notifications are working properly. If you received this, your notification system is set up correctly!`;
    
    await this.sendNotification(testMessage);
  }

  // Generate motivational messages based on user's goals
  generateMotivationalMessage(activity = null) {
    const messages = [
      "Remember why you started! Every step forward is progress toward your goals. 💪",
      "You've got this! Consistency beats perfection every time. 🔥",
      "Your future self will thank you for the work you're doing today. 🌟",
      "Small progress is still progress. Keep pushing forward! ⚡",
      "You're building habits that will last a lifetime. Stay strong! 💎"
    ];
    
    if (activity) {
      return `⏰ Time for: ${activity.activity}\n\n${activity.description || ''}\n\n${messages[Math.floor(Math.random() * messages.length)]}`;
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 