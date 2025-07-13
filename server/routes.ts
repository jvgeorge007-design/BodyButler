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
      const { onboardingData } = req.body;
      
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
      try {
        const personalizedPlan = await generatePersonalizedPlan(onboardingData);
        console.log('Personalized plan generated successfully');
        
        // TODO: Save the generated plan to the database
        // For now, we'll just log it and return success
        console.log('Plan structure:', {
          workoutPlan: personalizedPlan.workoutPlan ? 'Generated' : 'Missing',
          macroTargets: personalizedPlan.macroTargets ? 'Generated' : 'Missing',
          mealPlan: personalizedPlan.mealPlan ? 'Generated' : 'Missing'
        });
        
      } catch (planError) {
        console.error('Error generating personalized plan:', planError);
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

  const httpServer = createServer(app);
  return httpServer;
}
