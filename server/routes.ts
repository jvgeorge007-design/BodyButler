import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generatePersonalizedPlan } from "./openai";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Process saved onboarding data after login
  app.post('/api/auth/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // The data comes directly in req.body, not nested in onboardingData
      const onboardingData = req.body;
      
      console.log('Received onboarding data:', JSON.stringify(onboardingData, null, 2));
      
      // Save onboarding data to profile
      const existingProfile = await storage.getUserProfile(userId);
      if (existingProfile) {
        const mergedData = { ...existingProfile.onboardingData, ...onboardingData };
        await storage.updateUserProfile(userId, mergedData);
      } else {
        const profileData = {
          userId,
          onboardingData,
          onboardingCompleted: true,
        };
        await storage.createUserProfile(profileData);
      }

      // Generate personalized plan using ChatGPT
      console.log('Generating personalized plan for user:', userId);
      console.log('Using onboarding data:', { name: onboardingData.name, hasName: !!onboardingData.name });
      try {
        const personalizedPlan = await generatePersonalizedPlan(onboardingData);
        console.log('Personalized plan generated successfully');
        
        // Save the generated plan to the database
        await storage.savePersonalizedPlan(userId, personalizedPlan);
        console.log('Personalized plan saved to Supabase for user:', userId);
        
        console.log('Plan structure:', {
          workoutPlan: personalizedPlan.workoutPlan ? 'Generated' : 'Missing',
          macroTargets: personalizedPlan.macroTargets ? 'Generated' : 'Missing',
          mealPlan: personalizedPlan.mealPlan ? 'Generated' : 'Missing'
        });
        
      } catch (planError) {
        console.error('Error generating or saving personalized plan:', planError);
        // Continue with success even if plan generation fails
        // The user's data is still saved
      }
      
      res.json({ success: true, message: "Onboarding completed successfully" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // User profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboardingData = req.body;
      
      const existingProfile = await storage.getUserProfile(userId);
      if (existingProfile) {
        // Merge existing data with new data
        const mergedData = { ...existingProfile.onboardingData, ...onboardingData };
        const updatedProfile = await storage.updateUserProfile(userId, mergedData);
        return res.json(updatedProfile);
      }
      
      // Create new profile with onboarding data
      const profileData = {
        userId,
        onboardingData,
        onboardingCompleted: false,
      };
      const newProfile = await storage.createUserProfile(profileData);
      res.json(newProfile);
    } catch (error) {
      console.error("Error creating/updating profile:", error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const existingProfile = await storage.getUserProfile(userId);
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Merge existing onboarding data with new data
      const mergedData = { ...existingProfile.onboardingData, ...updateData };
      const updatedProfile = await storage.updateUserProfile(userId, mergedData);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get personalized plan
  app.get('/api/personalized-plan', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      if (!profile.personalizedPlan) {
        return res.status(404).json({ message: "No personalized plan found. Please complete onboarding first." });
      }
      
      res.json(profile.personalizedPlan);
    } catch (error) {
      console.error("Error fetching personalized plan:", error);
      res.status(500).json({ message: "Failed to fetch personalized plan" });
    }
  });

  // Test endpoint for master prompt (remove after testing)
  app.post('/api/test-prompt', async (req, res) => {
    try {
      const testData = req.body;
      console.log('Testing improved master prompt with data:', testData);
      
      const personalizedPlan = await generatePersonalizedPlan(testData);
      console.log('Generated plan structure:', {
        workoutDays: personalizedPlan.workoutPlan?.days?.length || 0,
        hasProgression: !!personalizedPlan.workoutPlan?.progression,
        hasMealMacros: personalizedPlan.mealPlan?.meals?.[0]?.macros ? 'Yes' : 'No',
        hasApproach: !!personalizedPlan.mealPlan?.approach
      });
      
      res.json(personalizedPlan);
    } catch (error) {
      console.error("Error testing prompt:", error);
      res.status(500).json({ message: "Failed to test prompt" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
