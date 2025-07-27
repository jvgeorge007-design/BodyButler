import { z } from 'zod';
import crypto from 'crypto';

const FATSECRET_CLIENT_ID = '6773a66128a14d72bfea8905f50e6a09';
const FATSECRET_CLIENT_SECRET = '8269976ded2944a7b7f98e6111daf7bd';
const FATSECRET_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

// FatSecret API response schemas
const FatSecretFoodSchema = z.object({
  food_id: z.string(),
  food_name: z.string(),
  food_type: z.string().optional(),
  brand_name: z.string().optional(),
  food_description: z.string(),
});

const FatSecretSearchResponseSchema = z.object({
  foods: z.object({
    food: z.array(FatSecretFoodSchema).or(FatSecretFoodSchema).optional(),
    max_results: z.string().optional(),
    page_number: z.string().optional(),
    total_results: z.string().optional(),
  }).optional(),
});

const FatSecretNutritionSchema = z.object({
  food: z.object({
    food_id: z.string(),
    food_name: z.string(),
    food_type: z.string().optional(),
    brand_name: z.string().optional(),
    servings: z.object({
      serving: z.array(z.object({
        serving_id: z.string(),
        serving_description: z.string(),
        serving_url: z.string().optional(),
        metric_serving_amount: z.string().optional(),
        metric_serving_unit: z.string().optional(),
        number_of_units: z.string().optional(),
        measurement_description: z.string(),
        calories: z.string(),
        carbohydrate: z.string(),
        protein: z.string(),
        fat: z.string(),
        saturated_fat: z.string(),
        polyunsaturated_fat: z.string().optional(),
        monounsaturated_fat: z.string().optional(),
        trans_fat: z.string().optional(),
        cholesterol: z.string().optional(),
        sodium: z.string(),
        potassium: z.string().optional(),
        fiber: z.string(),
        sugar: z.string(),
        added_sugars: z.string().optional(),
        vitamin_a: z.string().optional(),
        vitamin_c: z.string().optional(),
        calcium: z.string().optional(),
        iron: z.string().optional(),
      })).or(z.object({
        serving_id: z.string(),
        serving_description: z.string(),
        serving_url: z.string().optional(),
        metric_serving_amount: z.string().optional(),
        metric_serving_unit: z.string().optional(),
        number_of_units: z.string().optional(),
        measurement_description: z.string(),
        calories: z.string(),
        carbohydrate: z.string(),
        protein: z.string(),
        fat: z.string(),
        saturated_fat: z.string(),
        polyunsaturated_fat: z.string().optional(),
        monounsaturated_fat: z.string().optional(),
        trans_fat: z.string().optional(),
        cholesterol: z.string().optional(),
        sodium: z.string(),
        potassium: z.string().optional(),
        fiber: z.string(),
        sugar: z.string(),
        added_sugars: z.string().optional(),
        vitamin_a: z.string().optional(),
        vitamin_c: z.string().optional(),
        calcium: z.string().optional(),
        iron: z.string().optional(),
      })),
    }),
  }),
});

export type FatSecretFood = z.infer<typeof FatSecretFoodSchema>;
export type FatSecretSearchResponse = z.infer<typeof FatSecretSearchResponseSchema>;
export type FatSecretNutrition = z.infer<typeof FatSecretNutritionSchema>;

export interface NutrientInfo {
  calories: number;
  totalCarbs: number;
  protein: number;
  fiber: number;
  sugars: number;
  addedSugars: number;
  totalFat: number;
  saturatedFat: number;
  monoFat: number;
  polyFat: number;
  transFat: number;
  sodium: number;
}

export interface HealthScore {
  score: number;
  grade: string;
}

export class FatSecretService {
  private async getAccessToken(): Promise<string> {
    try {
      const credentials = Buffer.from(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`).toString('base64');
      
      const response = await fetch('https://oauth.fatsecret.com/connect/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials&scope=basic',
      });

      if (!response.ok) {
        throw new Error(`OAuth error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting FatSecret access token:', error);
      throw error;
    }
  }

  private async makeRequest(method: string, params: Record<string, any> = {}): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      
      const url = new URL(FATSECRET_BASE_URL);
      url.searchParams.append('method', method);
      url.searchParams.append('format', 'json');
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(`FatSecret API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('FatSecret API error response:', errorText);
        throw new Error(`FatSecret API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('FatSecret API request failed:', error);
      throw error;
    }
  }

  async searchFoods(query: string, maxResults: number = 25): Promise<FatSecretFood[]> {
    try {
      const data = await this.makeRequest('foods.search', {
        search_expression: query,
        max_results: maxResults,
      });

      console.log('FatSecret search response:', JSON.stringify(data, null, 2));

      const parsed = FatSecretSearchResponseSchema.parse(data);
      
      if (!parsed.foods?.food) {
        return [];
      }

      // Handle both array and single object responses
      const foods = Array.isArray(parsed.foods.food) ? parsed.foods.food : [parsed.foods.food];
      return foods;
    } catch (error) {
      console.error('Error searching FatSecret foods:', error);
      return [];
    }
  }

