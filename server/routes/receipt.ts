import { Router } from "express";
import { z } from "zod";
import { receiptOCRService } from "../services/receiptOCR.js";
import { fatSecretService } from "../services/fatSecretApi.js";
import { storage } from "../storage.js";

const router = Router();

// Schema for receipt parsing request
const parseReceiptSchema = z.object({
  image: z.string().optional(), // base64 image
  text: z.string().optional(),   // raw text
});

const confirmReceiptSchema = z.object({
  receiptId: z.string(),
  forMeOnly: z.boolean(),
  selectedItems: z.array(z.object({
    index: z.number(),
    quantity: z.number(),
    selected: z.boolean(),
    selectedFoodId: z.string().optional(), // FatSecret food_id chosen by user
  })),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
});

// Parse receipt (image or text)
router.post("/parse", async (req, res) => {
  try {
    console.log('Receipt parsing started for user:', req.user?.id);
    const { image, text } = parseReceiptSchema.parse(req.body);
    
    if (!image && !text) {
      return res.status(400).json({ error: "Either image or text must be provided" });
    }

    // Check if user is authenticated
    const user = req.user as any;
    if (!req.isAuthenticated() || !user?.claims?.sub) {
      console.log('Authentication failed - no user found');
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log('Starting OCR processing...');
    // Parse receipt using OCR service
    const parsedReceipt = image 
      ? await receiptOCRService.parseReceiptImage(image)
      : await receiptOCRService.parseReceiptText(text!);
    
    console.log('OCR completed, found', parsedReceipt.items.length, 'items');

    // Search FatSecret for each item with error handling
    const fatSecretMatches = await Promise.all(
      parsedReceipt.items.map(async (item) => {
        try {
          const searchResults = await fatSecretService.fuzzySearchFood(item.name);
          return {
            originalItem: item,
            fatSecretOptions: searchResults.slice(0, 5), // Top 5 options for user selection
            selectedOption: null, // User will select before confirmation
          };
        } catch (error) {
          console.error(`Error searching FatSecret for item "${item.name}":`, error);
          // Return empty results if FatSecret search fails
          return {
            originalItem: item,
            fatSecretOptions: [],
            selectedOption: null,
          };
        }
      })
    );

    const userId = user.claims.sub;

    // Store parsed receipt
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await storage.createParsedFoodLog({
      id: receiptId,
      userId: userId,
      rawText: image ? 'Image processed' : text!,
      establishment: parsedReceipt.establishment || null,
      parsedItems: parsedReceipt.items,
      usdaMatches: fatSecretMatches, // Store FatSecret matches in existing field
      confidence: parsedReceipt.confidence ? parsedReceipt.confidence.toString() : "0.8",
      sourceType: image ? 'image' : 'text',
    });

    res.json({
      receiptId,
      establishment: parsedReceipt.establishment,
      items: fatSecretMatches,
      totalItems: parsedReceipt.items.length,
    });
  } catch (error) {
    console.error("Error parsing receipt:", error);
    res.status(500).json({ error: "Failed to parse receipt" });
  }
});

// Confirm receipt and log selected items
router.post("/confirm", async (req, res) => {
  try {
    const { receiptId, forMeOnly, selectedItems, mealType } = confirmReceiptSchema.parse(req.body);
    
    // Check if user is authenticated
    const user = req.user as any;
    if (!req.isAuthenticated() || !user?.claims?.sub) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const userId = user.claims.sub;

    // Get the stored receipt
    const storedReceipt = await storage.getParsedFoodLogById(receiptId);
    if (!storedReceipt || storedReceipt.userId !== userId) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    const loggedItems = [];

    // Process each selected item
    for (const selection of selectedItems) {
      if (!selection.selected || !selection.selectedFoodId) continue;

      const matchData = (storedReceipt.usdaMatches as any[])[selection.index];
      if (!matchData?.fatSecretOptions) continue;

      // Find the specific food option the user selected
      const selectedFood = matchData.fatSecretOptions.find(
        (option: any) => option.food_id === selection.selectedFoodId
      );
      
      if (!selectedFood) {
        console.error(`Selected food ID ${selection.selectedFoodId} not found in options`);
        continue;
      }

      const quantity = selection.quantity;

      try {
        // Get detailed nutrition from FatSecret using selected food
        const nutritionData = await fatSecretService.getFoodById(selectedFood.food_id);
        const serving = nutritionData.food.servings.serving[0];
        
        // Calculate nutrition for user's quantity
        const scaledNutrients = {
          calories: ((parseFloat(serving?.calories || '0') * quantity) / 1).toFixed(1),
          protein: ((parseFloat(serving?.protein || '0') * quantity) / 1).toFixed(1),
          totalCarbs: ((parseFloat(serving?.carbohydrate || '0') * quantity) / 1).toFixed(1),
          fiber: ((parseFloat(serving?.fiber || '0') * quantity) / 1).toFixed(1),
          sugars: ((parseFloat(serving?.sugar || '0') * quantity) / 1).toFixed(1),
          totalFat: ((parseFloat(serving?.fat || '0') * quantity) / 1).toFixed(1),
          saturatedFat: ((parseFloat(serving?.saturated_fat || '0') * quantity) / 1).toFixed(1),
          sodium: ((parseFloat(serving?.sodium || '0') * quantity) / 1).toFixed(1),
        };

        // Calculate health score
        const healthScore = fatSecretService.calculateHealthScore({
          calories: parseFloat(scaledNutrients.calories),
          protein: parseFloat(scaledNutrients.protein),
          totalCarbs: parseFloat(scaledNutrients.totalCarbs),
          fiber: parseFloat(scaledNutrients.fiber),
          sugars: parseFloat(scaledNutrients.sugars),
          addedSugars: 0,
          totalFat: parseFloat(scaledNutrients.totalFat),
          saturatedFat: parseFloat(scaledNutrients.saturatedFat),
          monoFat: 0,
          polyFat: 0,
          transFat: 0,
          sodium: parseFloat(scaledNutrients.sodium),
        });

        // 1. Save to user's personal food log
        const foodLogEntryId = `foodlog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const foodLogEntry = await storage.createFoodLogEntry({
          id: foodLogEntryId,
          userId: userId,
          fdcId: parseInt(selectedFood.food_id),
          foodName: selectedFood.food_name,
          quantity: quantity.toString(),
          unit: "serving",
          mealType: mealType,
          loggedAt: new Date(),
          
          calories: scaledNutrients.calories,
          protein: scaledNutrients.protein,
          totalCarbs: scaledNutrients.totalCarbs,
          fiber: scaledNutrients.fiber,
          sugars: scaledNutrients.sugars,
          totalFat: scaledNutrients.totalFat,
          saturatedFat: scaledNutrients.saturatedFat,
          sodium: scaledNutrients.sodium,
          
          healthScore: healthScore.score.toString(),
          healthGrade: healthScore.grade,
          
          sourceReceiptId: receiptId,
          manualEntry: false,
        });

        // 2. Save to aggregated global nutrition database (anonymized with demographics)
        // Get user demographics for anonymized analytics
        const userProfile = await storage.getUserProfile(userId);
        const demographicData = extractAnonymizedDemographics(userProfile);
        
        await storage.addToGlobalNutritionDatabase({
          foodName: selectedFood.food_name,
          brandName: selectedFood.brand_name || null,
          establishment: storedReceipt.establishment || null,
          
          // Nutritional data per serving
          calories: parseFloat(serving?.calories || '0'),
          protein: parseFloat(serving?.protein || '0'),
          totalCarbs: parseFloat(serving?.carbohydrate || '0'),
          fiber: parseFloat(serving?.fiber || '0'),
          sugars: parseFloat(serving?.sugar || '0'),
          totalFat: parseFloat(serving?.fat || '0'),
          saturatedFat: parseFloat(serving?.saturated_fat || '0'),
          sodium: parseFloat(serving?.sodium || '0'),
          
          healthScore: healthScore.score,
          healthGrade: healthScore.grade,
          
          // Tracking information (no personal data - NO FATSECRET ID)
          dataSource: 'receipt-parsing',
          loggedAt: new Date(),
          mealType: mealType,
          
          // Anonymized demographic insights
          userAgeRange: demographicData.ageRange,
          userGender: demographicData.gender,
          userFitnessGoals: demographicData.fitnessGoals,
          userActivityLevel: demographicData.activityLevel,
        });

        loggedItems.push({
          ...foodLogEntry,
          nutrients: scaledNutrients,
          healthScore,
        });

      } catch (error) {
        console.error(`Error processing item ${selectedFood.food_name}:`, error);
        continue;
      }
    }

    res.json({
      success: true,
      loggedItemsCount: loggedItems.length,
      loggedItems,
    });
  } catch (error) {
    console.error("Error confirming receipt:", error);
    res.status(500).json({ error: "Failed to log food items" });
  }
});

// Get user's food log entries for today
router.get("/food-log", async (req, res) => {
  try {
    // Check if user is authenticated
    const user = req.user as any;
    if (!req.isAuthenticated() || !user?.claims?.sub) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const userId = user.claims.sub;

    console.log(`Getting food log for user ${userId} for today`);
    console.log(`Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    const entries = await storage.getFoodLogEntriesByDateRange(
      userId,
      startOfDay,
      endOfDay
    );

    console.log(`Found ${entries.length} food log entries for user ${userId}`);

    // Group by meal type and calculate totals
    const groupedEntries = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    let dailyTotals = {
      calories: 0,
      protein: 0,
      totalCarbs: 0,
      healthScoreSum: 0,
      itemCount: 0,
    };

    for (const entry of entries) {
      const mealType = entry.mealType as keyof typeof groupedEntries;
      if (groupedEntries[mealType]) {
        groupedEntries[mealType].push(entry);
      }

      // Add to daily totals
      dailyTotals.calories += parseFloat(entry.calories || '0');
      dailyTotals.protein += parseFloat(entry.protein || '0');
      dailyTotals.totalCarbs += parseFloat(entry.totalCarbs || '0');
      dailyTotals.healthScoreSum += parseFloat(entry.healthScore || '0');
      dailyTotals.itemCount++;
    }

    // Calculate average health score and grade
    const avgHealthScore = dailyTotals.itemCount > 0 
      ? dailyTotals.healthScoreSum / dailyTotals.itemCount 
      : 0;
    const dailyGrade = fatSecretService.calculateHealthScore({
      calories: dailyTotals.calories,
      protein: dailyTotals.protein,
      totalCarbs: dailyTotals.totalCarbs,
      fiber: 0, sugars: 0, addedSugars: 0, totalFat: 0,
      saturatedFat: 0, monoFat: 0, polyFat: 0, transFat: 0, sodium: 0,
    }).grade;

    const response = {
      date: today.toISOString().split('T')[0],
      meals: groupedEntries,
      dailyTotals: {
        calories: Math.round(dailyTotals.calories),
        protein: Math.round(dailyTotals.protein),
        carbs: Math.round(dailyTotals.totalCarbs),
        grade: dailyGrade,
      },
      totalItems: dailyTotals.itemCount,
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error("Error getting food log:", error);
    res.status(500).json({ error: "Failed to get food log" });
  }
});

// Get user's food log entries for a specific date
router.get("/food-log/:date", async (req, res) => {
  try {
    // Check if user is authenticated
    const user = req.user as any;
    if (!req.isAuthenticated() || !user?.claims?.sub) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const userId = user.claims.sub;

    console.log(`Getting food log for user ${userId} on ${req.params.date}`);

    const entries = await storage.getFoodLogEntriesByDateRange(
      userId,
      startOfDay,
      endOfDay
    );

    // Group by meal type and calculate totals
    const groupedEntries = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    let dailyTotals = {
      calories: 0,
      protein: 0,
      totalCarbs: 0,
      healthScoreSum: 0,
      itemCount: 0,
    };

    for (const entry of entries) {
      const mealType = entry.mealType as keyof typeof groupedEntries;
      if (groupedEntries[mealType]) {
        groupedEntries[mealType].push(entry);
      }

      // Add to daily totals
      dailyTotals.calories += parseFloat(entry.calories || '0');
      dailyTotals.protein += parseFloat(entry.protein || '0');
      dailyTotals.totalCarbs += parseFloat(entry.totalCarbs || '0');
      dailyTotals.healthScoreSum += parseFloat(entry.healthScore || '0');
      dailyTotals.itemCount++;
    }

    // Calculate average daily grade
    const avgHealthScore = dailyTotals.itemCount > 0 
      ? dailyTotals.healthScoreSum / dailyTotals.itemCount 
      : 0;
    const dailyGrade = fatSecretService.calculateHealthScore({
      calories: dailyTotals.calories,
      protein: dailyTotals.protein,
      totalCarbs: dailyTotals.totalCarbs,
      fiber: 0, sugars: 0, addedSugars: 0, totalFat: 0,
      saturatedFat: 0, monoFat: 0, polyFat: 0, transFat: 0, sodium: 0,
    }).grade;

    const responseData = {
      date: req.params.date,
      meals: groupedEntries,
      dailyTotals: {
        calories: Math.round(dailyTotals.calories),
        protein: Math.round(dailyTotals.protein),
        carbs: Math.round(dailyTotals.totalCarbs),
        grade: dailyGrade,
      },
      totalItems: dailyTotals.itemCount,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error getting food log:", error);
    res.status(500).json({ error: "Failed to get food log" });
  }
});

// Delete a specific food log entry
router.delete("/food-log/:itemId", async (req, res) => {
  try {
    // Check if user is authenticated
    const user = req.user as any;
    if (!req.isAuthenticated() || !user?.claims?.sub) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const itemId = req.params.itemId;
    const userId = user.claims.sub;

    console.log(`Deleting food log entry ${itemId} for user ${userId}`);

    // Verify the item belongs to the user before deleting
    const existingEntry = await storage.getFoodLogEntryById(itemId);
    if (!existingEntry || existingEntry.userId !== userId) {
      return res.status(404).json({ error: "Food log entry not found" });
    }

    await storage.deleteFoodLogEntry(itemId);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting food log entry:", error);
    res.status(500).json({ error: "Failed to delete food log entry" });
  }
});

// Helper function to extract anonymized demographics from user profile
function extractAnonymizedDemographics(userProfile: any) {
  if (!userProfile?.onboardingData) {
    return {
      ageRange: undefined,
      gender: undefined,
      fitnessGoals: undefined,
      activityLevel: undefined,
    };
  }

  const data = userProfile.onboardingData;
  
  // Convert birth date to age range (anonymized)
  let ageRange: string | undefined;
  if (data.birthDate) {
    const birthYear = new Date(data.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    if (age < 18) ageRange = 'under-18';
    else if (age <= 25) ageRange = '18-25';
    else if (age <= 35) ageRange = '26-35';
    else if (age <= 45) ageRange = '36-45';
    else if (age <= 55) ageRange = '46-55';
    else ageRange = '55+';
  }

  // Extract fitness goals from goals text
  let fitnessGoals: string | undefined;
  if (data.goals) {
    const goals = data.goals.toLowerCase();
    if (goals.includes('lose') || goals.includes('weight loss')) fitnessGoals = 'weight-loss';
    else if (goals.includes('gain') || goals.includes('muscle') || goals.includes('bulk')) fitnessGoals = 'muscle-gain';
    else if (goals.includes('maintain') || goals.includes('tone')) fitnessGoals = 'maintenance';
    else if (goals.includes('endurance') || goals.includes('cardio')) fitnessGoals = 'endurance';
    else fitnessGoals = 'general-fitness';
  }

  // Extract activity level from activity description
  let activityLevel: string | undefined;
  if (data.activityDescription) {
    const activity = data.activityDescription.toLowerCase();
    if (activity.includes('sedentary') || activity.includes('desk') || activity.includes('sit')) {
      activityLevel = 'sedentary';
    } else if (activity.includes('moderate') || activity.includes('few times') || activity.includes('2-3')) {
      activityLevel = 'moderate';
    } else if (activity.includes('active') || activity.includes('daily') || activity.includes('regular')) {
      activityLevel = 'active';
    } else if (activity.includes('very') || activity.includes('athlete') || activity.includes('intense')) {
      activityLevel = 'very-active';
    }
  }

  return {
    ageRange,
    gender: data.sex?.toLowerCase(),
    fitnessGoals,
    activityLevel,
  };
}

export default router;