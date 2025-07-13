import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePersonalizedPlan(onboardingData: any): Promise<any> {
  try {
    const prompt = `🧠 BODY BUTLER MASTER PROMPT (v2.0)

You are a world-class fitness and nutrition coach, combining elite-level training science (like Tim Grover) with deep personalization. Your task is to generate a precise, scientifically validated, and fully tailored workout and nutrition plan that reflects the user's profile below.

Use the most effective training principles, but ensure the tone, coaching style, and difficulty match the user's stated preference and capabilities. If their goals are unrealistic for the timeline, recalibrate and explain the reasoning clearly and respectfully.

🧱 CORE REQUIREMENTS
1. Workout Plan
Include EXACTLY ${onboardingData.workoutDaysPerWeek || 6} workout days the user requests

Select the most optimal training structure based on:
• Frequency: ${onboardingData.workoutDaysPerWeek || 'Not specified'} days per week
• Experience level: ${onboardingData.experienceLevel || 'Not specified'}
• Recovery capacity: ${onboardingData.recoveryCapacity || 'Not specified'}
• Primary goals: ${onboardingData.goals || 'Not specified'}

Choose from (or create hybrid of):
• Full-body
• Upper/Lower
• Push/Pull/Legs
• Goal-specific split (e.g., Arms + Back specialization)
• Strength/Hypertrophy hybrid

Use only exercises compatible with: ${onboardingData.equipmentAccess || 'Not specified'}
Prioritize evidence-backed movements for hypertrophy, recomposition, or strength
Customize for priority or lagging muscle groups: ${onboardingData.priorityMuscles || 'Not specified'}
Include optional cardio (${onboardingData.cardioPreference || 'user preference'}) based on user preference and goals
Include clear weekly progression guidance

2. Macro Targets
Calculate protein, carbs, and fats based on:
• Body weight: ${onboardingData.weight || 'Not specified'}
• Goal phase: ${onboardingData.goalPhase || 'Not specified'}
• Activity level: ${onboardingData.activityLevel || 'Not specified'} and training intensity
• Sex: ${onboardingData.sex || 'Not specified'}
• Age: ${onboardingData.birthDate || 'Not specified'}

Explain the rationale for calorie level and macro breakdown
Ensure adequacy for muscle retention, recovery, hormonal health, and adherence

3. Meal Plan
Respect dietary preferences: ${onboardingData.dietPreferences || 'Not specified'}
Fasting windows: ${onboardingData.fastingWindow || 'Not specified'}
Grocery budget: $${onboardingData.weeklyBudget || 'Not specified'}

Design a full day meal structure, broken into:
• Breakfast (if applicable based on fasting window)
• Pre/Post Workout
• Lunch
• Dinner
• Snacks

Provide macros per meal
Include a weekly grocery list aligned with the food plan
Suggest meal prep tips and budget optimizations

4. Explanatory Notes
Include brief but clear explanations of:
• Why this training structure was selected
• Why these macros support their transformation
• How the meal plan fits their lifestyle and performance needs
• Provide high-level strategy and weekly progression approach

USER PROFILE:
Name: ${onboardingData.name || 'User'}
Sex: ${onboardingData.sex || 'Not specified'}
Height: ${onboardingData.height || 'Not specified'}
Weight: ${onboardingData.weight || 'Not specified'}
Birth Date: ${onboardingData.birthDate || 'Not specified'}
Current Activity: ${onboardingData.activityDescription || 'Not specified'}
Activity Level: ${onboardingData.activityLevel || 'Not specified'}
Recovery Capacity: ${onboardingData.recoveryCapacity || 'Not specified'}
Sleep: ${onboardingData.sleepHours || 'Not specified'} hours per night
Available Equipment: ${onboardingData.equipmentAccess || 'Not specified'}
Dietary Needs: ${onboardingData.dietPreferences || 'Not specified'}
Fasting Window: ${onboardingData.fastingWindow || 'Not specified'}
Weekly Food Budget: $${onboardingData.weeklyBudget || 'Not specified'}
Primary Goals: ${onboardingData.goals || 'Not specified'}
Goal Phase: ${onboardingData.goalPhase || 'Not specified'}
Priority Muscles: ${onboardingData.priorityMuscles || 'Not specified'}
Timeline: ${onboardingData.timeline || 'Not specified'}
Workout Frequency: ${onboardingData.workoutDaysPerWeek || 'Not specified'} days per week
Experience Level: ${onboardingData.experienceLevel || 'Not specified'}
Cardio Preference: ${onboardingData.cardioPreference || 'Not specified'}
Injuries/Limitations: ${onboardingData.injuries || 'None mentioned'}
Past Experience: ${onboardingData.pastExperience || 'Not specified'}
Coaching Preference: ${onboardingData.coachingStyle || 'Not specified'}
Personality: ${onboardingData.personalityType || 'Not specified'}

🔁 RESPONSE FORMAT (REQUIRED)
Return only a valid JSON object in this exact format:
{
  "workoutPlan": {
    "week": 1,
    "split": "Describe chosen split format here",
    "days": [
      {
        "day": "Monday", 
        "focus": "Muscle group or performance goal",
        "exercises": [
          { "name": "Exercise", "sets": 3, "reps": "8-12", "weight": "bodyweight/moderate/heavy", "notes": "Form cue or emphasis" },
          { "name": "Next Exercise", "sets": 3, "reps": "10-15", "weight": "light/moderate", "notes": "Focus area or time under tension" }
        ],
        "cardio": "e.g., 30 min incline walk at 6 speed, optional"
      }
    ],
    "progression": "How to increase difficulty (e.g., add weight, volume, or tempo)",
    "rationale": "Why this training split and exercise selection were chosen"
  },
  "macroTargets": {
    "dailyCalories": 0,
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0,
    "rationale": "Explain how these macros support the user's body comp and energy needs"
  },
  "mealPlan": {
    "approach": "e.g., High-protein deficit with moderate carbs for training energy",
    "sampleDay": "Monday",
    "meals": [
      {
        "meal": "Breakfast",
        "time": "Optional depending on IF or schedule",
        "items": ["Examples based on budget + macros"],
        "macros": { "calories": 400, "protein": 30, "carbs": 35, "fat": 15 }
      },
      {
        "meal": "Pre/Post Workout",
        "time": "Before or after workout",
        "items": ["Workout fuel and recovery meals"],
        "macros": { "calories": 300, "protein": 25, "carbs": 30, "fat": 10 }
      },
      {
        "meal": "Lunch",
        "items": ["Protein + carb-heavy to support recovery"],
        "macros": { "calories": 500, "protein": 35, "carbs": 40, "fat": 15 }
      },
      {
        "meal": "Dinner",
        "items": ["Protein + fat dominant for satiety"],
        "macros": { "calories": 600, "protein": 40, "carbs": 30, "fat": 25 }
      },
      {
        "meal": "Snacks",
        "items": ["Optional, based on hunger and adherence"],
        "macros": { "calories": 200, "protein": 15, "carbs": 15, "fat": 10 }
      }
    ],
    "weeklyGroceryList": ["Affordable staples with high protein density and micronutrients"],
    "mealPrepTips": "Batch cooking or prepping tips for busy schedules",
    "budgetOptimization": "Where to shop, which cuts to prioritize, and what to swap"
  }
}

CRITICAL: You MUST include ALL ${onboardingData.workoutDaysPerWeek || 6} workout days in the "days" array. Generate the complete weekly split with 4-6 exercises per day that target their specific goals using their available equipment.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a world-class fitness and nutrition coach, combining elite-level training science with deep personalization. Always return valid JSON exactly as specified in the prompt. Be precise with the JSON structure and ensure all fields are included. If goals are unrealistic for the timeline, recalibrate and explain the reasoning clearly."
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