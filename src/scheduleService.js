// You'll need to add your OpenAI API key to your environment variables
// Create a .env file in your project root and add: REACT_APP_OPENAI_API_KEY=your_api_key_here

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

console.log('=== SCHEDULE SERVICE LOADED ===');
console.log('OPENAI_API_KEY exists:', !!OPENAI_API_KEY);
console.log('OPENAI_API_KEY value:', OPENAI_API_KEY);

// Helper function to parse time formats
const parseTime = (timeString) => {
  if (!timeString) return null;
  
  // Handle formats like "08:00-09:00", "8:00 AM - 9:00 AM", "8:00-9:00"
  const cleanTime = timeString.replace(/\s*(AM|PM)\s*/gi, '').trim();
  
  if (cleanTime.includes('-')) {
    const [start] = cleanTime.split('-');
    return start.trim();
  }
  
  return cleanTime;
};

// Helper function to normalize time format
const normalizeTime = (timeString) => {
  const parsed = parseTime(timeString);
  if (!parsed) return null;
  
  // Ensure 24-hour format
  const [hours, minutes] = parsed.split(':');
  const hour = parseInt(hours);
  const minute = minutes || '00';
  
  return `${hour.toString().padStart(2, '0')}:${minute}`;
};

// Fallback schedule generator for when API key is not available
const generateFallbackSchedule = (userData) => {
  console.log('Generating fallback schedule');
  
  const startHour = parseInt(userData.startTime.split(':')[0]);
  const endHour = parseInt(userData.endTime.split(':')[0]);
  const workDays = userData.workDays.map(day => day.toLowerCase());
  
  const generateDaySchedule = (day) => {
    const activities = [];
    const isWorkDay = workDays.includes(day);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`;
      
      let activity, description, tips;
      
      if (isWorkDay) {
        if (hour === startHour) {
          activity = "Morning Routine & Goal Review";
          description = "Review today's objectives and prepare mentally for the day ahead";
          tips = "Write down your top 3 priorities for today";
        } else if (hour === startHour + 2) {
          activity = "Morning Break";
          description = "Take a short break to refresh and recharge";
          tips = "Stretch, hydrate, and take a few deep breaths";
        } else if (hour === startHour + 4) {
          activity = "Primary Goal Work Session";
          description = "Deep focus work on your main goal - eliminate distractions";
          tips = "Use the Pomodoro technique: 25 minutes work, 5 minutes break";
        } else if (hour === startHour + 6) {
          activity = "Afternoon Break";
          description = "Take a longer break for lunch and mental refresh";
          tips = "Eat a healthy meal and step away from your workspace";
        } else if (hour === endHour - 2) {
          activity = "Review & Planning";
          description = "Review today's progress and plan for tomorrow";
          tips = "Celebrate wins and identify areas for improvement";
        } else if (hour === endHour - 1) {
          activity = "Wrap-up & Preparation";
          description = "Organize workspace and prepare for the next day";
          tips = "Clear your desk and set up tomorrow's priorities";
        } else {
          activity = `Goal Work Session ${hour - startHour}`;
          description = "Focused work on your primary goal with specific tasks";
          tips = "Stay focused and track your progress";
        }
      } else {
        // Weekend/rest day activities
        if (hour === startHour) {
          activity = "Morning Reflection";
          description = "Start the day with gratitude and reflection";
          tips = "Write down 3 things you're grateful for";
        } else if (hour === startHour + 2) {
          activity = "Light Goal Work";
          description = "Gentle progress on your goals without pressure";
          tips = "Keep it enjoyable and stress-free";
        } else if (hour === startHour + 4) {
          activity = "Rest & Recharge";
          description = "Take time to relax and recharge your energy";
          tips = "Do something you enjoy that's not goal-related";
        } else {
          activity = "Weekend Activities";
          description = "Enjoy your time off while staying connected to your goals";
          tips = "Balance rest with gentle progress";
        }
      }
      
      activities.push({
        time: timeString,
        activity,
        description,
        tips
      });
    }
    
    return { activities };
  };
  
  const schedule = {
    monday: generateDaySchedule('monday'),
    tuesday: generateDaySchedule('tuesday'),
    wednesday: generateDaySchedule('wednesday'),
    thursday: generateDaySchedule('thursday'),
    friday: generateDaySchedule('friday'),
    saturday: generateDaySchedule('saturday'),
    sunday: generateDaySchedule('sunday')
  };
  
  return {
    schedule,
    summary: `Your personalized weekly schedule from ${userData.startTime} to ${userData.endTime}. Focus on your goal: ${userData.goal}`,
    motivation_tips: [
      "Stay consistent with your routine",
      "Track your progress daily",
      "Celebrate small wins along the way",
      "Remember why you started"
    ]
  };
};

export const generateWeeklySchedule = async (userData) => {
  try {
    console.log('Generating schedule with user data:', userData);
    
    // Check if API key is configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'undefined') {
      console.error('OpenAI API key is not configured, using fallback schedule');
      return generateFallbackSchedule(userData);
    }
    
    const prompt = `Create a DETAILED hourly weekly schedule based on the following user information:

Goals: ${userData.goal}
Work Days: ${userData.workDays.join(', ')}
Daily Start Time: ${userData.startTime}
Daily End Time: ${userData.endTime}
Preferences: ${userData.preferences}

IMPORTANT REQUIREMENTS:
1. For non-work days, do not include any activities and just have a rest day.
2. Create a COMPLETE hourly schedule that covers EVERY HOUR from ${userData.startTime} to ${userData.endTime}
3. Each hour must have a specific activity/task assigned - no empty hours
4. Include exactly 3 breaks per day (morning, afternoon, and evening)
5. Make the schedule PACKED with productive activities
6. Be extremely specific about what the user should be doing each hour
7. Consider the user's goals and create activities that directly contribute to achieving them

Format the response as a structured JSON object with this exact structure:
{
  "schedule": {
    "monday": {
      "activities": [
        {
          "time": "08:00-09:00",
          "activity": "Activity Name",
          "description": "Activity description",
          "tips": "Helpful tip"
        }
      ]
    },
    "tuesday": { "activities": [...] },
    "wednesday": { "activities": [...] },
    "thursday": { "activities": [...] },
    "friday": { "activities": [...] },
    "saturday": { "activities": [...] },
    "sunday": { "activities": [...] }
  },
  "summary": "Brief summary of the weekly plan",
  "motivation_tips": ["Tip 1", "Tip 2", "Tip 3"]
}

CRITICAL: 
1. Ensure every hour from ${userData.startTime} to ${userData.endTime} is filled with a specific activity. The schedule must be comprehensive and actionable.
2. DO NOT use "activities": [...] or any shorthand notation. Provide the complete array of activities for each day.
3. Each day must have a full array of activities covering every hour from start to end time.`;

    console.log('Sending prompt to ChatGPT...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const scheduleText = data.choices[0].message.content;
    
    console.log('Raw ChatGPT response:', scheduleText);
    
    // Try to parse the JSON response
    try {
      const scheduleData = JSON.parse(scheduleText);
      console.log('Parsed schedule data:', scheduleData);
      
      // Validate and ensure all days have activities
      const validatedSchedule = {
        schedule: {},
        summary: scheduleData.summary || "Your personalized weekly schedule",
        motivation_tips: scheduleData.motivation_tips || ["Stay consistent", "Track progress", "Celebrate wins"]
      };

      // Ensure all days have proper structure and normalize time formats
      const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      allDays.forEach(day => {
        if (scheduleData.schedule && scheduleData.schedule[day] && scheduleData.schedule[day].activities) {
          // Normalize time formats in activities
          const normalizedActivities = scheduleData.schedule[day].activities.map(activity => {
            let normalizedTime = activity.time;
            if (activity.time && activity.time.includes('-')) {
              const [start, end] = activity.time.split('-');
              const normalizedStart = normalizeTime(start);
              const normalizedEnd = normalizeTime(end);
              if (normalizedStart && normalizedEnd) {
                normalizedTime = `${normalizedStart}-${normalizedEnd}`;
              }
            }
            
            return {
              ...activity,
              time: normalizedTime
            };
          });
          
          validatedSchedule.schedule[day] = {
            ...scheduleData.schedule[day],
            activities: normalizedActivities
          };
        } else {
          // Create a default structure for missing days
          validatedSchedule.schedule[day] = {
            activities: [{
              time: `${userData.startTime}-${userData.endTime}`,
              activity: "Rest Day",
              description: "Take time to recharge and prepare for the week ahead",
              tips: "Use this time for reflection and planning"
            }]
          };
        }
      });

      console.log('Final validated schedule:', validatedSchedule);
      return validatedSchedule;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', scheduleText);
      
      // Check if the response was truncated
      if (scheduleText.includes('"activities": [...]') || scheduleText.length > 3000) {
        console.error('Response appears to be truncated, using fallback schedule');
        return generateFallbackSchedule(userData);
      }
      
      // Return a formatted version of the text as fallback
      return {
        schedule: {
          monday: { 
            activities: [{ 
              time: `${userData.startTime}-${userData.endTime}`, 
              activity: "Schedule Generation", 
              description: "Your personalized schedule is being generated. Please try again if this persists.", 
              tips: "The AI is working on creating your detailed schedule" 
            }] 
          },
          tuesday: { activities: [] },
          wednesday: { activities: [] },
          thursday: { activities: [] },
          friday: { activities: [] },
          saturday: { activities: [] },
          sunday: { activities: [] }
        },
        summary: "Schedule generated successfully",
        motivation_tips: ["Stay consistent with your routine", "Track your progress", "Celebrate small wins"]
      };
    }
  } catch (error) {
    console.error('Error generating schedule:', error);
    throw new Error('Failed to generate schedule. Please try again.');
  }
}; 