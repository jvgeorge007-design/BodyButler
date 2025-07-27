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

// Global food database - comprehensive nutrition data across all users
export const globalFoodDatabase = pgTable("global_food_database", {
  id: varchar("id").primaryKey().notNull(),
  
  // Food identification
  foodName: varchar("food_name").notNull(),
  brandName: varchar("brand_name"),
  description: text("description"),
  commonNames: text("common_names").array(), // Alternative names this food is known by
  category: varchar("category"), // e.g., "fast-food", "restaurant", "packaged", "fresh"
  
  // API sources
  fatSecretFoodId: varchar("fatsecret_food_id"),
  fdcId: integer("fdc_id"),
  upcCode: varchar("upc_code"),
  
  // Nutritional data per 100g serving
  caloriesPer100g: decimal("calories_per_100g", { precision: 8, scale: 2 }),
  proteinPer100g: decimal("protein_per_100g", { precision: 8, scale: 2 }),
  totalCarbsPer100g: decimal("total_carbs_per_100g", { precision: 8, scale: 2 }),
  fiberPer100g: decimal("fiber_per_100g", { precision: 8, scale: 2 }),
  sugarsPer100g: decimal("sugars_per_100g", { precision: 8, scale: 2 }),
  addedSugarsPer100g: decimal("added_sugars_per_100g", { precision: 8, scale: 2 }),
  totalFatPer100g: decimal("total_fat_per_100g", { precision: 8, scale: 2 }),
  saturatedFatPer100g: decimal("saturated_fat_per_100g", { precision: 8, scale: 2 }),
  monounsaturatedFatPer100g: decimal("mono_fat_per_100g", { precision: 8, scale: 2 }),
  polyunsaturatedFatPer100g: decimal("poly_fat_per_100g", { precision: 8, scale: 2 }),
  transFatPer100g: decimal("trans_fat_per_100g", { precision: 8, scale: 2 }),
  sodiumPer100g: decimal("sodium_per_100g", { precision: 8, scale: 2 }),
  
  // Serving information
  typicalServingSize: decimal("typical_serving_size", { precision: 8, scale: 2 }),
  typicalServingUnit: varchar("typical_serving_unit"), // e.g., "g", "cup", "piece", "slice"
  
  // Health metrics
  healthScore: decimal("health_score", { precision: 5, scale: 2 }),
  healthGrade: varchar("health_grade", { length: 2 }),
  
  // Data quality and tracking
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("1.0"),
  dataSource: varchar("data_source").notNull(), // "fatsecret", "usda", "receipt-parsing", "manual"
  timesLogged: integer("times_logged").default(0), // How many times users have logged this food
  lastLoggedAt: timestamp("last_logged_at"),
  verificationStatus: varchar("verification_status").default("unverified"), // "verified", "unverified", "flagged"
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Receipt parsing insights - aggregate data across all users
export const receiptParsingInsights = pgTable("receipt_parsing_insights", {
  id: varchar("id").primaryKey().notNull(),
  
  // Restaurant/establishment data
  establishmentName: varchar("establishment_name").notNull(),
  establishmentType: varchar("establishment_type"), // "fast-food", "restaurant", "coffee-shop", etc.
  location: varchar("location"), // City, state extracted from receipts
  
  // Menu item tracking
  menuItemName: varchar("menu_item_name").notNull(),
  menuItemCategory: varchar("menu_item_category"), // "entree", "side", "beverage", etc.
  averagePrice: decimal("average_price", { precision: 8, scale: 2 }),
  priceRange: varchar("price_range"), // e.g., "$5-8", "$10-15"
  
  // Aggregate nutritional data (calculated from all user logs)
  avgCalories: decimal("avg_calories", { precision: 8, scale: 2 }),
  avgProtein: decimal("avg_protein", { precision: 8, scale: 2 }),
  avgCarbs: decimal("avg_carbs", { precision: 8, scale: 2 }),
  avgFat: decimal("avg_fat", { precision: 8, scale: 2 }),
  avgHealthScore: decimal("avg_health_score", { precision: 5, scale: 2 }),
  
  // Usage statistics
  totalOrders: integer("total_orders").default(1),
  uniqueUsers: integer("unique_users").default(1),
  firstSeenAt: timestamp("first_seen_at").notNull(),
  lastSeenAt: timestamp("last_seen_at").notNull(),
  popularityRank: integer("popularity_rank"), // Ranking within establishment
  
  // Geographic and demographic insights
  popularRegions: text("popular_regions").array(), // Where this item is commonly ordered
  peakOrderTimes: text("peak_order_times").array(), // Time patterns when ordered
  seasonalTrends: jsonb("seasonal_trends"), // Monthly/seasonal ordering patterns
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const foodLogEntries = pgTable("food_log_entries", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  globalFoodId: varchar("global_food_id").references(() => globalFoodDatabase.id), // Link to global database
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
  receiptInsightId: varchar("receipt_insight_id").references(() => receiptParsingInsights.id),
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
export type GlobalFood = typeof globalFoodDatabase.$inferSelect;
export type InsertGlobalFood = typeof globalFoodDatabase.$inferInsert;
export type ReceiptInsight = typeof receiptParsingInsights.$inferSelect;
export type InsertReceiptInsight = typeof receiptParsingInsights.$inferInsert;

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
