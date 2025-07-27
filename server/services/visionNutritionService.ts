import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface NutritionEstimate {
  foodItems: string[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  insights: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portionSize: 'small' | 'medium' | 'large';
  healthScore: number; // 1-10
}

interface UserContext {
  recentWorkouts?: Array<{
    type: string;
    date: string;
    intensity: string;
  }>;
  fitnessGoals?: string[];
  activityLevel?: string;
  currentTime?: string;
  previousMeals?: Array<{
    foodItems: string[];
    calories: number;
    timestamp: string;
  }>;
}

export async function analyzeFood(
  imageBase64: string, 
  userContext: UserContext = {}
): Promise<NutritionEstimate> {
  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 11 ? 'morning' : currentHour < 15 ? 'afternoon' : 'evening';
  
  const prompt = `You are an expert nutritionist and personal trainer analyzing this food photo. 

USER CONTEXT:
- Recent workouts: ${JSON.stringify(userContext.recentWorkouts || [])}
- Fitness goals: ${userContext.fitnessGoals?.join(', ') || 'general health'}
- Activity level: ${userContext.activityLevel || 'moderate'}
- Time of day: ${timeOfDay}
- Previous meals today: ${JSON.stringify(userContext.previousMeals || [])}

Analyze this meal photo and provide:
1. Identify all food items visible
2. Estimate total calories (rough estimate is fine)
3. Estimate macros (protein, carbs, fat in grams)
4. Determine meal type based on time and food
5. Assess portion size
6. Rate health score (1-10)
7. Provide 2-3 contextual insights about this meal choice

CONTEXTUAL INSIGHTS should connect to:
- How this meal supports their workouts/recovery
- Timing relative to training
- How it fits their goals
- Behavioral patterns you notice

Be encouraging and educational. Focus on "why" not just "what."

Respond in JSON format: {
  "foodItems": ["item1", "item2"],
  "totalCalories": number,
  "macros": {"protein": number, "carbs": number, "fat": number},
  "insights": ["insight1", "insight2", "insight3"],
  "mealType": "breakfast|lunch|dinner|snack",
  "portionSize": "small|medium|large",
  "healthScore": number
}`;

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      foodItems: result.foodItems || [],
      totalCalories: result.totalCalories || 0,
      macros: {
        protein: result.macros?.protein || 0,
        carbs: result.macros?.carbs || 0,
        fat: result.macros?.fat || 0,
      },
      insights: result.insights || [],
      mealType: result.mealType || 'snack',
      portionSize: result.portionSize || 'medium',
      healthScore: result.healthScore || 5,
    };
  } catch (error) {
    console.error('Vision nutrition analysis error:', error);
    throw new Error('Failed to analyze food image');
  }
}

export async function generateDailyInsights(
  todaysMeals: NutritionEstimate[],
  userContext: UserContext
): Promise<string[]> {
  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.macros.protein, 0);
  
  const prompt = `As a personal trainer and nutritionist, analyze today's eating patterns:

MEALS TODAY:
${todaysMeals.map((meal, i) => 
  `${i + 1}. ${meal.foodItems.join(', ')} - ${meal.totalCalories} cal, ${meal.macros.protein}g protein`
).join('\n')}

USER CONTEXT:
- Recent workouts: ${JSON.stringify(userContext.recentWorkouts || [])}
- Fitness goals: ${userContext.fitnessGoals?.join(', ') || 'general health'}
- Activity level: ${userContext.activityLevel || 'moderate'}

Totals: ${totalCalories} calories, ${totalProtein}g protein

Provide 3-4 insights about:
1. How their nutrition supported their training today
2. Patterns you notice in their food choices
3. One specific recommendation for tomorrow
4. Encouragement about what they did well

Be personal, encouraging, and focus on the connection between their food and fitness performance.

Respond as a JSON array of insight strings: ["insight1", "insight2", "insight3"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
    return result.insights || [];
  } catch (error) {
    console.error('Daily insights generation error:', error);
    return ["Keep up the great work with your nutrition tracking!"];
  }
}