  async getFoodById(foodId: string): Promise<FatSecretNutrition | null> {
    try {
      const data = await this.makeRequest('food.get.v3', {
        food_id: foodId,
      });

      console.log('FatSecret nutrition response:', JSON.stringify(data, null, 2));

      return FatSecretNutritionSchema.parse(data);
    } catch (error) {
      console.error('Error getting FatSecret food by ID:', error);
      return null;
    }
  }

  extractNutrients(nutrition: FatSecretNutrition, servingIndex: number = 0): NutrientInfo {
    const servings = Array.isArray(nutrition.food.servings.serving) 
      ? nutrition.food.servings.serving 
      : [nutrition.food.servings.serving];
    
    const serving = servings[servingIndex] || servings[0];
    
    if (!serving) {
      return {
        calories: 0,
        totalCarbs: 0,
        protein: 0,
        fiber: 0,
        sugars: 0,
        addedSugars: 0,
        totalFat: 0,
        saturatedFat: 0,
        monoFat: 0,
        polyFat: 0,
        transFat: 0,
        sodium: 0,
      };
    }

    return {
      calories: parseFloat(serving.calories || '0'),
      totalCarbs: parseFloat(serving.carbohydrate || '0'),
      protein: parseFloat(serving.protein || '0'),
      fiber: parseFloat(serving.fiber || '0'),
      sugars: parseFloat(serving.sugar || '0'),
      addedSugars: parseFloat(serving.added_sugars || '0'),
      totalFat: parseFloat(serving.fat || '0'),
      saturatedFat: parseFloat(serving.saturated_fat || '0'),
      monoFat: parseFloat(serving.monounsaturated_fat || '0'),
      polyFat: parseFloat(serving.polyunsaturated_fat || '0'),
      transFat: parseFloat(serving.trans_fat || '0'),
      sodium: parseFloat(serving.sodium || '0'),
    };
  }

  calculateHealthScore(nutrients: NutrientInfo): HealthScore {
    let score = 100;
    
    // Penalize high calories (over 300 per serving)
    if (nutrients.calories > 300) {
      score -= Math.min(20, (nutrients.calories - 300) / 10);
    }
    
    // Penalize high saturated fat (over 5g)
    if (nutrients.saturatedFat > 5) {
      score -= Math.min(15, (nutrients.saturatedFat - 5) * 2);
    }
    
    // Penalize high sodium (over 400mg)
    if (nutrients.sodium > 400) {
      score -= Math.min(15, (nutrients.sodium - 400) / 50);
    }
    
    // Penalize high sugar (over 10g)
    if (nutrients.sugars > 10) {
      score -= Math.min(15, (nutrients.sugars - 10) * 1.5);
    }
    
    // Penalize trans fat heavily
    if (nutrients.transFat > 0) {
      score -= nutrients.transFat * 10;
    }
    
    // Bonus for high protein (over 10g)
    if (nutrients.protein > 10) {
      score += Math.min(10, (nutrients.protein - 10) * 0.5);
    }
    
    // Bonus for high fiber (over 3g)
    if (nutrients.fiber > 3) {
      score += Math.min(10, (nutrients.fiber - 3) * 2);
    }
    
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    // Convert to letter grade
    let grade: string;
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 85) grade = 'A-';
    else if (score >= 80) grade = 'B+';
    else if (score >= 75) grade = 'B';
    else if (score >= 70) grade = 'B-';
    else if (score >= 65) grade = 'C+';
    else if (score >= 60) grade = 'C';
    else if (score >= 55) grade = 'C-';
    else if (score >= 50) grade = 'D+';
    else if (score >= 45) grade = 'D';
    else if (score >= 40) grade = 'D-';
    else grade = 'F';
    
    return { score, grade };
  }

  async fuzzySearchFood(query: string): Promise<FatSecretFood[]> {
    try {
      const searchResults = await this.searchFoods(query, 10);
      return searchResults;
    } catch (error) {
      console.error('Error searching FatSecret foods:', error);
      return [];
    }
  }

  getBestServingForQuantity(nutrition: FatSecretNutrition, requestedQuantity: string, requestedUnit: string): {
    servingIndex: number;
    servingDescription: string;
    scaleFactor: number;
  } {
    const servings = Array.isArray(nutrition.food.servings.serving) 
      ? nutrition.food.servings.serving 
      : [nutrition.food.servings.serving];

    // Try to find exact unit match first
    let bestMatch = servings.findIndex(serving => 
      serving.measurement_description.toLowerCase().includes(requestedUnit.toLowerCase()) ||
      serving.metric_serving_unit?.toLowerCase() === requestedUnit.toLowerCase()
    );

    if (bestMatch === -1) {
      // Default to first serving if no unit match
      bestMatch = 0;
    }

    const serving = servings[bestMatch];
    const scaleFactor = parseFloat(requestedQuantity) || 1;

    return {
      servingIndex: bestMatch,
      servingDescription: serving.measurement_description,
      scaleFactor,
    };
  }
}

export const fatSecretService = new FatSecretService();