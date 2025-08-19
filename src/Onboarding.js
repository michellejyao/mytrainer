import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffffff 0%, #fdf5e6 30%, #ffa500 100%);
  font-family: 'Playfair Display', serif;
  padding: 2rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem 3.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 40px rgba(255, 165, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 400px;
  max-width: 600px;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 165, 0, 0.1);
`;

const Question = styled.h2`
  color: #000000;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  font-weight: 300;
  font-family: 'Playfair Display', serif;
  line-height: 1.4;
`;

const Input = styled.textarea`
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  border: 2px solid rgba(255, 165, 0, 0.2);
  background: #ffffff;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const TimeInput = styled.input`
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  border: 2px solid rgba(255, 165, 0, 0.2);
  background: #ffffff;
  font-size: 1rem;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
  }
`;

const TimeContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const TimeLabel = styled.label`
  color: #000000;
  font-weight: 500;
  min-width: 80px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Dropdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DaysList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
`;

const DayButton = styled.button`
  background: ${props => (props.selected ? '#ffa500' : '#ffffff')};
  color: ${props => (props.selected ? '#000000' : '#000000')};
  border: 2px solid #ffa500;
  border-radius: 1rem;
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 500;
  
  &:hover {
    background: #ffa500;
    color: #000000;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
  }
`;

const NextButton = styled.button`
  background: #ffa500;
  color: #000000;
  border: none;
  border-radius: 1rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  align-self: flex-end;
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

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 165, 0, 0.2);
  border-radius: 2px;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #ffa500;
  border-radius: 2px;
  transition: width 0.5s ease;
  width: ${props => (props.step / 3) * 100}%;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  width: 100%;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? '#ffa500' : 'rgba(255, 165, 0, 0.3)'};
  transition: all 0.3s ease;
`;

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');
  const [workDays, setWorkDays] = useState([]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [preferences, setPreferences] = useState('');

  const handleDayToggle = (day) => {
    setWorkDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleNext = () => {
    if (step === 3) {
      onComplete({ goal, workDays, startTime, endTime, preferences });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <Container>
      <Card>
        <ProgressBar>
          <ProgressFill step={step} />
        </ProgressBar>
        <StepIndicator>
          {[0, 1, 2, 3].map((stepNum) => (
            <StepDot key={stepNum} active={step >= stepNum} />
          ))}
        </StepIndicator>
        
        {step === 0 && (
          <>
            <Question>What goal(s) do you want to pursue?</Question>
            <Input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Get fit, learn a language, write a book..."
            />
            <NextButton onClick={handleNext} disabled={!goal.trim()}>
              Next
            </NextButton>
          </>
        )}
        {step === 1 && (
          <>
            <Question>How many work days do you want each week?</Question>
            <Dropdown>
              <DaysList>
                {weekDays.map(day => (
                  <DayButton
                    key={day}
                    selected={workDays.includes(day)}
                    onClick={() => handleDayToggle(day)}
                  >
                    {day}
                  </DayButton>
                ))}
              </DaysList>
            </Dropdown>
            <NextButton onClick={handleNext} disabled={workDays.length === 0}>
              Next
            </NextButton>
          </>
        )}
        {step === 2 && (
          <>
            <Question>What time do you want to start and end your day?</Question>
            <TimeContainer>
              <TimeLabel>Start:</TimeLabel>
              <TimeInput
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </TimeContainer>
            <TimeContainer>
              <TimeLabel>End:</TimeLabel>
              <TimeInput
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </TimeContainer>
            <NextButton onClick={handleNext}>
              Next
            </NextButton>
          </>
        )}
        {step === 3 && (
          <>
            <Question>Here's your chance to be more specific with what you want. Write out your preferences. The more specific you are, the better the generated schedule is.</Question>
            <Input
              value={preferences}
              onChange={e => setPreferences(e.target.value)}
              placeholder="e.g. I prefer mornings, I want weekends off, I like 30-minute sessions..."
            />
            <NextButton onClick={handleNext} disabled={!preferences.trim()}>
              Finish
            </NextButton>
          </>
        )}
      </Card>
    </Container>
  );
} 