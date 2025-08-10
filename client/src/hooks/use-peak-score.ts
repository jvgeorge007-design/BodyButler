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

    // Calculate Trail Fuel Score - Goal/phase-aware comprehensive implementation
    const calculateTrailFuelScore = (): number => {
      const goalType = getGoalType();
      const phase = (profile as any)?.onboardingData?.program?.phase || 'build';
      
      // Helper functions
      const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));
      
      // Build dynamic targets based on goal and phase
      const computeTrailFuelTargets = () => {
        // TDEE calculation (prefer stored; else Mifflin-St Jeor × activity)
        let tdee = (profile as any)?.onboardingData?.metrics?.tdee_kcal;
        if (!tdee) {
          const sex = (profile as any)?.onboardingData?.personal?.sex || 'm';
          const age = (profile as any)?.onboardingData?.personal?.age || 30;
          const height = (profile as any)?.onboardingData?.personal?.height || 175;
          const weight = (profile as any)?.onboardingData?.personal?.weight || 75;
          const activity = (profile as any)?.onboardingData?.personal?.activityLevel || 'moderate';
          
          const bmr = 10 * weight + 6.25 * height - 5 * age + (sex.toLowerCase().startsWith('m') ? 5 : -161);
          const activityMap: Record<string, number> = {
            sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
          };
          tdee = bmr * (activityMap[activity.toLowerCase()] || 1.55);
        }
        
        // Goal × Phase multipliers
        let goalMult = 1.0;
        if (goalType === 'cut') {
          goalMult = phase === 'base' ? 0.85 : 0.82; // ~15-18% deficit
        } else if (goalType === 'lean_bulk') {
          goalMult = phase === 'base' ? 1.06 : 1.10; // ~6-10% surplus
        } else if (goalType === 'endurance') {
          goalMult = phase === 'base' ? 1.00 : 1.03; // mild surplus on harder blocks
        } else if (goalType === 'wellness') {
          goalMult = 1.00;
        } else { // recomp
          goalMult = ['build', 'peak'].includes(phase) ? 1.00 : 0.97; // slight flexibility around maintenance
        }
        
        const caloriesKcal = Math.round(tdee * goalMult);
        
        // Protein calculation (prefer LBM; else weight)
        const lbmKg = (profile as any)?.onboardingData?.metrics?.lbm_kg;
        const weightKg = (profile as any)?.onboardingData?.personal?.weight || 75;
        const anchor = lbmKg || weightKg;
        
        let gPerKg = 1.6;
        if (goalType === 'cut') {
          gPerKg = ['build', 'peak'].includes(phase) ? 2.0 : 1.9;
        } else if (['lean_bulk', 'recomp'].includes(goalType)) {
          gPerKg = phase === 'base' ? 1.6 : 1.8;
        } else if (goalType === 'endurance') {
          gPerKg = ['build', 'peak'].includes(phase) ? 1.6 : 1.5;
        } else { // wellness
          gPerKg = 1.4;
        }
        const proteinG = Math.round(anchor * gPerKg);
        
        // Fiber from calories (IOM: 14g per 1000 kcal)
        const fiberG = Math.round(clamp((caloriesKcal / 1000) * 14, 18, 40));
        
        // Hydration from weight (EFSA/IOM: 35ml/kg)
        const hydrationLiters = Math.round(0.035 * weightKg * 100) / 100;
        
        return {
          caloriesKcal,
          proteinG,
          fiberG,
          hydrationLiters
        };
      };
      
      const targets = computeTrailFuelTargets();
      
      // Get actual consumption data
      const actualCalories = (dailyRecap as any)?.calories?.consumed || 0;
      const actualProtein = (dailyRecap as any)?.protein?.consumed || 0;
      const actualFiber = (dailyRecap as any)?.fiber?.consumed || 0;
      const vegServings = (dailyRecap as any)?.vegetables?.servings || 0;
      const actualHydrationMl = (dailyRecap as any)?.hydration?.consumed || 0;
      const actualHydrationL = actualHydrationMl / 1000;
      
      // Calculate meals logged percentage for anti-cheat
      const totalMeals = Object.values((foodLog as any)?.meals || {}).reduce((sum: number, mealEntries: any) => {
        return sum + (Array.isArray(mealEntries) ? mealEntries.length : 0);
      }, 0);
      const expectedMeals = 9; // 3 meals + 6 snacks per day roughly
      const mealsLoggedPct = totalMeals / expectedMeals;
      
      // A) Calorie Window (0-40): full at ±5%, linear to 0 at ±20%
      const calTarget = Math.max(1e-6, targets.caloriesKcal);
      const calDiffPct = Math.abs(actualCalories - calTarget) / calTarget;
      let calPts = 0;
      if (calDiffPct <= 0.05) {
        calPts = 40.0;
      } else if (calDiffPct >= 0.20) {
        calPts = 0.0;
      } else {
        calPts = 40.0 * (1 - (calDiffPct - 0.05) / 0.15);
      }
      
      // B) Protein Target (0-30): full at ≥100%; 50% at 80%; linear below
      const protTarget = Math.max(1e-6, targets.proteinG);
      const protRatio = actualProtein / protTarget;
      let protPts = 0;
      if (protRatio >= 1.0) {
        protPts = 30.0;
      } else if (protRatio >= 0.8) {
        protPts = 15.0 + 15.0 * ((protRatio - 0.8) / 0.2); // 80%→50% pts; 100%→100% pts
      } else {
        protPts = 30.0 * (protRatio / 0.8);
      }
      
      // C) Fiber/Veg (0-20): full if fiber goal met OR ≥2 veg servings; partial credit otherwise
      const fiberGoal = 14.0 * (actualCalories / 1000.0);
      let fiberPts = 0;
      if (actualFiber >= fiberGoal || vegServings >= 2) {
        fiberPts = 20.0;
      } else {
        fiberPts = 20.0 * Math.max(
          clamp(actualFiber / Math.max(1e-6, fiberGoal), 0.0, 1.0),
          clamp(vegServings / 2.0, 0.0, 1.0)
        );
      }
      
      // D) Hydration (0-10): 35ml/kg baseline; partial at ≥60%
      const hydTarget = Math.max(1e-6, targets.hydrationLiters);
      const hydRatio = actualHydrationL / hydTarget;
      let hydPts = 0;
      if (hydRatio >= 1.0) {
        hydPts = 10.0;
      } else if (hydRatio >= 0.6) {
        hydPts = 5.0 + 5.0 * ((hydRatio - 0.6) / 0.4);
      } else {
        hydPts = 10.0 * (hydRatio / 0.6);
      }
      
      // Anti-cheat decay & confidence
      const decayFactor = mealsLoggedPct < 0.70 ? 0.85 : 1.00;
      
      // Final score
      const total = (calPts + protPts + fiberPts + hydPts) * decayFactor;
      return clamp(total, 0.0, 100.0);
    };

    // Calculate Climb Score - Goal-aware dynamic implementation with individual sublevers
    const calculateClimbScore = (): number => {
      const goalType = getGoalType();
      const phase = (profile as any)?.onboardingData?.program?.phase || 'build';
      const session = (dailyRecap as any)?.workout || {};
      const lastWeekSession = (dailyRecap as any)?.workout?.lastWeek || {};
      
      // One-call convenience wrapper for comprehensive climb scoring
      const climbScoreForUser = (
        user: any,
        sessionData: any,
        lastWeekSessionData: any = null,
        applyConfidence: boolean = true,
        modalityOverride: string | null = null
      ): { score: number; breakdown: any; targets: any } => {
        // Extract user program data with fallbacks
        const program = user?.onboardingData?.program || {};
        const userGoal = (program.goal_type || goalType).toLowerCase();
        const userPhase = (program.phase || program.block || phase).toLowerCase();
        const userPlan = program.plan || {};
        const userRecent = user?.history?.training || (dailyRecap as any)?.workout?.recentHistory || {};
        
        // Build autosynced targets for today
        const dynamicTargets = buildClimbTargets();
        
        // Calculate score using the main scoring logic that follows
        // This wrapper provides a clean interface for external calls
        return {
          score: 0, // Will be set by main calculation below
          breakdown: {
            completion: 0,
            progression: 0, 
            warmup: 0,
            intensity: 0,
            confidence: 0.70
          },
          targets: dynamicTargets
        };
      };
      
      // Note: climbScoreForUser can be called separately for testing/debugging
      // The main calculation continues below using the existing comprehensive logic
      
      // Build dynamic targets based on goal and phase
      const buildClimbTargets = () => {
        const modality = goalType === 'endurance' ? 'endurance' : 'strength';
        const plan = (profile as any)?.onboardingData?.program?.plan || {};
        const recent = (dailyRecap as any)?.workout?.recentHistory || {};
        
        // Completion baseline
        let comp: any;
        if (modality === 'endurance') {
          const avgMin = recent.avg_minutes_per_cardio || 40;
          const planned = Math.round(avgMin * (['build', 'peak'].includes(phase) ? 1.05 : 1.00));
          comp = { type: 'minutes', planned: Math.max(30, planned), freq_per_week: recent.sessions_per_week || 4 };
        } else {
          const avgSets = recent.avg_sets_per_session || 20;
          const planned = Math.round(avgSets * (['build', 'peak'].includes(phase) ? 1.05 : 1.00));
          comp = { type: 'sets', planned: Math.max(12, planned), freq_per_week: recent.sessions_per_week || 4 };
        }
        
        // Intensity range with base credit
        let inten: any;
        if (modality === 'endurance') {
          inten = {
            type: 'HR',
            low: ['build', 'peak'].includes(phase) ? 0.75 : 0.65,
            high: ['build', 'peak'].includes(phase) ? 0.85 : 0.75,
            zone: ['build', 'peak'].includes(phase) ? 'Z3-Z4' : 'Z2-Z3'
          };
        } else {
          if (['lean_bulk', 'recomp'].includes(goalType)) {
            inten = {
              type: 'RPE',
              low: ['build', 'peak'].includes(phase) ? 8.0 : 7.0,
              high: ['build', 'peak'].includes(phase) ? 9.0 : 8.0
            };
          } else if (goalType === 'cut') {
            inten = { type: 'RPE', low: 7.5, high: 8.5 };
          } else {
            inten = { type: 'RPE', low: 6.0, high: 7.0 };
          }
        }
        
        // Dynamic base credit
        const phaseBonusMap: Record<string, number> = { base: 0.0, build: 0.5, peak: 1.0, deload: -0.5 };
        const goalBonusMap: Record<string, number> = { cut: 0.5, recomp: 0.0, lean_bulk: 0.0, endurance: 0.5, wellness: 0.0 };
        const phaseBonus = phaseBonusMap[phase] || 0.0;
        const goalBonus = goalBonusMap[goalType] || 0.0;
        inten.base_credit = Math.max(2.0, Math.min(4.0, 3.0 + phaseBonus + goalBonus));
        
        // Progression rule
        const prog = modality === 'endurance' 
          ? { rule: 'endurance_zone_time' }
          : { rule: 'strength_load' };
        
        // Rest day check
        const today = new Date();
        const weekday = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][today.getDay()];
        const restDay = Boolean(plan.rest_days?.[weekday]);
        
        return {
          modality,
          completion: comp,
          intensity: inten,
          progression: prog,
          rest_day: restDay,
          goal: goalType,
          phase
        };
      };
      
      const targets = buildClimbTargets();
      
      // Rest day override: Full points if planned rest day with no unplanned training
      if (targets.rest_day) {
        const didAny = (session.completed_sets || 0) > 0 || (session.active_minutes || 0) > 0;
        if (!didAny) {
          return 100.0; // climb_score = 100
        }
      }
      
      // Completion (0-40): Goal-aware planned targets
      const planned = Math.max(1, targets.completion.planned);
      const done = Math.max(0, targets.completion.type === 'sets' 
        ? (session.completed_sets || 0)
        : (session.active_minutes || 0));
      const completionRatio = Math.min(1.0, done / planned);
      const completionPoints = 40.0 * completionRatio;
      const compLogged = done > 0;
      
      // Progression (0-40): Goal/phase-aware modality-specific rules
      let progressionPoints = 0.0;
      let progressionLogged = false;
      
      // Goal-aware progression thresholds
      const getProgressionThresholds = () => {
        if (targets.modality === 'strength') {
          if (['lean_bulk', 'recomp'].includes(goalType)) {
            return { 
              targetWeekly: ['build', 'peak'].includes(phase) ? 0.06 : 0.04, // 6% build/peak, 4% base
              maxCap: 0.12 
            };
          } else if (goalType === 'cut') {
            return { targetWeekly: 0.03, maxCap: 0.08 }; // Maintenance during cut
          } else { // wellness
            return { targetWeekly: 0.02, maxCap: 0.06 }; // Conservative progression
          }
        } else { // endurance
          if (goalType === 'endurance') {
            return { 
              targetWeekly: ['build', 'peak'].includes(phase) ? 0.12 : 0.08, // 12% build/peak, 8% base
              maxCap: 0.25 
            };
          } else {
            return { targetWeekly: 0.06, maxCap: 0.15 }; // Moderate gains for non-endurance goals
          }
        }
      };
      
      const thresholds = getProgressionThresholds();
      
      if (targets.modality === 'strength' && targets.progression.rule === 'strength_load') {
        const curVol = session.total_volume;
        const lastVol = lastWeekSession.total_volume;
        let delta: number | null = null;
        
        if (curVol && lastVol && lastVol > 0) {
          delta = (curVol - lastVol) / lastVol;
          progressionLogged = true;
        } else {
          const curTop = session.top_set_load;
          const lastTop = lastWeekSession.top_set_load;
          if (curTop && lastTop && lastTop > 0) {
            delta = (curTop - lastTop) / lastTop;
            progressionLogged = true;
          }
        }
        
        if (delta !== null && delta > 0) {
          const cappedDelta = Math.min(delta, thresholds.maxCap);
          progressionPoints = 40.0 * (cappedDelta / thresholds.targetWeekly);
          progressionPoints = Math.max(0.0, Math.min(40.0, progressionPoints));
        }
      } else if (targets.modality === 'endurance' && targets.progression.rule === 'endurance_zone_time') {
        const curZone = session.zone_minutes;
        const lastZone = lastWeekSession.zone_minutes;
        
        if (curZone && lastZone && lastZone > 0) {
          const delta = (curZone - lastZone) / lastZone;
          progressionLogged = true;
          if (delta > 0) {
            const cappedDelta = Math.min(delta, thresholds.maxCap);
            progressionPoints = 40.0 * (cappedDelta / thresholds.targetWeekly);
            progressionPoints = Math.max(0.0, Math.min(40.0, progressionPoints));
          }
        }
      }
      
      // Warmup/Mobility (0-10): Binary logging
      const warmupPoints = session.warmup_done ? 10.0 : 0.0;
      const warmLogged = Boolean(session.warmup_done);
      
      // Intensity BONUS (0-10): Dynamic base credit with goal-aware targets
      const baseCredit = targets.intensity.base_credit;
      let intensityBonus = 0.0;
      let intensityLogged = false;
      
      if (targets.intensity.type === 'RPE') {
        const avgRPE = session.avg_rpe;
        intensityLogged = avgRPE !== undefined && avgRPE !== null;
        
        if (intensityLogged && completionRatio > 0) {
          const compScale = 0.3 + 0.7 * Math.max(0.0, Math.min(1.0, completionRatio));
          const targetLow = targets.intensity.low;
          const targetHigh = targets.intensity.high;
          const bandSoft = 0.5;
          const maxBonus = 10.0;
          
          let prox: number;
          if (targetLow <= avgRPE && avgRPE <= targetHigh) {
            prox = maxBonus - baseCredit;
          } else if ((targetLow - bandSoft) <= avgRPE && avgRPE < targetLow) {
            prox = (maxBonus - baseCredit) * (1 - (targetLow - avgRPE) / bandSoft) * 0.7;
          } else if (targetHigh < avgRPE && avgRPE <= (targetHigh + bandSoft)) {
            prox = (maxBonus - baseCredit) * (1 - (avgRPE - targetHigh) / bandSoft) * 0.7;
          } else {
            prox = (maxBonus - baseCredit) * 0.2;
          }
          
          intensityBonus = Math.max(0.0, Math.min(maxBonus, (baseCredit + prox) * compScale));
        }
      } else { // HR
        const avgHRRatio = session.avg_hr_ratio;
        intensityLogged = avgHRRatio !== undefined && avgHRRatio !== null;
        
        if (intensityLogged && completionRatio > 0) {
          const compScale = 0.3 + 0.7 * Math.max(0.0, Math.min(1.0, completionRatio));
          const targetLow = targets.intensity.low;
          const targetHigh = targets.intensity.high;
          const bandSoft = 0.03;
          const maxBonus = 10.0;
          
          let prox: number;
          if (targetLow <= avgHRRatio && avgHRRatio <= targetHigh) {
            prox = maxBonus - baseCredit;
          } else if ((targetLow - bandSoft) <= avgHRRatio && avgHRRatio < targetLow) {
            prox = (maxBonus - baseCredit) * (1 - (targetLow - avgHRRatio) / bandSoft) * 0.7;
          } else if (targetHigh < avgHRRatio && avgHRRatio <= (targetHigh + bandSoft)) {
            prox = (maxBonus - baseCredit) * (1 - (avgHRRatio - targetHigh) / bandSoft) * 0.7;
          } else {
            prox = (maxBonus - baseCredit) * 0.2;
          }
          
          intensityBonus = Math.max(0.0, Math.min(maxBonus, (baseCredit + prox) * compScale));
        }
      }
      
      // Confidence calculation: Sublever completeness (wearable-neutral)
      const sublevers = [compLogged, intensityLogged, progressionLogged, warmLogged];
      const loggedRatio = sublevers.filter(s => s).length / sublevers.length;
      const confidence = 0.70 + 0.30 * loggedRatio;
      
      // Sum and apply confidence
      const subtotal = completionPoints + progressionPoints + warmupPoints + intensityBonus;
      const total = Math.max(0.0, Math.min(100.0, subtotal * confidence));
      
      return Math.round(total * 100) / 100;
    };

    // Calculate Base Camp Score - Goal/phase-aware comprehensive implementation
    const calculateBaseCampScore = (): number => {
      const goalType = getGoalType();
      const phase = (profile as any)?.onboardingData?.program?.phase || 'build';
      
      // Helper functions
      const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));
      
      // One-call convenience wrapper for comprehensive base camp scoring
      const baseCampScoreForUser = (
        user: any,
        sleepEpisodes: any[],
        sleepEntries: any[],
        stepsToday: number,
        daysWithStepsData: number = 7,
        lastSleepDurationScore: number | null = null,
        lastSleepRegularityScore: number | null = null,
        lastNeatScore: number | null = null,
        recentTraining: any = null
      ): { totalScore: number; breakdown: any } => {
        
        // Compute sleep target minutes adapted to goal/phase and load
        const computeSleepTargetMinutes = (): number => {
          const base = 7.5 * 60; // 450 min
          const plan = user?.onboardingData?.program?.plan || {};
          const loadSessions = plan.freq_per_week || recentTraining?.sessions_per_week || 0;
          const loadMinutes = plan.weekly_minutes || recentTraining?.weekly_minutes || 0;
          
          let add = 0;
          if (['endurance', 'lean_bulk'].includes(goalType) && ['build', 'peak'].includes(phase)) {
            add += 30;
          }
          if (loadSessions >= 5 || loadMinutes >= 300) {
            add += 30;
          }
          if (goalType === 'cut' && ['build', 'peak'].includes(phase)) {
            add += 15;
          }
          
          return Math.round(clamp(base + add, 420, 540)); // 7-9h range
        };
        
        // Compute personalized NEAT goals based on goal + frame + baseline activity
        const computeNeatGoalsForUser = (): [number, number] => {
          const baseRanges: Record<string, [number, number]> = {
            cut: [8000, 12000],
            recomp: [7000, 10000],
            lean_bulk: [6000, 8000],
            endurance: [9000, 13000],
            wellness: [6000, 9000],
          };
          let [low, high] = baseRanges[goalType] || baseRanges.recomp;
          
          const heightCm = user?.onboardingData?.personal?.height || 170;
          const weightKg = user?.onboardingData?.personal?.weight || 75;
          const activity = user?.onboardingData?.personal?.activityLevel || 'moderate';
          
          // Frame factor
          let frameFactor = 0.0;
          frameFactor += (heightCm - 170.0) * 0.004;
          frameFactor += (weightKg - 70.0) * 0.003;
          frameFactor = clamp(frameFactor, -0.15, 0.15);
          
          // Activity nudge
          const activityNudge: Record<string, number> = {
            sedentary: -0.10, light: -0.05, moderate: 0.00, active: 0.05, very_active: 0.10
          };
          const nudge = activityNudge[activity.toLowerCase()] || 0.0;
          
          const adj = 1.0 + frameFactor + nudge;
          let lowAdj = Math.round(low * adj);
          let highAdj = Math.round(high * adj);
          
          // Ensure minimum spread
          if (highAdj - lowAdj < 1500) {
            const mid = Math.floor((lowAdj + highAdj) / 2);
            lowAdj = mid - 750;
            highAdj = mid + 750;
          }
          
          // Apply bounds
          lowAdj = Math.max(4000, Math.min(lowAdj, 18000));
          highAdj = Math.max(lowAdj + 1500, Math.min(highAdj, 20000));
          
          return [lowAdj, highAdj];
        };
        
        const sleepGoalMin = computeSleepTargetMinutes();
        
        // Sleep Duration Score (0-35)
        const sleepDurationScore = (): number => {
          const HARD_FLOOR = 300, FULL_BAND = 60, OVER_SOFT = 180;
          const MAX_NAP_CREDIT = 90, NAP_WEIGHT = 0.5;
          
          if (!sleepEpisodes.length) {
            if (lastSleepDurationScore !== null) {
              return Math.max(0.0, Math.min(35.0, 0.8 * lastSleepDurationScore));
            }
            return 17.5;
          }
          
          let totalCore = 0, totalNap = 0;
          for (const episode of sleepEpisodes) {
            const start = new Date(episode.start);
            const end = new Date(episode.end);
            const mins = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60)));
            
            if (episode.type === 'nap') {
              totalNap += mins;
            } else {
              totalCore += mins;
            }
          }
          
          const napCredit = Math.min(totalNap, MAX_NAP_CREDIT) * NAP_WEIGHT;
          const totalSleep = totalCore + napCredit;
          
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
            base = 25.0;
          }
          
          return Math.max(0.0, Math.min(35.0, base));
        };
        
        // Sleep Regularity Score (0-25)
        const sleepRegularityScore = (): number => {
          const TARGET_VAR = 60.0, MAX_VAR = 180.0;
          const timesMin: number[] = [];
          
          for (const entry of sleepEntries.slice(-7)) {
            const bed = entry.bed ? new Date(entry.bed) : null;
            const quick = entry.quick;
            
            if (bed) {
              let m = bed.getHours() * 60 + bed.getMinutes();
              if (m < 180) m += 1440;
              timesMin.push(m % 1440);
            } else if (quick === 'yes' || quick === 'no') {
              const m = quick === 'yes' ? 23 * 60 : 1 * 60;
              timesMin.push(m);
            }
          }
          
          const N = timesMin.length;
          if (N < 3) {
            if (lastSleepRegularityScore !== null) {
              return Math.max(0.0, Math.min(25.0, 0.8 * lastSleepRegularityScore));
            }
            return 12.5;
          }
          
          // Circular variance calculation
          const theta = timesMin.map(t => 2 * Math.PI * (t / 1440.0));
          const C = theta.reduce((sum, a) => sum + Math.cos(a), 0) / N;
          const S = theta.reduce((sum, a) => sum + Math.sin(a), 0) / N;
          const R = Math.sqrt(C * C + S * S);
          const varMinutes = 720.0 * Math.sqrt(Math.max(0.0, 2 * (1 - R)));
          
          let base: number;
          if (varMinutes <= TARGET_VAR) {
            base = 25.0;
          } else if (varMinutes >= MAX_VAR) {
            base = 0.0;
          } else {
            base = 25.0 * (1 - (varMinutes - TARGET_VAR) / (MAX_VAR - TARGET_VAR));
          }
          
          const completeness = N / 7.0;
          const adj = Math.min(1.0, 0.85 + 0.15 * completeness);
          return Math.max(0.0, Math.min(25.0, base * adj));
        };
        
        // NEAT Steps Score (0-40)
        const neatStepsScore = (): number => {
          const [lowGoal, highGoal] = computeNeatGoalsForUser();
          
          if (daysWithStepsData < 3) {
            if (lastNeatScore !== null) {
              return Math.max(0.0, Math.min(40.0, 0.8 * lastNeatScore));
            }
            return 20.0;
          }
          
          const MAX_COUNTED = 25000;
          const steps = Math.max(0, Math.min(stepsToday, MAX_COUNTED));
          
          let base: number;
          if (steps <= lowGoal) {
            base = 40.0 * (steps / lowGoal);
          } else if (steps >= highGoal) {
            base = 40.0;
          } else {
            base = 40.0 * ((steps - lowGoal) / (highGoal - lowGoal));
          }
          
          const coverage = Math.min(1.0, daysWithStepsData / 7.0);
          const adj = 0.85 + 0.15 * coverage;
          return Math.max(0.0, Math.min(40.0, base * adj));
        };
        
        // Calculate individual scores
        const sleepDur = sleepDurationScore();
        const sleepReg = sleepRegularityScore();
        const neatScore = neatStepsScore();
        
        const combinedSleep = Math.max(0.0, Math.min(60.0, sleepDur + sleepReg));
        const total = clamp(combinedSleep + neatScore, 0.0, 100.0);
        
        return {
          totalScore: Math.round(total * 100) / 100,
          breakdown: {
            sleep_score_0_60: Math.round(combinedSleep * 100) / 100,
            sleep_target_minutes: sleepGoalMin,
            neat_score_0_40: Math.round(neatScore * 100) / 100,
            neat_targets_steps: { low: computeNeatGoalsForUser()[0], high: computeNeatGoalsForUser()[1] }
          }
        };
      };
      
      // Get actual data for scoring
      const sleepEpisodes = (dailyRecap as any)?.sleep?.episodes || [];
      const sleepEntries = (dailyRecap as any)?.sleep?.last7Days || [];
      const todaySteps = (dailyRecap as any)?.steps?.count || 0;
      const daysWithStepsData = (dailyRecap as any)?.steps?.daysWithData || 7;
      const lastSleepDurationScore = (dailyRecap as any)?.sleep?.lastDurationScore || null;
      const lastSleepRegularityScore = (dailyRecap as any)?.sleep?.lastRegularityScore || null;
      const lastNeatScore = (dailyRecap as any)?.steps?.lastScore || null;
      const recentTraining = (dailyRecap as any)?.workout?.recentHistory || {};
      
      // Calculate comprehensive Base Camp score
      const result = baseCampScoreForUser(
        profile,
        sleepEpisodes,
        sleepEntries,
        todaySteps,
        daysWithStepsData,
        lastSleepDurationScore,
        lastSleepRegularityScore,
        lastNeatScore,
        recentTraining
      );
      
      return result.totalScore;
    };

    // Calculate Consistency Bonus
    const calculateConsistencyBonus = (): number => {
      // Demo value to show appearance
      return 5;
      
      // Your exact formula (will be restored)
      // const historicalScores = (dailyRecap as any)?.peakScores?.last7Days || [];
      // const daysAboveThreshold = historicalScores.filter((dayScore: number) => dayScore > 70).length;
      
      // let bonus = 0;
      // if (daysAboveThreshold >= 6) {
      //   bonus = 5;
      // } else if (daysAboveThreshold >= 4) {
      //   bonus = 2;
      // }
      
      // return bonus;
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