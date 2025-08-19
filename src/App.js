import React, { useState } from 'react';
import AuthPage from './AuthPage';
import Onboarding from './Onboarding';
import ScheduleDisplay from './ScheduleDisplay';
import LandingPage from './LandingPage';

console.log('=== APP.JS LOADED ===');
console.log('React version:', React.version);

function App() {
  console.log('=== APP COMPONENT RENDERED ===');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  console.log('App state - isAuthenticated:', isAuthenticated);
  console.log('App state - onboardingData:', onboardingData);
  console.log('App state - showLandingPage:', showLandingPage);

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  // Show landing page first
  if (showLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Then show authentication flow
  if (!isAuthenticated) {
    return <AuthPage onAuth={() => setIsAuthenticated(true)} />;
  }

  if (!onboardingData) {
    return <Onboarding onComplete={setOnboardingData} />;
  }

  return <ScheduleDisplay userData={onboardingData} />;
}

export default App;
