import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles table for onboarding data
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  onboardingData: jsonb("onboarding_data").notNull(),
  personalizedPlan: jsonb("personalized_plan"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  profilePhotoUrl: varchar("profile_photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Schema for the onboarding data JSON structure
export const onboardingDataSchema = z.object({
  // Section 1: Basic Information
  name: z.string().optional(),
  sex: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  birthDate: z.string().optional(),
  
  // Section 2: Activity & Sleep
  activityDescription: z.string().optional(),
  sleepHours: z.string().optional(),
  equipmentAccess: z.string().optional(),
  
  // Section 3: Diet & Budget
  dietPreferences: z.string().optional(),
  weeklyBudget: z.string().optional(),
  
  // Section 4: Goals & Timeline
  goals: z.string().optional(),
  timeline: z.string().optional(),
  
  // Section 5: Availability & Constraints
  workoutDaysPerWeek: z.number().optional(),
  injuries: z.string().optional(),
  pastExperience: z.string().optional(),
  
  // Section 6: Coaching Style
  coachingStyle: z.string().optional(),
  personalityType: z.string().optional(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  onboardingData: onboardingDataSchema,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
