import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePersonalizedPlan(onboardingData: any): Promise<any> {
  try {
    const prompt = `You are a world-class fitness and nutrition coach designing a fully personalized fitness transformation plan. Use scientifically backed knowledge to create the most optimal workout and diet plan tailored specifically to help this user reach their goals.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${onboardingData.workoutDaysPerWeek || 6} workout days as specified by the user
2. Tailor exercises specifically to their stated goals and available equipment
3. Consider their dietary restrictions, budget, and preferences carefully
4. Create realistic meal plans that fit their lifestyle and schedule
5. Ensure macro calculations support their specific body composition goals

USER PROFILE:
Name: ${onboardingData.name || 'User'}
Sex: ${onboardingData.sex || 'Not specified'}
Height: ${onboardingData.height || 'Not specified'}
Weight: ${onboardingData.weight || 'Not specified'}
Birth Date: ${onboardingData.birthDate || 'Not specified'}
Current Activity: ${onboardingData.activityDescription || 'Not specified'}
Sleep: ${onboardingData.sleepHours || 'Not specified'} hours per night
Available Equipment: ${onboardingData.equipmentAccess || 'Not specified'}
Dietary Needs: ${onboardingData.dietPreferences || 'Not specified'}
Weekly Food Budget: $${onboardingData.weeklyBudget || 'Not specified'}
Primary Goals: ${onboardingData.goals || 'Not specified'}
Timeline: ${onboardingData.timeline || 'Not specified'}
Workout Frequency: ${onboardingData.workoutDaysPerWeek || 'Not specified'} days per week
Injuries/Limitations: ${onboardingData.injuries || 'None mentioned'}
Experience Level: ${onboardingData.pastExperience || 'Not specified'}
Coaching Preference: ${onboardingData.coachingStyle || 'Not specified'}
Personality: ${onboardingData.personalityType || 'Not specified'}

INSTRUCTIONS:
- Design a complete weekly workout split with the exact number of days requested
- Focus exercises on the specific muscle groups mentioned in their goals
- Use only equipment they have access to
- Calculate macros based on their body weight, goals, and activity level
- Create meals that avoid their dietary restrictions and fit their budget
- Consider their timeline for goal achievement in exercise selection and intensity

Return a single valid JSON object with this exact structure:

\`\`\`json
{
  "workoutPlan": {
    "week": 1,
    "split": "Push/Pull/Legs or Upper/Lower based on user frequency",
    "days": [
      {
        "day": "Monday", 
        "focus": "Target the specific goals mentioned",
        "exercises": [
          { "name": "Exercise name", "sets": 3, "reps": "8-12", "weight": "bodyweight or specify", "notes": "Form cues or modifications" },
          { "name": "Second exercise", "sets": 3, "reps": "10-15", "weight": "moderate", "notes": "Focus on specific muscle activation" }
        ],
        "cardio": "Optional cardio if mentioned in their routine"
      }
    ],
    "progression": "How to increase difficulty week by week",
    "notes": "Specific guidance for their goals and equipment"
  },
  "macroTargets": {
    "dailyCalories": 2100,
    "protein_g": 160,
    "carbs_g": 120,
    "fat_g": 90
  },
  "mealPlan": {
    "approach": "Brief explanation of nutritional strategy for their goals",
    "sampleDay": "Monday",
    "meals": [
      {
        "meal": "Breakfast",
        "time": "Suggested timing based on their schedule",
        "items": ["Specific portions that fit dietary restrictions", "Consider budget constraints"],
        "macros": { "calories": 400, "protein": 25, "carbs": 30, "fat": 15 }
      },
      {
        "meal": "Pre/Post Workout", 
        "time": "If they have a regular workout time",
        "items": ["Fuel for their specific workout type"],
        "macros": { "calories": 200, "protein": 15, "carbs": 25, "fat": 5 }
      },
      {
        "meal": "Lunch",
        "items": ["Filling options that fit work schedule"],
        "macros": { "calories": 500, "protein": 35, "carbs": 40, "fat": 20 }
      },
      {
        "meal": "Dinner", 
        "items": ["Recovery-focused evening meal"],
        "macros": { "calories": 600, "protein": 40, "carbs": 45, "fat": 25 }
      },
      {
        "meal": "Snacks",
        "items": ["Healthy options within budget"],
        "macros": { "calories": 300, "protein": 15, "carbs": 20, "fat": 15 }
      }
    ],
    "weeklyGroceryList": ["Items that fit their budget and dietary restrictions"],
    "mealPrepTips": "Specific advice for their lifestyle and schedule",
    "budgetOptimization": "How to maximize nutrition within their specified budget"
  }
}
\`\`\`

IMPORTANT REMINDER: You MUST include ALL ${onboardingData.workoutDaysPerWeek || 6} workout days in the "days" array. Do not stop at just 1-2 days. Generate the complete weekly split they requested. Each day should have 4-6 exercises that target their specific goals using their available equipment.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a world-class fitness and nutrition coach. Always return valid JSON exactly as specified in the prompt. Be precise with the JSON structure and ensure all fields are included."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const responseContent = completion.choices[0].message.content || "";
    
    // Parse the JSON response
    try {
      // Extract JSON from the response (in case it's wrapped in markdown)
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseContent;
      
      const parsedPlan = JSON.parse(jsonString);
      return parsedPlan;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.log('Raw response:', responseContent);
      throw new Error('Failed to parse generated plan');
    }
  } catch (error) {
    console.error('Error generating personalized plan:', error);
    throw new Error('Failed to generate personalized plan');
  }
}