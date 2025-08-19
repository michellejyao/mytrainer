import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  const scrollToFeatures = () => {
    document.getElementById('features-section').scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">My Trainer</h1>
          <p className="hero-description">
            Generate personalized schedules based on your goals and preferences. Achieve your goals and dreams with smart, adaptive planning.
          </p>
          <button className="cta-button" onClick={onGetStarted}>
            Get Started
          </button>
          <div className="scroll-indicator" onClick={scrollToFeatures}>
            <div className="scroll-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="features-section">
        <div className="features-content">
          <h2 className="features-title">Why Use My Trainer?</h2>
          <p className="features-description">
            Everything you need to create the perfect training schedule tailored to your unique goals and lifestyle.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">Personalized Plans</h3>
              <p className="feature-description">
                AI-powered schedule generation based on your specific goals, availability, and preferences.
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">Flexible Scheduling</h3>
              <p className="feature-description">
                Easily adjust your plan as your life changes and priorities shift. Just drag and drop!
              </p>
            </div>

            <div className="feature-card">
              <h3 className="feature-title">Daily Monitoring</h3>
              <p className="feature-description">
                Notification reminders to keep you on track and help you achieve all your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="cta-section" className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Life?</h2>
          <p className="cta-description">
            Join thousands of users who have revolutionized their life with personalized, intelligent scheduling and monitoring. Start building your perfect daily plans today.
          </p>
          <button className="cta-button-large" onClick={onGetStarted}>
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 