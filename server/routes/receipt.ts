import { Router } from "express";
import { z } from "zod";
import { receiptOCRService } from "../services/receiptOCR.js";
import { usdaService } from "../services/usdaApi.js";
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
  })),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
});

// Parse receipt (image or text)
router.post("/parse", async (req, res) => {
  try {
    console.log('Receipt parsing started for user:', req.user?.claims?.sub);
    const { image, text } = parseReceiptSchema.parse(req.body);
    
    if (!image && !text) {
      return res.status(400).json({ error: "Either image or text must be provided" });
    }

    // Check if user is authenticated
    if (!req.user?.claims?.sub) {
      console.log('Authentication failed - no user found');
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log('Starting OCR processing...');
    // Parse receipt using OCR service
    const parsedReceipt = image 
      ? await receiptOCRService.parseReceiptImage(image)
      : await receiptOCRService.parseReceiptText(text!);
    
    console.log('OCR completed, found', parsedReceipt.items.length, 'items');

    // Search USDA for each item with error handling
    const usdaMatches = await Promise.all(
      parsedReceipt.items.map(async (item) => {
        try {
          const searchResults = await usdaService.fuzzySearchFood(item.name);
          return {
            originalItem: item,
            usdaOptions: searchResults.slice(0, 3), // Top 3 matches
            bestMatch: searchResults[0] || null,
          };
        } catch (error) {
          console.error(`Error searching USDA for item "${item.name}":`, error);
          // Return empty results if USDA search fails
          return {
            originalItem: item,
            usdaOptions: [],
            bestMatch: null,
          };
        }
      })
    );

    // Store parsed receipt in database
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const parsedFoodLog = await storage.createParsedFoodLog({
      id: receiptId,
      userId: req.user.claims.sub,
      rawText: parsedReceipt.rawText,
      establishment: parsedReceipt.establishment,
      parsedItems: parsedReceipt.items,
      usdaMatches,
      confidence: parsedReceipt.confidence.toString(),
      sourceType: image ? 'image' : 'text',
    });

    res.json({
      receiptId,
      establishment: parsedReceipt.establishment,
      items: parsedReceipt.items,
      usdaMatches,
      confidence: parsedReceipt.confidence,
    });
  } catch (error) {
    console.error("Error parsing receipt:", error);
    res.status(500).json({ error: "Failed to parse receipt" });
  }
});

// Confirm and log selected items
router.post("/confirm", async (req, res) => {
  try {
    const { receiptId, forMeOnly, selectedItems, mealType } = confirmReceiptSchema.parse(req.body);
    
    // Check if user is authenticated
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get the parsed receipt
    const parsedReceipt = await storage.getParsedFoodLog(receiptId);
    if (!parsedReceipt || parsedReceipt.userId !== req.user.claims.sub) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    const usdaMatches = parsedReceipt.usdaMatches as any[];
    const loggedItems = [];

    // Process each selected item
    for (const selection of selectedItems) {
      if (!selection.selected) continue;

      const match = usdaMatches[selection.index];
      if (!match?.bestMatch) continue;

      const usdaFood = match.bestMatch;
      const nutrients = usdaService.extractNutrients(usdaFood);
      const healthScore = usdaService.calculateHealthScore(nutrients);

      // Scale nutrients by quantity
      const scaledNutrients = {
        calories: nutrients.calories * selection.quantity,
        protein: nutrients.protein * selection.quantity,
        totalCarbs: nutrients.totalCarbs * selection.quantity,
        fiber: nutrients.fiber * selection.quantity,
        sugars: nutrients.sugars * selection.quantity,
        addedSugars: nutrients.addedSugars * selection.quantity,
        totalFat: nutrients.totalFat * selection.quantity,
        saturatedFat: nutrients.saturatedFat * selection.quantity,
        transFat: nutrients.transFat * selection.quantity,
        sodium: nutrients.sodium * selection.quantity,
      };

      // Create food log entry
      const entryId = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const foodLogEntry = await storage.createFoodLogEntry({
        id: entryId,
        userId: req.user!.claims!.sub,
        fdcId: usdaFood.fdcId,
        foodName: usdaFood.description,
        quantity: selection.quantity.toString(),
        unit: match.originalItem.unit || 'each',
        mealType,
        loggedAt: new Date(),
        
        // Nutritional data
        calories: scaledNutrients.calories.toString(),
        protein: scaledNutrients.protein.toString(),
        totalCarbs: scaledNutrients.totalCarbs.toString(),
        fiber: scaledNutrients.fiber.toString(),
        sugars: scaledNutrients.sugars.toString(),
        addedSugars: scaledNutrients.addedSugars.toString(),
        totalFat: scaledNutrients.totalFat.toString(),
        saturatedFat: scaledNutrients.saturatedFat.toString(),
        transFat: scaledNutrients.transFat.toString(),
        sodium: scaledNutrients.sodium.toString(),
        
        // Health scoring
        healthScore: healthScore.score.toString(),
        healthGrade: healthScore.grade,
        
        sourceReceiptId: receiptId,
        manualEntry: false,
      });

      loggedItems.push({
        ...foodLogEntry,
        nutrients: scaledNutrients,
        healthScore,
      });
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

// Get user's food log entries for today (simple endpoint for debugging)
router.get("/food-log", async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const userId = req.user!.claims!.sub;

    console.log(`Getting food log for user ${userId} for today`);
    console.log(`Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    const entries = await storage.getFoodLogEntriesByDateRange(
      userId,
      startOfDay,
      endOfDay
    );

    console.log(`Found ${entries.length} food log entries for user ${userId}`);
    entries.forEach((entry, i) => {
      console.log(`Entry ${i + 1}:`, {
        id: entry.id,
        foodName: entry.foodName,
        mealType: entry.mealType,
        calories: entry.calories,
        loggedAt: entry.loggedAt
      });
    });

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
    const dailyGrade = usdaService.calculateHealthScore({
      calories: dailyTotals.calories,
      protein: dailyTotals.protein,
      totalCarbs: dailyTotals.totalCarbs,
      // Use aggregated values for scoring
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
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const userId = req.user!.claims!.sub;

    console.log(`Getting food log for user ${userId} on ${req.params.date}`);
    console.log(`Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    const entries = await storage.getFoodLogEntriesByDateRange(
      userId,
      startOfDay,
      endOfDay
    );

    console.log(`Found ${entries.length} food log entries for user ${userId}`);
    if (entries.length > 0) {
      console.log('Sample entry:', JSON.stringify(entries[0], null, 2));
    }

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

    console.log('\n=== DETAILED MACRO CALCULATION BREAKDOWN ===');
    
    for (const entry of entries) {
      const mealType = entry.mealType as keyof typeof groupedEntries;
      if (groupedEntries[mealType]) {
        groupedEntries[mealType].push(entry);
      }

      // Log detailed breakdown for each entry
      const entryCalories = parseFloat(entry.calories || '0');
      const entryProtein = parseFloat(entry.protein || '0');
      const entryCarbs = parseFloat(entry.totalCarbs || '0');
      
      console.log(`\n${entry.mealType.toUpperCase()} - ${entry.foodName}:`);
      console.log(`  Quantity: ${entry.quantity} ${entry.unit}`);
      console.log(`  Calories: ${entryCalories}`);
      console.log(`  Protein: ${entryProtein}g`);
      console.log(`  Carbs: ${entryCarbs}g`);
      console.log(`  Health Score: ${entry.healthScore}/100 (${entry.healthGrade})`);

      // Add to daily totals
      dailyTotals.calories += entryCalories;
      dailyTotals.protein += entryProtein;
      dailyTotals.totalCarbs += entryCarbs;
      dailyTotals.healthScoreSum += parseFloat(entry.healthScore || '0');
      dailyTotals.itemCount++;
    }

    // Log meal-specific totals
    console.log('\n=== MEAL-SPECIFIC TOTALS ===');
    Object.entries(groupedEntries).forEach(([mealType, mealEntries]) => {
      if (mealEntries.length > 0) {
        const mealTotals = mealEntries.reduce((acc, entry) => ({
          calories: acc.calories + parseFloat(entry.calories || '0'),
          protein: acc.protein + parseFloat(entry.protein || '0'),
          carbs: acc.carbs + parseFloat(entry.totalCarbs || '0'),
        }), { calories: 0, protein: 0, carbs: 0 });
        
        console.log(`\n${mealType.toUpperCase()} TOTALS:`);
        console.log(`  Items: ${mealEntries.length}`);
        console.log(`  Calories: ${Math.round(mealTotals.calories)}`);
        console.log(`  Protein: ${Math.round(mealTotals.protein)}g`);
        console.log(`  Carbs: ${Math.round(mealTotals.carbs)}g`);
      }
    });

    // Calculate average health score and grade
    const avgHealthScore = dailyTotals.itemCount > 0 
      ? dailyTotals.healthScoreSum / dailyTotals.itemCount 
      : 0;
    const dailyGrade = usdaService.calculateHealthScore({
      calories: dailyTotals.calories,
      protein: dailyTotals.protein,
      totalCarbs: dailyTotals.totalCarbs,
      // Use aggregated values for scoring
      fiber: 0, sugars: 0, addedSugars: 0, totalFat: 0,
      saturatedFat: 0, monoFat: 0, polyFat: 0, transFat: 0, sodium: 0,
    }).grade;

    console.log('\n=== FINAL DAILY TOTALS ===');
    console.log(`Total Items: ${dailyTotals.itemCount}`);
    console.log(`Total Calories: ${Math.round(dailyTotals.calories)}`);
    console.log(`Total Protein: ${Math.round(dailyTotals.protein)}g`);
    console.log(`Total Carbs: ${Math.round(dailyTotals.totalCarbs)}g`);
    console.log(`Average Health Score: ${Math.round(avgHealthScore)}/100`);
    console.log(`Overall Grade: ${dailyGrade}`);
    console.log('=== END BREAKDOWN ===\n');

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

    console.log('API Response Summary:', {
      totalItems: responseData.totalItems,
      breakfastItems: responseData.meals.breakfast.length,
      lunchItems: responseData.meals.lunch.length,
      dinnerItems: responseData.meals.dinner.length,
      snackItems: responseData.meals.snacks.length,
      dailyTotals: responseData.dailyTotals
    });

    res.json(responseData);
  } catch (error) {
    console.error("Error getting food log:", error);
    res.status(500).json({ error: "Failed to get food log" });
  }
});

// Delete a specific food log entry
router.delete("/food-log/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const userId = req.user!.claims!.sub;

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

export default router;