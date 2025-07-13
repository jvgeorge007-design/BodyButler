import {
  users,
  userProfiles,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, onboardingData: any): Promise<UserProfile | undefined>;
  savePersonalizedPlan(userId: string, personalizedPlan: any): Promise<UserProfile | undefined>;
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
}

export const storage = new DatabaseStorage();
