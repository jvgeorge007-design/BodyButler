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
    const { image, text } = parseReceiptSchema.parse(req.body);
    
    if (!image && !text) {
      return res.status(400).json({ error: "Either image or text must be provided" });
    }

    // Check if user is authenticated
    if (!req.user?.replit?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Parse receipt using OCR service
    const parsedReceipt = image 
      ? await receiptOCRService.parseReceiptImage(image)
      : await receiptOCRService.parseReceiptText(text!);

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
      userId: req.user.replit.id,
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
    if (!req.user?.replit?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get the parsed receipt
    const parsedReceipt = await storage.getParsedFoodLog(receiptId);
    if (!parsedReceipt || parsedReceipt.userId !== req.user.replit.id) {
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
        userId: req.user!.replit!.id,
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

// Get user's food log entries for a specific date
router.get("/food-log/:date", async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const entries = await storage.getFoodLogEntriesByDateRange(
      req.user!.replit!.id,
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

    res.json({
      date: req.params.date,
      meals: groupedEntries,
      dailyTotals: {
        calories: Math.round(dailyTotals.calories),
        protein: Math.round(dailyTotals.protein),
        carbs: Math.round(dailyTotals.totalCarbs),
        grade: dailyGrade,
      },
      totalItems: dailyTotals.itemCount,
    });
  } catch (error) {
    console.error("Error getting food log:", error);
    res.status(500).json({ error: "Failed to get food log" });
  }
});

export default router;