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
      // Rest Day Override: Your exact formula
      const plannedRestDay = (dailyRecap as any)?.workout?.plannedRestDay || false;
      const noUnplannedTraining = !(dailyRecap as any)?.workout?.unplannedTraining || false;
      
      if (plannedRestDay && noUnplannedTraining) {
        return 100; // climb_score = 100
      }
      
      // Completion (0-40): Your exact formula
      const completedSetsOrMinutes = (dailyRecap as any)?.workout?.completed || 0;
      const plannedSetsOrMinutes = (dailyRecap as any)?.workout?.planned || 1; // Avoid division by zero
      const completionRatio = completedSetsOrMinutes / plannedSetsOrMinutes;
      const completion = Math.min(completionRatio, 1.0) * 40;
      
      // Intensity (0-30): Your exact formula
      const usingRPE = (dailyRecap as any)?.workout?.intensityMethod === 'RPE';
      const usingHeartRate = (dailyRecap as any)?.workout?.intensityMethod === 'heart_rate';
      
      let intensity = 0;
      
      if (usingRPE) {
        const avgRPE = (dailyRecap as any)?.workout?.averageRPE || 0;
        const targetRPE = (dailyRecap as any)?.workout?.targetRPE || 7; // Default RPE target
        const deviation = Math.abs(avgRPE - targetRPE);
        intensity = Math.max(0, 30 - (deviation / targetRPE) * 30);
      } else if (usingHeartRate) {
        const minutesInTargetZone = (dailyRecap as any)?.workout?.minutesInTargetZone || 0;
        const totalActiveMinutes = (dailyRecap as any)?.workout?.totalActiveMinutes || 1; // Avoid division by zero
        const zoneRatio = minutesInTargetZone / totalActiveMinutes;
        intensity = Math.min(zoneRatio, 1.0) * 30;
      }
      
      // Progression (0-20): Your exact formula
      const currentWeight = (dailyRecap as any)?.workout?.totalWeight || 0;
      const currentReps = (dailyRecap as any)?.workout?.totalReps || 0;
      const currentSets = (dailyRecap as any)?.workout?.totalSets || 0;
      
      const lastWeekWeight = (dailyRecap as any)?.workout?.lastWeekWeight || 0;
      const lastWeekReps = (dailyRecap as any)?.workout?.lastWeekReps || 0;
      const lastWeekSets = (dailyRecap as any)?.workout?.lastWeekSets || 0;
      
      let progression = 0;
      if (currentWeight > lastWeekWeight || currentReps > lastWeekReps || currentSets > lastWeekSets) {
        progression = 20;
      }
      
      // Warmup/Mobility (0-10): Your exact formula
      const warmupOrMobilityLogged = (dailyRecap as any)?.workout?.warmupOrMobilityLogged || false;
      const warmupMobility = warmupOrMobilityLogged ? 10 : 0;
      
      return completion + intensity + progression + warmupMobility;
    };

    // Calculate Base Camp Score
    const calculateBaseCampScore = (): number => {
      // Combined Sleep Score (0-60): Your exact algorithms
      const sleepEpisodes = (dailyRecap as any)?.sleep?.episodes || [];
      const sleepEntries = (dailyRecap as any)?.sleep?.last7Days || [];
      const sleepGoalMin = (profile as any)?.onboardingData?.personal?.sleepGoal || 450; // 7.5h default
      const lastDurationScore = (dailyRecap as any)?.sleep?.lastDurationScore || null;
      const lastRegularityScore = (dailyRecap as any)?.sleep?.lastRegularityScore || null;
      
      const calculateSleepDuration = (): number => {
        const HARD_FLOOR = 300; // ≤5h → 0 pts
        const FULL_BAND = 60; // mins above goal that still award full points
        const OVER_SOFT = 180; // taper 35→25 across this band
        const MAX_NAP_CREDIT = 90; // cap total nap minutes counted
        const NAP_WEIGHT = 0.5; // naps count at 50%
        
        if (!sleepEpisodes.length) {
          if (lastDurationScore !== null) {
            return Math.max(0.0, Math.min(35.0, 0.8 * lastDurationScore));
          }
          return 17.5; // neutral half-credit
        }
        
        let totalCore = 0;
        let totalNap = 0;
        const confs: number[] = [];
        
        for (const episode of sleepEpisodes) {
          const start = new Date(episode.start);
          const end = new Date(episode.end);
          const mins = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60)));
          
          if (episode.type === 'nap') {
            totalNap += mins;
          } else {
            totalCore += mins;
          }
          confs.push(episode.source === 'wearable' ? 1.0 : 0.9);
        }
        
        const napCredit = Math.min(totalNap, MAX_NAP_CREDIT) * NAP_WEIGHT;
        const totalSleep = totalCore + napCredit;
        
        // Piecewise mapping
        let base: number;
        if (totalSleep <= HARD_FLOOR) {
          base = 0.0;
        } else if (totalSleep < sleepGoalMin) {
          base = 35.0 * (totalSleep - HARD_FLOOR) / (sleepGoalMin - HARD_FLOOR);
        } else if (totalSleep <= sleepGoalMin + FULL_BAND) {
          base = 35.0;
        } else if (totalSleep <= sleepGoalMin + FULL_BAND + OVER_SOFT) {
          base = 35.0 - 10.0 * ((totalSleep - (sleepGoalMin + FULL_BAND)) / OVER_SOFT);
        } else {
          base = 25.0; // oversleep: mild deduction
        }
        
        const avgConf = confs.reduce((sum, c) => sum + c, 0) / confs.length;
        const adj = Math.min(1.0, 0.95 + 0.05 * avgConf); // ~0.955..1.0
        return Math.max(0.0, Math.min(35.0, base * adj));
      };
      
      const calculateSleepRegularity = (): number => {
        const TARGET_VAR = 60.0;
        const MAX_VAR = 180.0;
        const timesMin: number[] = [];
        const confs: number[] = [];
        
        // Collect up to last 7 days
        for (const entry of sleepEntries.slice(-7)) {
          const bed = entry.bed ? new Date(entry.bed) : null;
          const source = entry.source;
          const quick = entry.quick;
          
          if (bed) {
            let m = bed.getHours() * 60 + bed.getMinutes(); // 0..1439
            if (m < 180) m += 1440; // unwrap small post-midnight bedtimes
            timesMin.push(m % 1440);
            confs.push(source === 'wearable' ? 1.00 : 0.85);
          } else if (quick === 'yes' || quick === 'no') {
            // quick mode proxy: "yes" ≈ consistent (23:00), "no" ≈ late (01:00)
            const m = quick === 'yes' ? 23 * 60 : 1 * 60;
            timesMin.push(m);
            confs.push(0.85);
          }
        }
        
        const N = timesMin.length;
        
        // Onboarding / sparse catch
        if (N < 3) {
          if (lastRegularityScore !== null) {
            return Math.max(0.0, Math.min(25.0, 0.8 * lastRegularityScore));
          }
          return 12.5;
        }
        
        // Circular variance (robust around midnight)
        const theta = timesMin.map(t => 2 * Math.PI * (t / 1440.0));
        const C = theta.reduce((sum, a) => sum + Math.cos(a), 0) / N;
        const S = theta.reduce((sum, a) => sum + Math.sin(a), 0) / N;
        const R = Math.sqrt(C * C + S * S); // 0..1; 1 = perfectly regular
        const varMinutes = 720.0 * Math.sqrt(Math.max(0.0, 2 * (1 - R))); // ~0..≥180
        
        let base: number;
        if (varMinutes <= TARGET_VAR) {
          base = 25.0;
        } else if (varMinutes >= MAX_VAR) {
          base = 0.0;
        } else {
          base = 25.0 * (1 - (varMinutes - TARGET_VAR) / (MAX_VAR - TARGET_VAR));
        }
        
        const avgConf = confs.reduce((sum, c) => sum + c, 0) / N;
        const completeness = N / 7.0;
        // Light adjustment; reaches 1.0 when 7 wearable days are present
        const adj = Math.min(1.0, 0.85 + 0.10 * completeness + 0.05 * avgConf);
        return Math.max(0.0, Math.min(25.0, base * adj));
      };
      
      // Combined Sleep (0-60): Duration (0-35) + Regularity (0-25)
      const sleepDuration = calculateSleepDuration();
      const sleepRegularity = calculateSleepRegularity();
      const combinedSleep = Math.max(0.0, Math.min(60.0, sleepDuration + sleepRegularity));
      
      // NEAT Steps (0-25): Your exact formula
      const actualSteps = (dailyRecap as any)?.steps?.actual || 0;
      const stepsGoal = (dailyRecap as any)?.steps?.goal || (profile as any)?.onboardingData?.personal?.stepsGoal || 10000; // Default 10k steps
      const stepsRatio = actualSteps / stepsGoal;
      const neatSteps = Math.min(stepsRatio, 1.0) * 25;
      
      // Stress/Mood (0-15): Your exact formula
      const stressHigh = (dailyRecap as any)?.wellness?.stressHigh || false;
      const moodLow = (dailyRecap as any)?.wellness?.moodLow || false;
      const recoveryActionLogged = (dailyRecap as any)?.wellness?.recoveryActionLogged || false;
      
      let stressMood = 0;
      if (stressHigh || moodLow) {
        stressMood = recoveryActionLogged ? 10 : 0;
      } else {
        stressMood = 15;
      }
      
      return combinedSleep + neatSteps + stressMood;
    };

    // Calculate Consistency Bonus
    const calculateConsistencyBonus = (): number => {
      // Your exact formula
      const historicalScores = (dailyRecap as any)?.peakScores?.last7Days || [];
      const daysAboveThreshold = historicalScores.filter((dayScore: number) => dayScore > 70).length;
      
      let bonus = 0;
      if (daysAboveThreshold >= 6) {
        bonus = 5;
      } else if (daysAboveThreshold >= 4) {
        bonus = 2;
      }
      
      return bonus;
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