import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import notificationService from './notificationService';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  border-left: 4px solid #ffa500;
  font-family: 'Playfair Display', serif;
`;

const Title = styled.h3`
  color: #ffa500;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 500;
`;

const SettingGroup = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #fff8f0;
  border-radius: 1rem;
  border: 1px solid #ffd6ba;
`;

const SettingTitle = styled.h4`
  color: #ffa500;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 500;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.7rem;
  border: 1px solid #ffd6ba;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #333;
  cursor: pointer;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #ffa500;
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ffd6ba;
  border-radius: 0.7rem;
  font-size: 1rem;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.2);
  }
`;

const TimeInput = styled(Input)`
  width: 120px;
`;

const Button = styled.button`
  background: #ffa500;
  color: #000000;
  border: none;
  border-radius: 1rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 1rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 165, 0, 0.4);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f0f0f0;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: #e0e0e0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 0.7rem;
  margin-bottom: 1rem;
  font-weight: 500;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  &.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
  }
`;

const NotificationPreview = styled.div`
  background: #fff;
  border: 1px solid #ffd6ba;
  border-radius: 0.7rem;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

export default function NotificationSettings({ userData, schedule }) {
  const [settings, setSettings] = useState({
    smsEnabled: false,
    pushEnabled: false,
    phoneNumber: '',
    notificationTimes: {
      morning: '07:30',
      afternoon: '12:00',
      evening: '21:00'
    },
    activityReminders: true,
    dailyMotivation: true,
    eveningReflection: true
  });
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    
    // Update notification service
    notificationService.updateSettings(newSettings);
  };

  const handleTimeChange = (timeKey, value) => {
    const newSettings = {
      ...settings,
      notificationTimes: {
        ...settings.notificationTimes,
        [timeKey]: value
      }
    };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Validate phone number if SMS is enabled
      if (settings.smsEnabled && !settings.phoneNumber) {
        throw new Error('Phone number is required when SMS notifications are enabled');
      }
      
      // Update notification service
      await notificationService.updateSettings(settings);
      
      // Schedule notifications on the backend
      if (userData && schedule) {
        await fetch('/api/notifications/schedule', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.id || 'anonymous',
            userData: userData,
            schedule: schedule
          })
        });
      }
      
      setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      await notificationService.testNotification();
      setMessage({ type: 'success', text: 'Test notification sent! Check your device.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test notification: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    try {
      await notificationService.requestNotificationPermission();
      const currentSettings = notificationService.getSettings();
      setSettings(prev => ({ ...prev, pushEnabled: currentSettings.pushEnabled }));
      setMessage({ type: 'info', text: 'Notification permissions updated!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to request permissions: ' + error.message });
    }
  };

  return (
    <Container>
      <Title>Notification Settings</Title>
      
      {message && (
        <Message className={message.type}>
          {message.text}
        </Message>
      )}
      
      <SettingGroup>
        <SettingTitle>Push Notifications</SettingTitle>
        <ToggleContainer>
          <ToggleLabel>
            Enable Push Notifications
            <NotificationPreview>
              Receive notifications directly on your device
            </NotificationPreview>
          </ToggleLabel>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.pushEnabled}
              onChange={(e) => handleSettingChange('pushEnabled', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </ToggleContainer>
        
        {!settings.pushEnabled && (
          <Button onClick={handleRequestPermissions}>
            Request Permission
          </Button>
        )}
      </SettingGroup>
      
      <SettingGroup>
        <SettingTitle>SMS Notifications</SettingTitle>
        <ToggleContainer>
          <ToggleLabel>
            Enable SMS Notifications
            <NotificationPreview>
              Receive text message reminders
            </NotificationPreview>
          </ToggleLabel>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.smsEnabled}
              onChange={(e) => handleSettingChange('smsEnabled', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </ToggleContainer>
        
        {settings.smsEnabled && (
          <InputGroup>
            <Label>Phone Number (with country code)</Label>
            <Input
              type="tel"
              placeholder="+1234567890"
              value={settings.phoneNumber}
              onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
            />
          </InputGroup>
        )}
      </SettingGroup>
      
      <SettingGroup>
        <SettingTitle>Notification Types</SettingTitle>
        
        <ToggleContainer>
          <ToggleLabel>
            Activity Reminders
            <NotificationPreview>
              Get notified 5 minutes before each scheduled activity
            </NotificationPreview>
          </ToggleLabel>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.activityReminders}
              onChange={(e) => handleSettingChange('activityReminders', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </ToggleContainer>
        
        <ToggleContainer>
          <ToggleLabel>
            Daily Motivation
            <NotificationPreview>
              Morning motivation messages to start your day right
            </NotificationPreview>
          </ToggleLabel>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.dailyMotivation}
              onChange={(e) => handleSettingChange('dailyMotivation', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </ToggleContainer>
        
        <ToggleContainer>
          <ToggleLabel>
            Evening Reflection
            <NotificationPreview>
              Evening prompts to reflect on your progress
            </NotificationPreview>
          </ToggleLabel>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              checked={settings.eveningReflection}
              onChange={(e) => handleSettingChange('eveningReflection', e.target.checked)}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </ToggleContainer>
      </SettingGroup>
      
      <SettingGroup>
        <SettingTitle>Notification Times</SettingTitle>
        
        <InputGroup>
          <Label>Morning Motivation Time</Label>
          <TimeInput
            type="time"
            value={settings.notificationTimes.morning}
            onChange={(e) => handleTimeChange('morning', e.target.value)}
          />
        </InputGroup>
        
        <InputGroup>
          <Label>Afternoon Break Time</Label>
          <TimeInput
            type="time"
            value={settings.notificationTimes.afternoon}
            onChange={(e) => handleTimeChange('afternoon', e.target.value)}
          />
        </InputGroup>
        
        <InputGroup>
          <Label>Evening Reflection Time</Label>
          <TimeInput
            type="time"
            value={settings.notificationTimes.evening}
            onChange={(e) => handleTimeChange('evening', e.target.value)}
          />
        </InputGroup>
      </SettingGroup>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
        
        <SecondaryButton 
          onClick={handleTestNotification} 
          disabled={loading || (!settings.smsEnabled && !settings.pushEnabled)}
        >
          {loading ? 'Sending...' : 'Send Test Notification'}
        </SecondaryButton>
      </div>
    </Container>
  );
} 