import { z } from "zod";

const USDA_API_KEY = process.env.USDA_API_KEY || "DEMO_KEY";
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

// USDA API Response Schemas
const USDANutrientSchema = z.object({
  nutrientId: z.number(),
  nutrientName: z.string(),
  nutrientNumber: z.string(),
  unitName: z.string(),
  value: z.number(),
});

const USDAFoodSchema = z.object({
  fdcId: z.number(),
  description: z.string(),
  brandOwner: z.string().optional(),
  brandName: z.string().optional(),
  ingredients: z.string().optional(),
  marketCountry: z.string().optional(),
  foodCategory: z.string().optional(),
  servingSize: z.number().optional(),
  servingSizeUnit: z.string().optional(),
  householdServingFullText: z.string().optional(),
  foodNutrients: z.array(USDANutrientSchema),
  gtinUpc: z.string().optional(), // Barcode
});

const USDASearchResponseSchema = z.object({
  totalHits: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
  foods: z.array(USDAFoodSchema),
});

export type USDAFood = z.infer<typeof USDAFoodSchema>;
export type USDASearchResponse = z.infer<typeof USDASearchResponseSchema>;
export type USDANutrient = z.infer<typeof USDANutrientSchema>;

// Nutrient ID mappings (USDA nutrient database IDs)
const NUTRIENT_IDS = {
  CALORIES: 1008,
  PROTEIN: 1003,
  TOTAL_FAT: 1004,
  SATURATED_FAT: 1258,
  TRANS_FAT: 1257,
  CHOLESTEROL: 1253,
  SODIUM: 1093,
  TOTAL_CARBS: 1005,
  FIBER: 1079,
  TOTAL_SUGARS: 2000,
  ADDED_SUGARS: 1235,
  VITAMIN_D: 1114,
  CALCIUM: 1087,
  IRON: 1089,
  POTASSIUM: 1092,
};

export interface StandardizedNutrition {
  calories: number;
  protein: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbs: number;
  fiber: number;
  totalSugars: number;
  addedSugars: number;
  vitaminD: number;
  calcium: number;
  iron: number;
  potassium: number;
}

export class USDAService {
  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(endpoint, USDA_BASE_URL);
    
    // Add API key to all requests
    params.api_key = USDA_API_KEY;
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    console.log(`USDA API Request: ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('USDA API request failed:', error);
      throw error;
    }
  }

  /**
   * Search for branded food products in USDA database
   */
  async searchBrandedFoods(query: string, pageSize: number = 50): Promise<USDAFood[]> {
    try {
      const data = await this.makeRequest('/foods/search', {
        query: query,
        dataType: ['Branded'], // Only branded foods (grocery products)
        pageSize: pageSize,
        sortBy: 'dataType.keyword',
        sortOrder: 'asc',
      });

      console.log(`USDA search for "${query}" returned ${data.totalHits} results`);
      
      const searchResponse = USDASearchResponseSchema.parse(data);
      return searchResponse.foods;
    } catch (error) {
      console.error(`Error searching USDA branded foods for "${query}":`, error);
      return [];
    }
  }

  /**
   * Get detailed food information by FDC ID
   */
  async getFoodById(fdcId: number): Promise<USDAFood | null> {
    try {
      const data = await this.makeRequest(`/food/${fdcId}`);
      return USDAFoodSchema.parse(data);
    } catch (error) {
      console.error(`Error getting USDA food by ID ${fdcId}:`, error);
      return null;
    }
  }

  /**
   * Search foods by barcode/UPC
   */
  async searchByBarcode(upc: string): Promise<USDAFood[]> {
    try {
      const data = await this.makeRequest('/foods/search', {
        query: upc,
        dataType: ['Branded'],
        pageSize: 10,
      });

      const searchResponse = USDASearchResponseSchema.parse(data);
      // Filter results to exact UPC matches
      return searchResponse.foods.filter(food => 
        food.gtinUpc === upc || food.gtinUpc === upc.padStart(12, '0')
      );
    } catch (error) {
      console.error(`Error searching USDA by barcode ${upc}:`, error);
      return [];
    }
  }

  /**
   * Extract and standardize nutrition data from USDA food object
   */
  extractNutrition(food: USDAFood): StandardizedNutrition {
    const nutrients = food.foodNutrients;
    
    const getNutrientValue = (nutrientId: number): number => {
      const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
      return nutrient?.value || 0;
    };

    return {
      calories: getNutrientValue(NUTRIENT_IDS.CALORIES),
      protein: getNutrientValue(NUTRIENT_IDS.PROTEIN),
      totalFat: getNutrientValue(NUTRIENT_IDS.TOTAL_FAT),
      saturatedFat: getNutrientValue(NUTRIENT_IDS.SATURATED_FAT),
      transFat: getNutrientValue(NUTRIENT_IDS.TRANS_FAT),
      cholesterol: getNutrientValue(NUTRIENT_IDS.CHOLESTEROL),
      sodium: getNutrientValue(NUTRIENT_IDS.SODIUM),
      totalCarbs: getNutrientValue(NUTRIENT_IDS.TOTAL_CARBS),
      fiber: getNutrientValue(NUTRIENT_IDS.FIBER),
      totalSugars: getNutrientValue(NUTRIENT_IDS.TOTAL_SUGARS),
      addedSugars: getNutrientValue(NUTRIENT_IDS.ADDED_SUGARS),
      vitaminD: getNutrientValue(NUTRIENT_IDS.VITAMIN_D),
      calcium: getNutrientValue(NUTRIENT_IDS.CALCIUM),
      iron: getNutrientValue(NUTRIENT_IDS.IRON),
      potassium: getNutrientValue(NUTRIENT_IDS.POTASSIUM),
    };
  }

  /**
   * Fuzzy search for foods with better matching
   */
  async fuzzySearchFood(query: string): Promise<USDAFood[]> {
    // Clean up query for better matching
    const cleanQuery = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    const results = await this.searchBrandedFoods(cleanQuery, 25);
    
    // Sort by relevance (exact brand matches first, then description matches)
    return results.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, cleanQuery);
      const bScore = this.calculateRelevanceScore(b, cleanQuery);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(food: USDAFood, query: string): number {
    let score = 0;
    const queryWords = query.split(' ');
    const description = food.description.toLowerCase();
    const brandName = (food.brandName || '').toLowerCase();
    
    // Exact brand name match gets highest score
    if (brandName && queryWords.some(word => brandName.includes(word))) {
      score += 100;
    }
    
    // Description word matches
    queryWords.forEach(word => {
      if (description.includes(word)) {
        score += 10;
      }
    });
    
    // Bonus for having serving size information
    if (food.servingSize && food.servingSizeUnit) {
      score += 5;
    }
    
    return score;
  }
}

export const usdaService = new USDAService();