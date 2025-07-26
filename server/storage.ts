import {
  users,
  userProfiles,
  parsedFoodLogs,
  foodLogEntries,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type ParsedFoodLog,
  type InsertParsedFoodLog,
  type FoodLogEntry,
  type InsertFoodLogEntry,
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
  getParsedFoodLog(id: string): Promise<ParsedFoodLog | undefined>;
  createFoodLogEntry(entry: InsertFoodLogEntry): Promise<FoodLogEntry>;
  getFoodLogEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<FoodLogEntry[]>;
  getFoodLogEntriesByMeal(userId: string, date: Date, mealType: string): Promise<FoodLogEntry[]>;
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

  async getParsedFoodLog(id: string): Promise<ParsedFoodLog | undefined> {
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
}

export const storage = new DatabaseStorage();
