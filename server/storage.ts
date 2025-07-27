import {
  users,
  userProfiles,
  parsedFoodLogs,
  foodLogEntries,
  globalNutritionDatabase,
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
    fatSecretFoodId?: string;
    dataSource: string;
    loggedAt: Date;
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

      // Calculate weighted averages
      const updatedData = {
        calories: (((existing.calories ? parseFloat(existing.calories.toString()) : 0) * currentCount + data.calories) / newCount).toFixed(2),
        protein: (((existing.protein ? parseFloat(existing.protein.toString()) : 0) * currentCount + data.protein) / newCount).toFixed(2),
        totalCarbs: (((existing.totalCarbs ? parseFloat(existing.totalCarbs.toString()) : 0) * currentCount + data.totalCarbs) / newCount).toFixed(2),
        fiber: (((existing.fiber ? parseFloat(existing.fiber.toString()) : 0) * currentCount + data.fiber) / newCount).toFixed(2),
        sugars: (((existing.sugars ? parseFloat(existing.sugars.toString()) : 0) * currentCount + data.sugars) / newCount).toFixed(2),
        totalFat: (((existing.totalFat ? parseFloat(existing.totalFat.toString()) : 0) * currentCount + data.totalFat) / newCount).toFixed(2),
        saturatedFat: (((existing.saturatedFat ? parseFloat(existing.saturatedFat.toString()) : 0) * currentCount + data.saturatedFat) / newCount).toFixed(2),
        sodium: (((existing.sodium ? parseFloat(existing.sodium.toString()) : 0) * currentCount + data.sodium) / newCount).toFixed(2),
        healthScore: (((existing.healthScore ? parseFloat(existing.healthScore.toString()) : 0) * currentCount + data.healthScore) / newCount).toFixed(2),
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
        calories: data.calories.toString(),
        protein: data.protein.toString(),
        totalCarbs: data.totalCarbs.toString(),
        fiber: data.fiber.toString(),
        sugars: data.sugars.toString(),
        totalFat: data.totalFat.toString(),
        saturatedFat: data.saturatedFat.toString(),
        sodium: data.sodium.toString(),
        healthScore: data.healthScore.toString(),
        healthGrade: data.healthGrade,
        timesLogged: 1,
        uniqueUsers: 1,
        dataSource: data.dataSource,
        firstLoggedAt: data.loggedAt,
        lastLoggedAt: data.loggedAt,
        firstLoggedByUserId: 'anonymous',
      });
    }
  }
}

export const storage = new DatabaseStorage();
