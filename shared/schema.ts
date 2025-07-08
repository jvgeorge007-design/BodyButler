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
  name: varchar("name"),
  sex: varchar("sex"),
  height: varchar("height"),
  weight: varchar("weight"),
  birthDate: timestamp("birth_date"),
  activityDescription: text("activity_description"),
  sleepHours: integer("sleep_hours"),
  equipmentAccess: text("equipment_access").array(),
  dietPreferences: text("diet_preferences"),
  weeklyBudget: decimal("weekly_budget"),
  goals: text("goals"),
  timeline: varchar("timeline"),
  workoutDaysPerWeek: integer("workout_days_per_week"),
  injuries: text("injuries"),
  pastExperience: text("past_experience"),
  coachingStyle: text("coaching_style"),
  personalityType: varchar("personality_type"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  profilePhotoUrl: varchar("profile_photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
