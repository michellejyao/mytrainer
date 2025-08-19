import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { generateWeeklySchedule } from './scheduleService';
import notificationService from './notificationService';
import NotificationSettings from './NotificationSettings';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #fdf5e6 30%, #ffa500 100%);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Playfair Display', serif;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem 3.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 40px rgba(255, 165, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 380px;
  max-width: 600px;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 165, 0, 0.1);
  align-items: center;
`;

const Title = styled.h1`
  color: #000000;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: 300;
  font-family: 'Playfair Display', serif;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 6px solid #ffe0b2;
  border-top: 6px solid #ffa500;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: ${spin} 1s linear infinite;
  margin: 2rem auto;
`;

const LoadingCard = styled(Card)`
  text-align: center;
  color: #ffa500;
`;

const CalendarContainer = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 2rem;
  padding: 2rem 1.5rem;
  box-shadow: 0 10px 40px rgba(255, 165, 0, 0.1);
  overflow-x: auto;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 165, 0, 0.1);
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2rem;
  min-width: 900px;
`;

const DayColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const DayHeader = styled.div`
  background: #ffa500;
  color: #fff;
  padding: 1rem 0.5rem;
  border-radius: 1rem 1rem 0 0;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  font-family: 'Playfair Display', serif;
`;

const ActivityCell = styled.div`
  background: #fff;
  border: 1px solid #ffd6ba;
  border-radius: 0.7rem;
  padding: 0.7rem;
  min-height: 80px;
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
  box-shadow: 0 2px 8px rgba(255, 188, 153, 0.08);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  &:hover {
    box-shadow: 0 4px 16px rgba(255, 165, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #ffa500;
  margin-bottom: 0.3rem;
  font-size: 1rem;
  line-height: 1.2;
`;

const ActivityDescription = styled.div`
  color: #666;
  font-size: 0.92rem;
  line-height: 1.2;
  margin-bottom: 0.2rem;
`;

const ActivityTips = styled.div`
  color: #ffa500;
  font-size: 0.85rem;
  font-style: italic;
  line-height: 1.2;
`;

const EmptyCell = styled(ActivityCell)`
  background: #f8f8f8;
  color: #999;
  font-style: italic;
  justify-content: center;
  align-items: center;
`;

const SummarySection = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #ffa500;
  font-family: 'Playfair Display', serif;
`;

const SummaryTitle = styled.h3`
  color: #ffa500;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  font-weight: 500;
`;

const TipsSection = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 1.5rem;
  padding: 1.5rem;
  border-left: 4px solid #ffd54f;
  margin-bottom: 1.5rem;
`;

const TipsTitle = styled.h3`
  color: #ffa500;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
`;

const TipItem = styled.div`
  background: #fff8f0;
  border-radius: 0.7rem;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.95rem;
`;

const GenerateButton = styled.button`
  background: #ffa500;
  color: #000000;
  border: none;
  border-radius: 1rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 2rem;
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

const NotificationButton = styled(GenerateButton)`
  background: #4CAF50;
  margin-left: 1rem;
  &:hover {
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
`;

const ErrorMessage = styled.div`
  background: #ffe6e6;
  color: #d63031;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  text-align: center;
`;

export default function ScheduleDisplay({ userData }) {
  console.log('=== SCHEDULE DISPLAY COMPONENT RENDERED ===');
  console.log('Props userData:', userData);
  
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const generateSchedule = async () => {
    console.log('=== SCHEDULE GENERATION START ===');
    console.log('User data received:', userData);
    console.log('User data type:', typeof userData);
    console.log('User data keys:', userData ? Object.keys(userData) : 'null');
    
    setLoading(true);
    setError(null);
    try {
      console.log('About to call generateWeeklySchedule...');
      const scheduleData = await generateWeeklySchedule(userData);
      console.log('Successfully received schedule data:', scheduleData);
      setSchedule(scheduleData);
      
      // Initialize notification service with the new schedule
      try {
        await notificationService.initialize(userData, scheduleData);
        console.log('Notification service initialized successfully');
      } catch (notificationError) {
        console.error('Error initializing notification service:', notificationError);
      }
    } catch (err) {
      console.error('Schedule generation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('=== SCHEDULE GENERATION END ===');
    }
  };

  useEffect(() => {
    console.log('=== USE EFFECT TRIGGERED ===');
    console.log('userData in useEffect:', userData);
    console.log('userData truthy check:', !!userData);
    
    if (userData) {
      console.log('Calling generateSchedule from useEffect...');
      generateSchedule();
    } else {
      console.log('No userData, not calling generateSchedule');
    }
  }, [userData]);

  const formatDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };



  if (loading) {
    return (
      <Container>
        <LoadingCard>
          <Title>Generating Your Personalized Schedule...</Title>
          <Spinner />
          <p style={{ color: '#000', fontSize: '1.1rem', marginTop: '1.5rem' }}>
            This may take a few moments. We're creating the perfect schedule for your goals!
          </p>
        </LoadingCard>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <ErrorMessage>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <GenerateButton onClick={generateSchedule}>
              Try Again
            </GenerateButton>
          </ErrorMessage>
        </Card>
      </Container>
    );
  }

  if (!schedule) {
    return (
      <Container>
        <Card>
          <Title>Ready to Generate Your Schedule?</Title>
          <GenerateButton onClick={generateSchedule}>
            Generate Weekly Schedule
          </GenerateButton>
        </Card>
      </Container>
    );
  }

  // Days in correct order: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return (
    <Container>
      <Title>Your Personalized Weekly Schedule</Title>
      {schedule.summary && (
        <SummarySection>
          <SummaryTitle>Weekly Overview</SummaryTitle>
          <p>{schedule.summary}</p>
        </SummarySection>
      )}
      <CalendarContainer>
        <CalendarGrid>
          {days.map(day => {
            const dayActivities = schedule.schedule[day]?.activities || [];
            return (
              <DayColumn key={day}>
                <DayHeader>{day.charAt(0).toUpperCase() + day.slice(1)}</DayHeader>
                {dayActivities.length > 0 ? (
                  dayActivities.map((activity, index) => (
                    <ActivityCell key={index}>
                      <ActivityTitle>{activity.time} - {activity.activity}</ActivityTitle>
                      {activity.description && (
                        <ActivityDescription>{activity.description}</ActivityDescription>
                      )}
                      {activity.tips && (
                        <ActivityTips>💡 {activity.tips}</ActivityTips>
                      )}
                    </ActivityCell>
                  ))
                ) : (
                  <EmptyCell>No activities scheduled</EmptyCell>
                )}
              </DayColumn>
            );
          })}
        </CalendarGrid>
      </CalendarContainer>
      {schedule.motivation_tips && schedule.motivation_tips.length > 0 && (
        <TipsSection>
          <TipsTitle>Motivation Tips</TipsTitle>
          {schedule.motivation_tips.map((tip, index) => (
            <TipItem key={index}>✨ {tip}</TipItem>
          ))}
        </TipsSection>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <GenerateButton onClick={generateSchedule}>
          Regenerate Schedule
        </GenerateButton>
        <NotificationButton onClick={() => setShowNotificationSettings(!showNotificationSettings)}>
          {showNotificationSettings ? 'Hide Notifications' : 'Notification Settings'}
        </NotificationButton>
      </div>
      
      {showNotificationSettings && (
        <NotificationSettings userData={userData} schedule={schedule} />
      )}
    </Container>
  );
} 