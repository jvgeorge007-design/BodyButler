import { storage } from "../storage.js";
import type { InsertGlobalFood, InsertReceiptInsight, GlobalFood, ReceiptInsight } from "../../shared/schema.js";
import type { FatSecretFood, FatSecretNutrition } from "./fatSecretApi.js";

export class GlobalFoodDatabaseService {
  
  /**
   * Add or update food item in global database from FatSecret data
   */
  async addOrUpdateGlobalFood(
    fatSecretFood: FatSecretFood,
    fatSecretNutrition: FatSecretNutrition,
    dataSource: "fatsecret" | "receipt-parsing" | "manual" = "fatsecret"
  ): Promise<string> {
    // Check if food already exists by FatSecret ID
    const existingFood = await storage.getGlobalFoodByFatSecretId(fatSecretFood.food_id);
    
    const foodData: Partial<InsertGlobalFood> = {
      foodName: fatSecretFood.food_name,
      brandName: fatSecretFood.brand_name || null,
      description: fatSecretFood.food_description || null,
      category: this.categorizeFood(fatSecretFood),
      fatSecretFoodId: fatSecretFood.food_id,
      dataSource,
      
      // Convert nutrition data to per 100g basis
      caloriesPer100g: this.convertToPer100g(fatSecretNutrition.food.servings.serving[0]?.calories, fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount),
      proteinPer100g: this.convertToPer100g(fatSecretNutrition.food.servings.serving[0]?.protein, fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount),
      totalCarbsPer100g: this.convertToPer100g(fatSecretNutrition.food.servings.serving[0]?.carbohydrate, fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount),
      fiberPer100g: this.convertToPer100g(fatSecretNutrition.food.servings.serving[0]?.fiber, fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount),
      sugarsPer100g: this.convertToPer100g(fatSecretNutrition.food.servings.serving[0]?.sugar, fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount),
      totalFatPer100g: this.convertToPer100g(fatSecretNutrition.food.servings.serving[0]?.fat, fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount),
      saturatedFatPer100g: this.convertToPer100g(fatSecretNutrition.food.servings.serving[0]?.saturated_fat, fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount),
      sodiumPer100g: this.convertToPer100g(fatSecretNutrition.food.servings.serving[0]?.sodium, fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount),
      
      // Serving information
      typicalServingSize: parseFloat(fatSecretNutrition.food.servings.serving[0]?.metric_serving_amount || "100"),
      typicalServingUnit: fatSecretNutrition.food.servings.serving[0]?.metric_serving_unit || "g",
      
      // Update tracking
      timesLogged: existingFood ? (existingFood.timesLogged || 0) + 1 : 1,
      lastLoggedAt: new Date(),
      confidence: "0.9", // High confidence for FatSecret data
    };

    if (existingFood) {
      // Update existing food
      await storage.updateGlobalFood(existingFood.id, foodData);
      return existingFood.id;
    } else {
      // Create new food entry
      const globalFoodId = `global_food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await storage.createGlobalFood({
        id: globalFoodId,
        ...foodData as InsertGlobalFood,
      });
      return globalFoodId;
    }
  }

  /**
   * Add receipt parsing insight to track establishment and menu items
   */
  async addReceiptParsingInsight(
    establishmentName: string,
    menuItemName: string,
    nutritionData: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      healthScore: number;
    },
    userId: string,
    location?: string,
    price?: number
  ): Promise<string> {
    // Check if this establishment + menu item combination exists
    const existingInsight = await storage.getReceiptInsightByEstablishmentAndItem(
      establishmentName,
      menuItemName
    );

    if (existingInsight) {
      // Update existing insight with aggregated data
      const newTotalOrders = (existingInsight.totalOrders || 0) + 1;
      const updatedData = {
        // Update averages using weighted calculation
        avgCalories: this.calculateWeightedAverage(
          existingInsight.avgCalories,
          nutritionData.calories,
          existingInsight.totalOrders || 0
        ),
        avgProtein: this.calculateWeightedAverage(
          existingInsight.avgProtein,
          nutritionData.protein,
          existingInsight.totalOrders || 0
        ),
        avgCarbs: this.calculateWeightedAverage(
          existingInsight.avgCarbs,
          nutritionData.carbs,
          existingInsight.totalOrders || 0
        ),
        avgFat: this.calculateWeightedAverage(
          existingInsight.avgFat,
          nutritionData.fat,
          existingInsight.totalOrders || 0
        ),
        avgHealthScore: this.calculateWeightedAverage(
          existingInsight.avgHealthScore,
          nutritionData.healthScore,
          existingInsight.totalOrders || 0
        ),
        
        // Update price if provided
        averagePrice: price ? this.calculateWeightedAverage(
          existingInsight.averagePrice,
          price,
          existingInsight.totalOrders || 0
        ) : existingInsight.averagePrice,
        
        // Update tracking
        totalOrders: newTotalOrders,
        lastSeenAt: new Date(),
        
        // Add location to popular regions if not already there
        popularRegions: location && !existingInsight.popularRegions?.includes(location)
          ? [...(existingInsight.popularRegions || []), location]
          : existingInsight.popularRegions,
      };

      await storage.updateReceiptInsight(existingInsight.id, updatedData);
      return existingInsight.id;
    } else {
      // Create new insight
      const insightId = `receipt_insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newInsight: InsertReceiptInsight = {
        id: insightId,
        establishmentName,
        establishmentType: this.categorizeEstablishment(establishmentName),
        location: location || null,
        menuItemName,
        menuItemCategory: this.categorizeMenuItem(menuItemName),
        averagePrice: price ? price.toString() : null,
        
        // Initial nutritional data
        avgCalories: nutritionData.calories.toString(),
        avgProtein: nutritionData.protein.toString(),
        avgCarbs: nutritionData.carbs.toString(),
        avgFat: nutritionData.fat.toString(),
        avgHealthScore: nutritionData.healthScore.toString(),
        
        // Initial tracking
        totalOrders: 1,
        uniqueUsers: 1,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        popularRegions: location ? [location] : [],
        peakOrderTimes: [this.getCurrentTimeSlot()],
      };

      await storage.createReceiptInsight(newInsight);
      return insightId;
    }
  }

