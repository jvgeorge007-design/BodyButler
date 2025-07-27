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

// Food logging and receipt parsing tables
export const parsedFoodLogs = pgTable("parsed_food_logs", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  establishment: varchar("establishment"),
  parsedItems: jsonb("parsed_items").notNull(), // Array of ParsedReceiptItem
  usdaMatches: jsonb("usda_matches"), // Array of matched USDA foods
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  sourceType: varchar("source_type").notNull(), // 'image' | 'text'
  createdAt: timestamp("created_at").defaultNow(),
});

// Global nutrition database - aggregated data from all users' receipt parsing
export const globalNutritionDatabase = pgTable("global_nutrition_database", {
  id: varchar("id").primaryKey().notNull(),
  
  // Food identification
  foodName: varchar("food_name").notNull(),
  brandName: varchar("brand_name"),
  establishment: varchar("establishment"), // Restaurant/store where this was purchased
  
  // Nutritional data per serving (averaged across all logs)
  avgCalories: decimal("avg_calories", { precision: 8, scale: 2 }),
  avgProtein: decimal("avg_protein", { precision: 8, scale: 2 }),
  avgTotalCarbs: decimal("avg_total_carbs", { precision: 8, scale: 2 }),
  avgFiber: decimal("avg_fiber", { precision: 8, scale: 2 }),
  avgSugars: decimal("avg_sugars", { precision: 8, scale: 2 }),
  avgTotalFat: decimal("avg_total_fat", { precision: 8, scale: 2 }),
  avgSaturatedFat: decimal("avg_saturated_fat", { precision: 8, scale: 2 }),
  avgSodium: decimal("avg_sodium", { precision: 8, scale: 2 }),
  
  // Health scoring (averaged)
  avgHealthScore: decimal("avg_health_score", { precision: 5, scale: 2 }),
  mostCommonHealthGrade: varchar("most_common_health_grade", { length: 2 }),
  
  // Demographic insights (anonymized aggregates)
  ageRangeBreakdown: jsonb("age_range_breakdown"), // {"18-25": 45, "26-35": 30, "36-50": 25}
  genderBreakdown: jsonb("gender_breakdown"), // {"male": 60, "female": 40}
  fitnessGoalBreakdown: jsonb("fitness_goal_breakdown"), // {"weight_loss": 40, "muscle_gain": 35, "maintenance": 25}
  activityLevelBreakdown: jsonb("activity_level_breakdown"), // {"sedentary": 20, "moderate": 50, "active": 30}
  
  // Geographic and temporal insights
  popularRegions: text("popular_regions").array(), // Where this food is commonly logged
  peakOrderTimes: text("peak_order_times").array(), // Time patterns when ordered
  seasonalTrends: jsonb("seasonal_trends"), // Monthly/seasonal ordering patterns
  weekdayVsWeekend: jsonb("weekday_vs_weekend"), // {"weekday": 70, "weekend": 30}
  mealTypeBreakdown: jsonb("meal_type_breakdown"), // {"breakfast": 10, "lunch": 40, "dinner": 35, "snacks": 15}
  
  // Establishment insights
  establishmentType: varchar("establishment_type"), // "fast-food", "restaurant", "coffee-shop", etc.
  avgEstablishmentHealthRating: decimal("avg_establishment_health_rating", { precision: 3, scale: 2 }),
  
  // Usage analytics
  timesLogged: integer("times_logged").default(1),
  uniqueUsers: integer("unique_users").default(1),
  dataSource: varchar("data_source").notNull(), // "receipt-parsing", "fatsecret", "manual"
  firstLoggedAt: timestamp("first_logged_at").notNull(),
  lastLoggedAt: timestamp("last_logged_at").notNull(),
  popularityRank: integer("popularity_rank"), // Ranking by times logged
  trendingScore: decimal("trending_score", { precision: 5, scale: 2 }), // Recent activity score
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const foodLogEntries = pgTable("food_log_entries", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fdcId: integer("fdc_id"), // Kept for backward compatibility
  foodName: varchar("food_name").notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  unit: varchar("unit").notNull(),
  mealType: varchar("meal_type").notNull(), // 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  loggedAt: timestamp("logged_at").notNull(),
  
  // Nutritional data (stored for quick access)
  calories: decimal("calories", { precision: 8, scale: 2 }),
  protein: decimal("protein", { precision: 8, scale: 2 }),
  totalCarbs: decimal("total_carbs", { precision: 8, scale: 2 }),
  fiber: decimal("fiber", { precision: 8, scale: 2 }),
  sugars: decimal("sugars", { precision: 8, scale: 2 }),
  addedSugars: decimal("added_sugars", { precision: 8, scale: 2 }),
  totalFat: decimal("total_fat", { precision: 8, scale: 2 }),
  saturatedFat: decimal("saturated_fat", { precision: 8, scale: 2 }),
  transFat: decimal("trans_fat", { precision: 8, scale: 2 }),
  sodium: decimal("sodium", { precision: 8, scale: 2 }),
  
  // Health scoring
  healthScore: decimal("health_score", { precision: 5, scale: 2 }),
  healthGrade: varchar("health_grade", { length: 2 }),
  
  // Source tracking
  sourceReceiptId: varchar("source_receipt_id").references(() => parsedFoodLogs.id),
  manualEntry: boolean("manual_entry").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ParsedFoodLog = typeof parsedFoodLogs.$inferSelect;
export type InsertParsedFoodLog = typeof parsedFoodLogs.$inferInsert;
export type FoodLogEntry = typeof foodLogEntries.$inferSelect;
export type InsertFoodLogEntry = typeof foodLogEntries.$inferInsert;
export type GlobalNutrition = typeof globalNutritionDatabase.$inferSelect;
export type InsertGlobalNutrition = typeof globalNutritionDatabase.$inferInsert;

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
