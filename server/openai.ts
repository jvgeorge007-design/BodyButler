import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePersonalizedPlan(onboardingData: any): Promise<any> {
  try {
    const prompt = `You are a world-class fitness and nutrition coach designing a fully personalized fitness transformation plan. You use scientifically backed knowledge to build out the most optimal workout and diets to help user reach goal.

Use the following user profile to tailor your response:

Name: ${onboardingData.name || 'User'}
Sex: ${onboardingData.sex || 'Not specified'}
Height: ${onboardingData.height || 'Not specified'}
Weight: ${onboardingData.weight || 'Not specified'}
Birth Date: ${onboardingData.birthDate || 'Not specified'}
Activity Level: ${onboardingData.activityDescription || 'Not specified'}
Average Sleep per Night: ${onboardingData.sleepHours || 'Not specified'} hours
Equipment Access: ${onboardingData.equipmentAccess || 'Not specified'}
Diet Preferences: ${onboardingData.dietPreferences || 'Not specified'}
Weekly Grocery Budget: $${onboardingData.weeklyBudget || 'Not specified'}
Fitness Goals: ${onboardingData.goals || 'Not specified'}
Timeline to Goal: ${onboardingData.timeline || 'Not specified'}
Workout Days per Week: ${onboardingData.workoutDaysPerWeek || 'Not specified'}
Injuries or Chronic Conditions: ${onboardingData.injuries || 'None mentioned'}
Past Workout/Diet Experience: ${onboardingData.pastExperience || 'Not specified'}
Preferred Coaching Style: ${onboardingData.coachingStyle || 'Not specified'}
Personality Type: ${onboardingData.personalityType || 'Not specified'}

---

Return the following 3 sections in a single valid JSON object with this exact structure:

\`\`\`json
{
  "workoutPlan": {
    "week": 1,
    "days": [
      {
        "day": "Monday",
        "focus": "Upper Body Push",
        "exercises": [
          { "name": "Incline Dumbbell Press", "sets": 3, "reps": 10 },
          { "name": "Overhead Press", "sets": 3, "reps": 8 }
        ]
      }
    ]
  },
  "macroTargets": {
    "dailyCalories": 2100,
    "protein_g": 160,
    "carbs_g": 120,
    "fat_g": 90
  },
  "mealPlan": {
    "sampleDay": "Monday",
    "meals": [
      {
        "meal": "Breakfast",
        "items": ["4 egg whites", "1 slice whole grain toast", "1 tbsp almond butter"]
      },
      {
        "meal": "Lunch",
        "items": ["Grilled chicken breast", "1 cup broccoli", "½ cup quinoa"]
      },
      {
        "meal": "Dinner",
        "items": ["Salmon filet", "1 cup asparagus", "½ sweet potato"]
      },
      {
        "meal": "Snacks",
        "items": ["Greek yogurt", "handful of almonds"]
      }
    ],
    "weeklyGroceryList": [
      "12 eggs",
      "2 chicken breasts",
      "2 salmon filets",
      "1 bag frozen broccoli",
      "quinoa",
      "1 sweet potato",
      "1 loaf whole grain bread",
      "almond butter",
      "asparagus",
      "Greek yogurt",
      "almonds"
    ]
  }
}
\`\`\`
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