  /**
   * Get popular foods across all users
   */
  async getPopularFoods(limit: number = 50): Promise<GlobalFood[]> {
    return await storage.getPopularGlobalFoods(limit);
  }

  /**
   * Get establishment insights for analytics
   */
  async getEstablishmentInsights(establishmentName?: string): Promise<ReceiptInsight[]> {
    return await storage.getReceiptInsights(establishmentName);
  }

  /**
   * Search global food database
   */
  async searchGlobalFoods(query: string, limit: number = 10): Promise<GlobalFood[]> {
    return await storage.searchGlobalFoods(query, limit);
  }

  // Helper methods
  private convertToPer100g(value: string | undefined, servingAmount: string | undefined): string | null {
    if (!value || !servingAmount) return null;
    const val = parseFloat(value);
    const serving = parseFloat(servingAmount);
    if (isNaN(val) || isNaN(serving) || serving === 0) return null;
    return ((val / serving) * 100).toFixed(2);
  }

  private categorizeFood(food: FatSecretFood): string {
    const name = food.food_name.toLowerCase();
    const brand = food.brand_name?.toLowerCase() || "";
    
    // Fast food chains
    const fastFoodBrands = ["mcdonald", "burger king", "taco bell", "kfc", "subway", "wendy", "pizza hut"];
    if (fastFoodBrands.some(brand_name => brand.includes(brand_name))) {
      return "fast-food";
    }
    
    // Restaurant items
    if (brand.includes("restaurant") || name.includes("grilled") || name.includes("sauteed")) {
      return "restaurant";
    }
    
    // Packaged foods
    if (food.food_type === "Brand") {
      return "packaged";
    }
    
    return "generic";
  }

  private categorizeEstablishment(name: string): string {
    const lower = name.toLowerCase();
    
    if (["mcdonald", "burger king", "taco bell", "kfc", "subway", "wendy"].some(chain => lower.includes(chain))) {
      return "fast-food";
    }
    if (["starbucks", "dunkin", "coffee"].some(term => lower.includes(term))) {
      return "coffee-shop";
    }
    if (["pizza hut", "domino", "papa john"].some(chain => lower.includes(chain))) {
      return "pizza";
    }
    
    return "restaurant";
  }

  private categorizeMenuItem(name: string): string {
    const lower = name.toLowerCase();
    
    if (["burger", "sandwich", "wrap", "bowl", "salad", "pizza"].some(term => lower.includes(term))) {
      return "entree";
    }
    if (["fries", "chips", "side", "appetizer"].some(term => lower.includes(term))) {
      return "side";
    }
    if (["drink", "soda", "coffee", "tea", "juice", "water"].some(term => lower.includes(term))) {
      return "beverage";
    }
    if (["dessert", "cookie", "cake", "ice cream"].some(term => lower.includes(term))) {
      return "dessert";
    }
    
    return "entree"; // Default
  }

  private calculateWeightedAverage(
    currentAvg: string | null,
    newValue: number,
    currentCount: number
  ): string {
    if (!currentAvg || currentCount === 0) {
      return newValue.toString();
    }
    
    const current = parseFloat(currentAvg);
    const weighted = ((current * currentCount) + newValue) / (currentCount + 1);
    return weighted.toFixed(2);
  }

  private getCurrentTimeSlot(): string {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 18) return "afternoon";
    return "dinner";
  }
}

export const globalFoodDatabaseService = new GlobalFoodDatabaseService();