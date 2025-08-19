const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const admin = require('firebase-admin');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Store user tokens and schedules (in production, use a database)
const userTokens = new Map();
const userSchedules = new Map();

// Register FCM token
app.post('/api/notifications/register', (req, res) => {
  try {
    const { token, userId, userData } = req.body;
    
    if (!token || !userId) {
      return res.status(400).json({ error: 'Token and userId are required' });
    }
    
    userTokens.set(userId, token);
    if (userData) {
      userSchedules.set(userId, userData);
    }
    
    console.log(`Registered token for user: ${userId}`);
    res.json({ success: true, message: 'Token registered successfully' });
  } catch (error) {
    console.error('Error registering token:', error);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// Send SMS notification
app.post('/api/notifications/sms', async (req, res) => {
  try {
    const { to, message, userId } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }
    
    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log(`SMS sent to ${to}: ${twilioMessage.sid}`);
    res.json({ success: true, messageId: twilioMessage.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Send push notification
app.post('/api/notifications/push', async (req, res) => {
  try {
    const { token, message, activity, userId } = req.body;
    
    if (!token || !message) {
      return res.status(400).json({ error: 'Token and message are required' });
    }
    
    const notification = {
      notification: {
        title: 'MyTrainer Reminder',
        body: message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        clickAction: 'https://your-app-domain.com'
      },
      data: {
        activity: activity ? JSON.stringify(activity) : '',
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString()
      },
      token: token
    };
    
    const response = await admin.messaging().send(notification);
    
    console.log(`Push notification sent: ${response}`);
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ error: 'Failed to send push notification' });
  }
});

// Send notification to all users
app.post('/api/notifications/broadcast', async (req, res) => {
  try {
    const { message, title = 'MyTrainer Update' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const tokens = Array.from(userTokens.values());
    if (tokens.length === 0) {
      return res.json({ success: true, message: 'No users to notify' });
    }
    
    const notification = {
      notification: {
        title: title,
        body: message,
        icon: '/logo192.png',
        badge: '/logo192.png'
      },
      data: {
        type: 'broadcast',
        timestamp: new Date().toISOString()
      },
      tokens: tokens
    };
    
    const response = await admin.messaging().sendMulticast(notification);
    
    console.log(`Broadcast sent to ${response.successCount}/${tokens.length} users`);
    res.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

// Schedule-based notification system
class NotificationScheduler {
  constructor() {
    this.schedules = new Map();
  }
  
  // Schedule notifications for a user
  scheduleUserNotifications(userId, userData, schedule) {
    if (!schedule || !userData) return;
    
    // Clear existing schedules for this user
    this.clearUserSchedules(userId);
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const dayActivities = schedule.schedule[day]?.activities || [];
      
      dayActivities.forEach((activity, index) => {
        if (activity.time && activity.activity) {
          this.scheduleActivityNotification(userId, day, activity, userData);
        }
      });
      
      // Schedule daily motivation notifications
      if (dayActivities.length > 0) {
        this.scheduleDailyNotifications(userId, day, dayActivities.length, userData);
      }
    });
  }
  
  // Schedule activity-specific notification
  scheduleActivityNotification(userId, day, activity, userData) {
    const [startTime] = activity.time.split('-');
    const [hours, minutes] = startTime.split(':');
    
    // Schedule notification 5 minutes before activity
    const cronExpression = `${minutes - 5} ${hours} * * ${this.getDayNumber(day)}`;
    
    const job = cron.schedule(cronExpression, async () => {
      await this.sendActivityReminder(userId, activity, userData);
    }, {
      scheduled: false,
      timezone: "America/New_York" // Adjust to user's timezone
    });
    
    job.start();
    
    // Store job reference for cleanup
    if (!this.schedules.has(userId)) {
      this.schedules.set(userId, []);
    }
    this.schedules.get(userId).push(job);
  }
  
  // Schedule daily motivation notifications
  scheduleDailyNotifications(userId, day, activityCount, userData) {
    // Morning motivation (7:30 AM)
    const morningJob = cron.schedule('30 7 * * ' + this.getDayNumber(day), async () => {
      await this.sendMorningMotivation(userId, activityCount, userData);
    }, {
      scheduled: false,
      timezone: "America/New_York"
    });
    
    // Evening reflection (9:00 PM)
    const eveningJob = cron.schedule('0 21 * * ' + this.getDayNumber(day), async () => {
      await this.sendEveningReflection(userId, userData);
    }, {
      scheduled: false,
      timezone: "America/New_York"
    });
    
    morningJob.start();
    eveningJob.start();
    
    if (!this.schedules.has(userId)) {
      this.schedules.set(userId, []);
    }
    this.schedules.get(userId).push(morningJob, eveningJob);
  }
  
  // Send activity reminder
  async sendActivityReminder(userId, activity, userData) {
    const token = userTokens.get(userId);
    const message = `⏰ Time for: ${activity.activity}\n\n${activity.description || ''}\n\n💡 Tip: ${activity.tips || 'Stay focused and give it your best!'}`;
    
    if (token) {
      try {
        await admin.messaging().send({
          notification: {
            title: 'MyTrainer - Activity Reminder',
            body: message,
            icon: '/logo192.png'
          },
          data: {
            type: 'activity_reminder',
            activity: JSON.stringify(activity),
            userId: userId
          },
          token: token
        });
      } catch (error) {
        console.error(`Error sending activity reminder to ${userId}:`, error);
      }
    }
  }
  
  // Send morning motivation
  async sendMorningMotivation(userId, activityCount, userData) {
    const token = userTokens.get(userId);
    const message = `Good morning! Ready to crush your goals today? You have ${activityCount} activities planned. Let's make today count! 💪`;
    
    if (token) {
      try {
        await admin.messaging().send({
          notification: {
            title: 'MyTrainer - Good Morning!',
            body: message,
            icon: '/logo192.png'
          },
          data: {
            type: 'morning_motivation',
            userId: userId
          },
          token: token
        });
      } catch (error) {
        console.error(`Error sending morning motivation to ${userId}:`, error);
      }
    }
  }
  
  // Send evening reflection
  async sendEveningReflection(userId, userData) {
    const token = userTokens.get(userId);
    const message = `Great work today! Take a moment to reflect on your progress. What went well? What can you improve tomorrow? 📝`;
    
    if (token) {
      try {
        await admin.messaging().send({
          notification: {
            title: 'MyTrainer - Evening Reflection',
            body: message,
            icon: '/logo192.png'
          },
          data: {
            type: 'evening_reflection',
            userId: userId
          },
          token: token
        });
      } catch (error) {
        console.error(`Error sending evening reflection to ${userId}:`, error);
      }
    }
  }
  
  // Clear schedules for a user
  clearUserSchedules(userId) {
    const userSchedules = this.schedules.get(userId);
    if (userSchedules) {
      userSchedules.forEach(job => job.stop());
      this.schedules.delete(userId);
    }
  }
  
  // Get day number for cron (0 = Sunday, 1 = Monday, etc.)
  getDayNumber(day) {
    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    return dayMap[day] || 0;
  }
}

const notificationScheduler = new NotificationScheduler();

// API endpoint to schedule notifications
app.post('/api/notifications/schedule', (req, res) => {
  try {
    const { userId, userData, schedule } = req.body;
    
    if (!userId || !userData || !schedule) {
      return res.status(400).json({ error: 'userId, userData, and schedule are required' });
    }
    
    notificationScheduler.scheduleUserNotifications(userId, userData, schedule);
    
    console.log(`Scheduled notifications for user: ${userId}`);
    res.json({ success: true, message: 'Notifications scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    res.status(500).json({ error: 'Failed to schedule notifications' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeUsers: userTokens.size,
    activeSchedules: userSchedules.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Notification server running on port ${PORT}`);
  console.log(`Twilio configured: ${!!process.env.TWILIO_ACCOUNT_SID}`);
  console.log(`Firebase configured: ${!!process.env.FIREBASE_PROJECT_ID}`);
});

module.exports = app; 