import { z } from 'zod';

const USDA_API_KEY = '2tVbJfcgadPxWhwe2ulXqWomH61uaDHLn3fcqIDW';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// USDA API response schemas
const USDANutrientSchema = z.object({
  nutrientId: z.number(),
  nutrientName: z.string(),
  value: z.number(),
  unitName: z.string(),
});

const USDALabelNutrientSchema = z.object({
  calories: z.object({ value: z.number() }).optional(),
  carbohydrates: z.object({ value: z.number() }).optional(),
  protein: z.object({ value: z.number() }).optional(),
  fiber: z.object({ value: z.number() }).optional(),
  sugars: z.object({ value: z.number() }).optional(),
  addedSugars: z.object({ value: z.number() }).optional(),
  fat: z.object({ value: z.number() }).optional(),
  saturatedFat: z.object({ value: z.number() }).optional(),
  transFat: z.object({ value: z.number() }).optional(),
  sodium: z.object({ value: z.number() }).optional(),
});

const USDAFoodSchema = z.object({
  fdcId: z.number(),
  description: z.string(),
  dataType: z.string(),
  brandName: z.string().optional(),
  brandOwner: z.string().optional(),
  servingSize: z.number().optional(),
  servingSizeUnit: z.string().optional(),
  labelNutrients: USDALabelNutrientSchema.optional(),
  foodNutrients: z.array(USDANutrientSchema).optional(),
});

const USDASearchResponseSchema = z.object({
  foods: z.array(USDAFoodSchema),
  totalHits: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
});

export type USDAFood = z.infer<typeof USDAFoodSchema>;
export type USDASearchResponse = z.infer<typeof USDASearchResponseSchema>;

// Nutrient ID constants for foundation foods
const NUTRIENT_IDS = {
  CALORIES: 1008,
  CARBS: 1005,
  PROTEIN: 1003,
  FIBER: 1079,
  SUGARS: 2000,
  ADDED_SUGARS: 1235,
  TOTAL_FAT: 1004,
  SATURATED_FAT: 1258,
  MONO_FAT: 1292,
  POLY_FAT: 1293,
  TRANS_FAT: 1257,
  SODIUM: 1093,
};

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

export class USDAService {
  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    try {
      const url = new URL(`${USDA_BASE_URL}${endpoint}`);
      url.searchParams.append('api_key', USDA_API_KEY);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(url.toString());
      if (!response.ok) {
        console.error(`USDA API error: ${response.status} ${response.statusText}`);
        // Return empty results instead of throwing for API errors
        return { foods: [] };
      }

      return response.json();
    } catch (error) {
      console.error('USDA API request failed:', error);
      // Return empty results for network errors
      return { foods: [] };
    }
  }

  async searchFoods(query: string, pageSize: number = 25): Promise<USDASearchResponse> {
    const data = await this.makeRequest('/foods/search', {
      query,
      pageSize,
      sortBy: 'dataType.keyword',
      sortOrder: 'asc'
    });

    return USDASearchResponseSchema.parse(data);
  }

  async getFoodById(fdcId: number): Promise<USDAFood> {
    const data = await this.makeRequest(`/food/${fdcId}`);
    return USDAFoodSchema.parse(data);
  }

  async getFoodsByIds(fdcIds: number[]): Promise<USDAFood[]> {
    const data = await this.makeRequest('/foods', {
      fdcIds: fdcIds.join(',')
    });

    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format from USDA API');
    }

    return data.map(food => USDAFoodSchema.parse(food));
  }

  extractNutrients(food: USDAFood): NutrientInfo {
    // Branded food — use labelNutrients
    if (food.labelNutrients) {
      const ln = food.labelNutrients;
      return {
        calories: ln.calories?.value || 0,
        totalCarbs: ln.carbohydrates?.value || 0,
        protein: ln.protein?.value || 0,
        fiber: ln.fiber?.value || 0,
        sugars: ln.sugars?.value || 0,
        addedSugars: ln.addedSugars?.value || 0,
        totalFat: ln.fat?.value || 0,
        saturatedFat: ln.saturatedFat?.value || 0,
        monoFat: 0, // Not available in labelNutrients
        polyFat: 0, // Not available in labelNutrients
        transFat: ln.transFat?.value || 0,
        sodium: ln.sodium?.value || 0,
      };
    }

    // Foundation/survey foods — use foodNutrients
    if (food.foodNutrients) {
      const getNutrient = (nutrientId: number): number => {
        const nutrient = food.foodNutrients?.find(n => n.nutrientId === nutrientId);
        return nutrient?.value || 0;
      };

      const totalCarbs = getNutrient(NUTRIENT_IDS.CARBS);
      const fiber = getNutrient(NUTRIENT_IDS.FIBER);
      const sugars = getNutrient(NUTRIENT_IDS.SUGARS);

      return {
        calories: getNutrient(NUTRIENT_IDS.CALORIES),
        totalCarbs: totalCarbs || (fiber + sugars), // Fallback calculation
        protein: getNutrient(NUTRIENT_IDS.PROTEIN),
        fiber,
        sugars,
        addedSugars: getNutrient(NUTRIENT_IDS.ADDED_SUGARS),
        totalFat: getNutrient(NUTRIENT_IDS.TOTAL_FAT),
        saturatedFat: getNutrient(NUTRIENT_IDS.SATURATED_FAT),
        monoFat: getNutrient(NUTRIENT_IDS.MONO_FAT),
        polyFat: getNutrient(NUTRIENT_IDS.POLY_FAT),
        transFat: getNutrient(NUTRIENT_IDS.TRANS_FAT),
        sodium: getNutrient(NUTRIENT_IDS.SODIUM),
      };
    }

    // Return zeros if no nutrient data
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

  calculateHealthScore(nutrients: NutrientInfo): HealthScore {
    let score = 100;
    const { sugars, addedSugars, sodium, fiber, protein, totalFat, saturatedFat, transFat, monoFat, polyFat } = nutrients;

    // Sugars penalty
    if (sugars > 10) score -= 15;
    else if (sugars > 5) score -= 10;

    if (addedSugars > 5) score -= 10;

    // Sodium penalty
    if (sodium > 600) score -= 10;
    else if (sodium > 300) score -= 5;

    // Fiber bonus (carb quality)
    if (fiber < 2) score -= (2 - fiber) * 5;

    // Protein bonus
    if (protein > 20) score += 10;
    else if (protein > 10) score += 5;

    // Fat quality scoring
    if (totalFat > 35) score -= 5;

    if (totalFat > 0) {
      const satRatio = saturatedFat / totalFat;
      if (satRatio > 0.5) score -= 10;
    }

    if (transFat > 0) score -= 10;

    if (monoFat + polyFat >= saturatedFat) score += 5;

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(score, 100));

    return {
      score,
      grade: this.convertScoreToGrade(score)
    };
  }

  private convertScoreToGrade(score: number): string {
    if (score >= 97) return "A+";
    if (score >= 93) return "A";
    if (score >= 90) return "A−";
    if (score >= 87) return "B+";
    if (score >= 83) return "B";
    if (score >= 80) return "B−";
    if (score >= 77) return "C+";
    if (score >= 73) return "C";
    if (score >= 70) return "C−";
    if (score >= 60) return "D";
    return "F";
  }

  async fuzzySearchFood(query: string): Promise<USDAFood[]> {
    try {
      const searchResponse = await this.searchFoods(query, 10);
      return searchResponse.foods;
    } catch (error) {
      console.error('Error searching USDA foods:', error);
      return [];
    }
  }
}

export const usdaService = new USDAService();