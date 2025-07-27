#!/usr/bin/env tsx
/**
 * One-time script to populate custom nutrition database
 * Run with: npm run populate-db
 */

import { usdaService } from "../services/usdaApi.js";
import { storage } from "../storage.js";

// Common food categories to populate
const FOOD_CATEGORIES = [
  // Grocery staples
  'yogurt', 'milk', 'cheese', 'butter', 'eggs',
  'chicken', 'beef', 'pork', 'fish', 'turkey',
  'bread', 'pasta', 'rice', 'cereal', 'oats',
  'apples', 'bananas', 'oranges', 'berries', 'vegetables',
  'olive oil', 'peanut butter', 'nuts', 'beans',
  
  // Popular brands
  'chobani', 'dannon', 'fage', 'yoplait',
  'kraft', 'philadelphia', 'pepsi', 'coca cola',
  'kellogs', 'general mills', 'quaker',
  'tyson', 'perdue', 'oscar mayer',
  
  // Snacks and convenience
  'chips', 'crackers', 'cookies', 'granola bars',
  'frozen pizza', 'ice cream', 'candy',
];

async function populateFromUSDA() {
  console.log('🍎 Starting USDA nutrition database population...');
  
  let totalFoods = 0;
  
  for (const category of FOOD_CATEGORIES) {
    try {
      console.log(`\n📦 Searching for "${category}" products...`);
      
      const foods = await usdaService.searchBrandedFoods(category, 100);
      console.log(`   Found ${foods.length} foods for "${category}"`);
      
      for (const food of foods) {
        try {
          const nutrition = usdaService.extractNutrition(food);
          
          // Generate search tokens for fuzzy matching
          const searchTokens = generateSearchTokens(food);
          
          const customFood = {
            id: `usda_${food.fdcId}`,
            foodName: food.description,
            brandName: food.brandName || null,
            brandOwner: food.brandOwner || null,
            category: food.foodCategory || category,
            upcBarcode: food.gtinUpc || null,
            usdaFdcId: food.fdcId,
            servingSize: food.servingSize || 100,
            servingSizeUnit: food.servingSizeUnit || 'g',
            householdServing: food.householdServingFullText || null,
            
            // Nutrition data
            calories: nutrition.calories,
            protein: nutrition.protein,
            totalFat: nutrition.totalFat,
            saturatedFat: nutrition.saturatedFat,
            transFat: nutrition.transFat,
            cholesterol: nutrition.cholesterol,
            sodium: nutrition.sodium,
            totalCarbs: nutrition.totalCarbs,
            fiber: nutrition.fiber,
            totalSugars: nutrition.totalSugars,
            addedSugars: nutrition.addedSugars,
            vitaminD: nutrition.vitaminD,
            calcium: nutrition.calcium,
            iron: nutrition.iron,
            potassium: nutrition.potassium,
            
            ingredients: food.ingredients || null,
            dataSource: 'usda',
            dataQuality: 'verified',
            searchTokens: searchTokens,
            lastVerified: new Date(),
          };
          
          await storage.addCustomFood(customFood);
          totalFoods++;
          
          if (totalFoods % 100 === 0) {
            console.log(`   ✅ Processed ${totalFoods} foods...`);
          }
          
        } catch (error) {
          console.error(`   ❌ Error processing food ${food.fdcId}:`, error);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing category "${category}":`, error);
    }
    
    // Rate limiting - be respectful to USDA API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n🎉 Database population complete! Added ${totalFoods} foods.`);
}

function generateSearchTokens(food: any): string[] {
  const tokens = new Set<string>();
  
  // Add food description words
  const description = food.description.toLowerCase();
  description.split(/\s+/).forEach(word => {
    if (word.length > 2) {
      tokens.add(word.replace(/[^\w]/g, ''));
    }
  });
  
  // Add brand name
  if (food.brandName) {
    food.brandName.toLowerCase().split(/\s+/).forEach((word: string) => {
      if (word.length > 2) {
        tokens.add(word.replace(/[^\w]/g, ''));
      }
    });
  }
  
  // Add brand owner
  if (food.brandOwner) {
    food.brandOwner.toLowerCase().split(/\s+/).forEach((word: string) => {
      if (word.length > 2) {
        tokens.add(word.replace(/[^\w]/g, ''));
      }
    });
  }
  
  return Array.from(tokens);
}

// Restaurant nutrition data (manually compiled from official sources)
async function populateRestaurantData() {
  console.log('\n🍟 Adding restaurant nutrition data...');
  
  const restaurantFoods = [
    {
      id: 'mcdonalds_big_mac',
      foodName: 'Big Mac',
      restaurantChain: 'McDonald\'s',
      category: 'fast-food',
      servingSize: 1,
      servingSizeUnit: 'sandwich',
      calories: 563,
      protein: 25,
      totalFat: 33,
      saturatedFat: 11,
      transFat: 1,
      cholesterol: 85,
      sodium: 1040,
      totalCarbs: 45,
      fiber: 3,
      totalSugars: 9,
      dataSource: 'restaurant',
      searchTokens: ['big', 'mac', 'mcdonalds', 'burger', 'sandwich'],
    },
    {
      id: 'taco_bell_chicken_chalupa',
      foodName: 'Chicken Chalupa Supreme',
      restaurantChain: 'Taco Bell',
      category: 'fast-food',
      servingSize: 1,
      servingSizeUnit: 'chalupa',
      calories: 370,
      protein: 16,
      totalFat: 20,
      saturatedFat: 8,
      sodium: 650,
      totalCarbs: 32,
      fiber: 3,
      totalSugars: 4,
      dataSource: 'restaurant',
      searchTokens: ['chicken', 'chalupa', 'supreme', 'taco', 'bell'],
    },
    // Add more restaurant items here...
  ];
  
  for (const food of restaurantFoods) {
    try {
      await storage.addCustomFood(food);
      console.log(`   ✅ Added ${food.foodName} from ${food.restaurantChain}`);
    } catch (error) {
      console.error(`   ❌ Error adding ${food.foodName}:`, error);
    }
  }
}

// Main execution
async function main() {
  try {
    await populateFromUSDA();
    await populateRestaurantData();
    
    console.log('\n🎉 Nutrition database population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database population failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}