import {
  users,
  userProfiles,
  parsedFoodLogs,
  foodLogEntries,
  customNutritionDatabase,
  userFoodPatterns,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type ParsedFoodLog,
  type InsertParsedFoodLog,
  type FoodLogEntry,
  type InsertFoodLogEntry,
  type GlobalNutrition,
  type InsertGlobalNutrition,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, onboardingData: any): Promise<UserProfile | undefined>;
  savePersonalizedPlan(userId: string, personalizedPlan: any): Promise<UserProfile | undefined>;
  
  // Food logging operations
  createParsedFoodLog(log: InsertParsedFoodLog): Promise<ParsedFoodLog>;
  getParsedFoodLogById(id: string): Promise<ParsedFoodLog | undefined>;
  createFoodLogEntry(entry: InsertFoodLogEntry): Promise<FoodLogEntry>;
  getFoodLogEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<FoodLogEntry[]>;
  getFoodLogEntriesByMeal(userId: string, date: Date, mealType: string): Promise<FoodLogEntry[]>;
  getFoodLogEntryById(id: string): Promise<FoodLogEntry | undefined>;
  deleteFoodLogEntry(id: string): Promise<void>;
  
  // Global nutrition database operations
  addToGlobalNutritionDatabase(data: {
    foodName: string;
    brandName?: string | null;
    establishment?: string | null;
    calories: number;
    protein: number;
    totalCarbs: number;
    fiber: number;
    sugars: number;
    totalFat: number;
    saturatedFat: number;
    sodium: number;
    healthScore: number;
    healthGrade: string;
    fatSecretFoodId?: string;
    dataSource: string;
    loggedAt: Date;
    // Demographics (anonymized from user profile)
    userAgeRange?: string; // "18-25", "26-35", etc.
    userGender?: string;
    userFitnessGoals?: string;
    userActivityLevel?: string;
    mealType: string;
  }): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [newProfile] = await db
      .insert(userProfiles)
      .values({ ...profile, id })
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, onboardingData: any): Promise<UserProfile | undefined> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ onboardingData, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  async savePersonalizedPlan(userId: string, personalizedPlan: any): Promise<UserProfile | undefined> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({ 
        personalizedPlan, 
        onboardingCompleted: true,
        updatedAt: new Date() 
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Food logging operations
  async createParsedFoodLog(log: InsertParsedFoodLog): Promise<ParsedFoodLog> {
    const [newLog] = await db
      .insert(parsedFoodLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getParsedFoodLogById(id: string): Promise<ParsedFoodLog | undefined> {
    const [log] = await db.select().from(parsedFoodLogs).where(eq(parsedFoodLogs.id, id));
    return log;
  }

  async createFoodLogEntry(entry: InsertFoodLogEntry): Promise<FoodLogEntry> {
    const [newEntry] = await db
      .insert(foodLogEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getFoodLogEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<FoodLogEntry[]> {
    return await db
      .select()
      .from(foodLogEntries)
      .where(
        and(
          eq(foodLogEntries.userId, userId),
          gte(foodLogEntries.loggedAt, startDate),
          lte(foodLogEntries.loggedAt, endDate)
        )
      );
  }

  async getFoodLogEntriesByMeal(userId: string, date: Date, mealType: string): Promise<FoodLogEntry[]> {
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    return await db
      .select()
      .from(foodLogEntries)
      .where(
        and(
          eq(foodLogEntries.userId, userId),
          eq(foodLogEntries.mealType, mealType),
          gte(foodLogEntries.loggedAt, startOfDay),
          lte(foodLogEntries.loggedAt, endOfDay)
        )
      );
  }

  async getFoodLogEntryById(id: string): Promise<FoodLogEntry | undefined> {
    const [entry] = await db.select().from(foodLogEntries).where(eq(foodLogEntries.id, id));
    return entry;
  }

  async deleteFoodLogEntry(id: string): Promise<void> {
    await db.delete(foodLogEntries).where(eq(foodLogEntries.id, id));
  }

  // Global nutrition database operations
  async addToGlobalNutritionDatabase(data: {
    foodName: string;
    brandName?: string | null;
    establishment?: string | null;
    calories: number;
    protein: number;
    totalCarbs: number;
    fiber: number;
    sugars: number;
    totalFat: number;
    saturatedFat: number;
    sodium: number;
    healthScore: number;
    healthGrade: string;
    dataSource: string;
    loggedAt: Date;
    userAgeRange?: string;
    userGender?: string;
    userFitnessGoals?: string;
    userActivityLevel?: string;
    mealType: string;
  }): Promise<void> {
    // Check if this food item already exists in global database
    const existingEntry = await db
      .select()
      .from(globalNutritionDatabase)
      .where(
        and(
          eq(globalNutritionDatabase.foodName, data.foodName),
          eq(globalNutritionDatabase.brandName, data.brandName || null),
          eq(globalNutritionDatabase.establishment, data.establishment || null)
        )
      )
      .limit(1);

    if (existingEntry.length > 0) {
      // Update existing entry - increment times logged and update averages
      const existing = existingEntry[0];
      const currentCount = existing.timesLogged || 1;
      const newCount = currentCount + 1;

      // Calculate weighted averages for nutrition
      const updatedData = {
        avgCalories: (((existing.avgCalories ? parseFloat(existing.avgCalories.toString()) : 0) * currentCount + data.calories) / newCount).toFixed(2),
        avgProtein: (((existing.avgProtein ? parseFloat(existing.avgProtein.toString()) : 0) * currentCount + data.protein) / newCount).toFixed(2),
        avgTotalCarbs: (((existing.avgTotalCarbs ? parseFloat(existing.avgTotalCarbs.toString()) : 0) * currentCount + data.totalCarbs) / newCount).toFixed(2),
        avgFiber: (((existing.avgFiber ? parseFloat(existing.avgFiber.toString()) : 0) * currentCount + data.fiber) / newCount).toFixed(2),
        avgSugars: (((existing.avgSugars ? parseFloat(existing.avgSugars.toString()) : 0) * currentCount + data.sugars) / newCount).toFixed(2),
        avgTotalFat: (((existing.avgTotalFat ? parseFloat(existing.avgTotalFat.toString()) : 0) * currentCount + data.totalFat) / newCount).toFixed(2),
        avgSaturatedFat: (((existing.avgSaturatedFat ? parseFloat(existing.avgSaturatedFat.toString()) : 0) * currentCount + data.saturatedFat) / newCount).toFixed(2),
        avgSodium: (((existing.avgSodium ? parseFloat(existing.avgSodium.toString()) : 0) * currentCount + data.sodium) / newCount).toFixed(2),
        avgHealthScore: (((existing.avgHealthScore ? parseFloat(existing.avgHealthScore.toString()) : 0) * currentCount + data.healthScore) / newCount).toFixed(2),
        
        // Update demographic breakdowns
        ageRangeBreakdown: this.updateDemographicBreakdown(existing.ageRangeBreakdown as any, data.userAgeRange),
        genderBreakdown: this.updateDemographicBreakdown(existing.genderBreakdown as any, data.userGender),
        fitnessGoalBreakdown: this.updateDemographicBreakdown(existing.fitnessGoalBreakdown as any, data.userFitnessGoals),
        activityLevelBreakdown: this.updateDemographicBreakdown(existing.activityLevelBreakdown as any, data.userActivityLevel),
        mealTypeBreakdown: this.updateDemographicBreakdown(existing.mealTypeBreakdown as any, data.mealType),
        
        // Update temporal data
        weekdayVsWeekend: this.updateWeekdayWeekendBreakdown(existing.weekdayVsWeekend as any, data.loggedAt),
        
        timesLogged: newCount,
        uniqueUsers: existing.uniqueUsers ? existing.uniqueUsers + 1 : 2,
        lastLoggedAt: data.loggedAt,
        updatedAt: new Date(),
      };

      await db
        .update(globalNutritionDatabase)
        .set(updatedData)
        .where(eq(globalNutritionDatabase.id, existing.id));
    } else {
      // Create new entry in global database
      const globalId = `global_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(globalNutritionDatabase).values({
        id: globalId,
        foodName: data.foodName,
        brandName: data.brandName,
        establishment: data.establishment,
        fatSecretFoodId: data.fatSecretFoodId || null,
        
        // Initial nutrition averages
        avgCalories: data.calories.toString(),
        avgProtein: data.protein.toString(),
        avgTotalCarbs: data.totalCarbs.toString(),
        avgFiber: data.fiber.toString(),
        avgSugars: data.sugars.toString(),
        avgTotalFat: data.totalFat.toString(),
        avgSaturatedFat: data.saturatedFat.toString(),
        avgSodium: data.sodium.toString(),
        avgHealthScore: data.healthScore.toString(),
        mostCommonHealthGrade: data.healthGrade,
        
        // Initial demographic breakdowns
        ageRangeBreakdown: data.userAgeRange ? { [data.userAgeRange]: 1 } : {},
        genderBreakdown: data.userGender ? { [data.userGender]: 1 } : {},
        fitnessGoalBreakdown: data.userFitnessGoals ? { [data.userFitnessGoals]: 1 } : {},
        activityLevelBreakdown: data.userActivityLevel ? { [data.userActivityLevel]: 1 } : {},
        mealTypeBreakdown: { [data.mealType]: 1 },
        weekdayVsWeekend: this.getInitialWeekdayBreakdown(data.loggedAt),
        
        // Initial analytics
        timesLogged: 1,
        uniqueUsers: 1,
        dataSource: data.dataSource,
        firstLoggedAt: data.loggedAt,
        lastLoggedAt: data.loggedAt,
        establishmentType: this.categorizeEstablishment(data.establishment),
      });
    }
  }

  private updateDemographicBreakdown(existing: any, newValue?: string): any {
    if (!newValue) return existing || {};
    
    const breakdown = existing || {};
    breakdown[newValue] = (breakdown[newValue] || 0) + 1;
    return breakdown;
  }

  private updateWeekdayWeekendBreakdown(existing: any, date: Date): any {
    const breakdown = existing || { weekday: 0, weekend: 0 };
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    if (isWeekend) {
      breakdown.weekend = (breakdown.weekend || 0) + 1;
    } else {
      breakdown.weekday = (breakdown.weekday || 0) + 1;
    }
    
    return breakdown;
  }

  private getInitialWeekdayBreakdown(date: Date): any {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return isWeekend ? { weekend: 1, weekday: 0 } : { weekday: 1, weekend: 0 };
  }

  private categorizeEstablishment(establishment?: string | null): string | null {
    if (!establishment) return null;
    
    const lower = establishment.toLowerCase();
    const fastFoodChains = ['mcdonald', 'burger king', 'taco bell', 'kfc', 'subway', 'wendy'];
    const coffeeChains = ['starbucks', 'dunkin', 'coffee'];
    const pizzaChains = ['pizza hut', 'domino', 'papa john'];
    
    if (fastFoodChains.some(chain => lower.includes(chain))) return 'fast-food';
    if (coffeeChains.some(chain => lower.includes(chain))) return 'coffee-shop';
    if (pizzaChains.some(chain => lower.includes(chain))) return 'pizza';
    
    return 'restaurant';
  }
}

export const storage = new DatabaseStorage();
