import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePersonalizedPlan(onboardingData: any): Promise<string> {
  try {
    const prompt = `
You are Body Butler (BB), an expert personal trainer and nutrition coach. Create a comprehensive, personalized fitness and nutrition plan based on the following user information:

USER PROFILE:
- Name: ${onboardingData.name || 'User'}
- Sex: ${onboardingData.sex || 'Not specified'}
- Height: ${onboardingData.height || 'Not specified'}
- Weight: ${onboardingData.weight || 'Not specified'}
- Birth Date: ${onboardingData.birthDate || 'Not specified'}

LIFESTYLE:
- Current Activity: ${onboardingData.activityDescription || 'Not specified'}
- Sleep Hours: ${onboardingData.sleepHours || 'Not specified'}
- Equipment Access: ${onboardingData.equipmentAccess || 'Not specified'}

NUTRITION & BUDGET:
- Diet Preferences: ${onboardingData.dietPreferences || 'Not specified'}
- Weekly Budget: ${onboardingData.weeklyBudget || 'Not specified'}

GOALS & TIMELINE:
- Goals: ${onboardingData.goals || 'Not specified'}
- Timeline: ${onboardingData.timeline || 'Not specified'}

AVAILABILITY & CONSTRAINTS:
- Workout Days Per Week: ${onboardingData.workoutDaysPerWeek || 'Not specified'}
- Injuries/Limitations: ${onboardingData.injuries || 'None mentioned'}
- Past Experience: ${onboardingData.pastExperience || 'Not specified'}

COACHING STYLE:
- Preferred Coaching Style: ${onboardingData.coachingStyle || 'Not specified'}
- Personality Type: ${onboardingData.personalityType || 'Not specified'}

Create a detailed plan that includes:

1. **WEEKLY WORKOUT SCHEDULE**
   - Specific exercises for each day
   - Sets, reps, and rest periods
   - Progressive overload strategy

2. **NUTRITION PLAN**
   - Daily calorie targets
   - Macronutrient breakdown
   - Meal timing suggestions
   - Budget-friendly food recommendations

3. **LIFESTYLE OPTIMIZATION**
   - Sleep optimization tips
   - Recovery strategies
   - Stress management

4. **PROGRESS TRACKING**
   - Key metrics to monitor
   - Milestone checkpoints
   - Adjustment guidelines

5. **MOTIVATIONAL COACHING**
   - Personalized motivation based on their personality type
   - Weekly check-in questions
   - Habit formation strategies

Make the plan actionable, specific, and tailored to their equipment access, schedule, and goals. Use their preferred coaching style and personality type to customize the tone and approach.

Format the response in clear sections with bullet points and practical advice they can implement immediately.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Body Butler (BB), an expert personal trainer and nutrition coach who creates comprehensive, personalized fitness and nutrition plans. Be specific, actionable, and motivating in your recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    return completion.choices[0].message.content || "Unable to generate plan at this time.";
  } catch (error) {
    console.error('Error generating personalized plan:', error);
    throw new Error('Failed to generate personalized plan');
  }
}