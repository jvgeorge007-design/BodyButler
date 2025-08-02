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

// Custom nutrition database - our own comprehensive food database
export const customNutritionDatabase = pgTable("custom_nutrition_database", {
  id: varchar("id").primaryKey().notNull(),
  
  // Food identification
  foodName: varchar("food_name").notNull(),
  brandName: varchar("brand_name"),
  brandOwner: varchar("brand_owner"), // Company that owns the brand
  category: varchar("category"), // "dairy", "meat", "snacks", etc.
  
  // Product identification
  upcBarcode: varchar("upc_barcode"), // For grocery products
  usdaFdcId: integer("usda_fdc_id"), // USDA reference ID
  restaurantChain: varchar("restaurant_chain"), // For restaurant items
  
  // Serving information
  servingSize: decimal("serving_size", { precision: 8, scale: 2 }),
  servingSizeUnit: varchar("serving_size_unit"), // "g", "ml", "cup", "piece"
  householdServing: varchar("household_serving"), // "1 cup", "1 slice", etc.
  
  // Nutritional data per serving
  calories: decimal("calories", { precision: 8, scale: 2 }).notNull(),
  protein: decimal("protein", { precision: 8, scale: 2 }).notNull(),
  totalFat: decimal("total_fat", { precision: 8, scale: 2 }).notNull(),
  saturatedFat: decimal("saturated_fat", { precision: 8, scale: 2 }),
  transFat: decimal("trans_fat", { precision: 8, scale: 2 }),
  cholesterol: decimal("cholesterol", { precision: 8, scale: 2 }),
  sodium: decimal("sodium", { precision: 8, scale: 2 }),
  totalCarbs: decimal("total_carbs", { precision: 8, scale: 2 }).notNull(),
  fiber: decimal("fiber", { precision: 8, scale: 2 }),
  totalSugars: decimal("total_sugars", { precision: 8, scale: 2 }),
  addedSugars: decimal("added_sugars", { precision: 8, scale: 2 }),
  
  // Additional nutrients
  vitaminD: decimal("vitamin_d", { precision: 8, scale: 2 }),
  calcium: decimal("calcium", { precision: 8, scale: 2 }),
  iron: decimal("iron", { precision: 8, scale: 2 }),
  potassium: decimal("potassium", { precision: 8, scale: 2 }),
  
  // Ingredients and allergens
  ingredients: text("ingredients"),
  allergens: text("allergens").array(),
  
  // Data source and quality
  dataSource: varchar("data_source").notNull(), // "usda", "restaurant", "manual", "grocery-api"
  dataQuality: varchar("data_quality").default("verified"), // "verified", "estimated", "user-submitted"
  lastVerified: timestamp("last_verified"),
  
  // Search optimization
  searchTokens: text("search_tokens").array(), // For fuzzy matching
  popularity: integer("popularity").default(0), // How often this food is logged
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User analytics table (no nutrition data - just food choices and patterns)
export const userFoodPatterns = pgTable("user_food_patterns", {
  id: varchar("id").primaryKey().notNull(),
  
  // Food identification (no nutrition data)
  foodId: varchar("food_id").notNull().references(() => customNutritionDatabase.id),
  foodName: varchar("food_name").notNull(),
  brandName: varchar("brand_name"),
  establishment: varchar("establishment"),
  
  // User context (anonymized demographics only)
  userAgeRange: varchar("user_age_range"), // "25-34"
  userGender: varchar("user_gender"), // "male", "female", "other"
  userFitnessGoals: text("user_fitness_goals").array(), // ["weight_loss", "muscle_building"]
  userActivityLevel: varchar("user_activity_level"), // "sedentary", "moderate", "active"
  
  // Temporal and contextual patterns
  mealType: varchar("meal_type").notNull(), // "breakfast", "lunch", "dinner", "snacks"
  loggedAt: timestamp("logged_at").notNull(),
  dayOfWeek: integer("day_of_week"), // 1-7
  isWeekend: boolean("is_weekend"),
  timeOfDay: varchar("time_of_day"), // "morning", "afternoon", "evening", "night"
  
  // Context
  dataSource: varchar("data_source").notNull(), // "receipt-parsing", "manual"
  
  createdAt: timestamp("created_at").defaultNow(),
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

// Workout log entries for tracking user workout activity
export const workoutLogEntries = pgTable("workout_log_entries", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  workoutType: varchar("workout_type").notNull(), // 'Push Day', 'Pull Day', 'Leg Day', 'Cardio', etc.
  exerciseName: varchar("exercise_name").notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  loggedAt: timestamp("logged_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type ParsedFoodLog = typeof parsedFoodLogs.$inferSelect;
export type InsertParsedFoodLog = typeof parsedFoodLogs.$inferInsert;
export type FoodLogEntry = typeof foodLogEntries.$inferSelect;
export type InsertFoodLogEntry = typeof foodLogEntries.$inferInsert;
export type CustomNutrition = typeof customNutritionDatabase.$inferSelect;
export type InsertCustomNutrition = typeof customNutritionDatabase.$inferInsert;
export type UserFoodPattern = typeof userFoodPatterns.$inferSelect;
export type InsertUserFoodPattern = typeof userFoodPatterns.$inferInsert;
export type WorkoutLogEntry = typeof workoutLogEntries.$inferSelect;
export type InsertWorkoutLogEntry = typeof workoutLogEntries.$inferInsert;

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
