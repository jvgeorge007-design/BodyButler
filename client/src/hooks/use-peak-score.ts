import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface TrailFuelData {
  calorieWindow: number; // 0-40
  protein: number; // 0-30
  fiberVeg: number; // 0-20
  hydration: number; // 0-10
  confidenceDecay: number; // multiplier based on meal logging
}

interface ClimbData {
  completion: number; // 0-40
  intensity: number; // 0-30
  progression: number; // 0-20
  warmupMobility: number; // 0-10
}

interface BaseCampData {
  sleepDuration: number; // 0-35
  sleepRegularity: number; // 0-25
  neatSteps: number; // 0-25
  stressMood: number; // 0-15
}

interface ConsistencyData {
  daysOverThreshold: number; // out of 7
}

export function usePeakScore() {
  // Get daily recap data for trail fuel metrics
  const { data: dailyRecap } = useQuery({
    queryKey: ['/api/daily-recap'],
  });

  // Get food log data for meal logging confidence
  const { data: foodLog } = useQuery({
    queryKey: ['/api/food-log'],
  });

  // Get personalized plan for user goals
  const { data: personalizedPlan } = useQuery({
    queryKey: ['/api/personalized-plan'],
  });

  // Get profile for goal type
  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
  });

  const scores = useMemo(() => {
    if (!dailyRecap || !foodLog || !personalizedPlan || !profile) {
      return {
        trailFuelScore: 0,
        climbScore: 0,
        baseCampScore: 0,
        consistencyBonus: 0,
        goalType: 'wellness' as const
      };
    }

    // Calculate Trail Fuel Score
    const calculateTrailFuelScore = (): number => {
      const calories = (dailyRecap as any)?.calories || { consumed: 0, target: 2000 };
      const protein = (dailyRecap as any)?.protein || { consumed: 0, target: 150 };
      
      // Calorie Window (0-40): Your exact formula
      const calorieRatio = calories.consumed / calories.target;
      let calorieWindow = 0;
      
      if (Math.abs(calorieRatio - 1) <= 0.05) {
        calorieWindow = 40;
      } else if (Math.abs(calorieRatio - 1) >= 0.20) {
        calorieWindow = 0;
      } else {
        calorieWindow = 40 * (1 - ((Math.abs(calorieRatio - 1) - 0.05) / 0.15));
      }

      // Protein (0-30): Your exact formula
      let proteinScore = 0;
      const proteinRatio = protein.consumed / protein.target;
      
      if (proteinRatio >= 1.0) {
        proteinScore = 30;
      } else if (proteinRatio >= 0.8) {
        proteinScore = 15 + (proteinRatio - 0.8) / 0.2 * 15;
      } else {
        proteinScore = 0;
      }

      // Fiber/Veg (0-20): Your exact formula
      const fiberGrams = (dailyRecap as any)?.fiber?.consumed || 0;
      const fiberGoal = (dailyRecap as any)?.fiber?.target || 25; // Default adult fiber goal
      const vegServings = (dailyRecap as any)?.vegetables?.servings || 0;
      
      let fiberVeg = 0;
      if (fiberGrams >= fiberGoal || vegServings >= 2) {
        fiberVeg = 20;
      } else {
        fiberVeg = Math.min((fiberGrams / fiberGoal) * 20, 20);
      }

      // Hydration (0-10): Your exact formula
      const bodyweightKg = (profile as any)?.onboardingData?.personal?.weight || 70; // Default if not available
      const hydrationGoal = bodyweightKg * 35; // in ml
      const actualHydrationMl = (dailyRecap as any)?.hydration?.consumed || 0;
      const hydrationRatio = actualHydrationMl / hydrationGoal;
      
      const hydration = Math.min(hydrationRatio, 1.0) * 10;

      // Anti-Cheat: Your exact formula
      const totalMeals = Object.values((foodLog as any)?.meals || {}).reduce((sum: number, mealEntries: any) => {
        return sum + (Array.isArray(mealEntries) ? mealEntries.length : 0);
      }, 0);
      const expectedMeals = 9; // 3 meals + 6 snacks per day roughly
      const mealsLoggedRatio = totalMeals / expectedMeals;
      
      let dietScore = calorieWindow + proteinScore + fiberVeg + hydration;
      
      if (mealsLoggedRatio < 0.70) {
        dietScore *= 0.85; // reduce by 15%
      }

      return dietScore;
    };

    // Calculate Climb Score
    const calculateClimbScore = (): number => {
      // Placeholder calculations - would need workout tracking data
      const completion = 35; // 0-40
      const intensity = 25; // 0-30
      const progression = 15; // 0-20
      const warmupMobility = 8; // 0-10
      
      return completion + intensity + progression + warmupMobility;
    };

    // Calculate Base Camp Score
    const calculateBaseCampScore = (): number => {
      // Placeholder calculations - would need sleep/wellness tracking
      const sleepDuration = 30; // 0-35
      const sleepRegularity = 20; // 0-25
      const neatSteps = 20; // 0-25
      const stressMood = 12; // 0-15
      
      return sleepDuration + sleepRegularity + neatSteps + stressMood;
    };

    // Calculate Consistency Bonus
    const calculateConsistencyBonus = (): number => {
      // Placeholder - would need historical data
      const daysOverThreshold = 5; // out of 7
      if (daysOverThreshold >= 6) return 5;
      if (daysOverThreshold >= 4) return 2;
      return 0;
    };

    // Determine goal type from profile
    const getGoalType = () => {
      const goals = (profile as any)?.onboardingData?.goals;
      if (!goals) return 'wellness';
      
      if (goals.includes('lose weight') || goals.includes('fat loss')) return 'cut';
      if (goals.includes('build muscle') && goals.includes('minimal fat')) return 'lean_bulk';
      if (goals.includes('body recomposition')) return 'recomp';
      if (goals.includes('endurance') || goals.includes('performance')) return 'endurance';
      return 'wellness';
    };

    return {
      trailFuelScore: calculateTrailFuelScore(),
      climbScore: calculateClimbScore(),
      baseCampScore: calculateBaseCampScore(),
      consistencyBonus: calculateConsistencyBonus(),
      goalType: getGoalType() as 'cut' | 'lean_bulk' | 'recomp' | 'endurance' | 'wellness'
    };
  }, [dailyRecap, foodLog, personalizedPlan, profile]);

  return scores;
}