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

    // Calculate Climb Score - Goal-aware dynamic implementation with individual sublevers
    const calculateClimbScore = (): number => {
      const goalType = getGoalType();
      const phase = (profile as any)?.onboardingData?.program?.phase || 'build';
      const session = (dailyRecap as any)?.workout || {};
      const lastWeekSession = (dailyRecap as any)?.workout?.lastWeek || {};
      
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
      
      // Completion Sublever (0-40): Goal-aware planned targets
      const calculateCompletion = (): number => {
        const planned = Math.max(1, targets.completion.planned);
        const done = Math.max(0, targets.completion.type === 'sets' 
          ? (session.completed_sets || 0)
          : (session.active_minutes || 0));
        const completionRatio = Math.min(1.0, done / planned);
        return 40.0 * completionRatio;
      };
      
      // Progression Sublever (0-40): Goal/phase-aware modality-specific rules
      const calculateProgression = (): number => {
        // Goal-aware progression thresholds
        const getProgressionThresholds = () => {
          if (targets.modality === 'strength') {
            // Different goals require different progression rates
            if (['lean_bulk', 'recomp'].includes(goalType)) {
              return { 
                targetWeekly: ['build', 'peak'].includes(phase) ? 0.06 : 0.04, // 6% build/peak, 4% base
                maxCap: 0.12 // 12% max
              };
            } else if (goalType === 'cut') {
              return { 
                targetWeekly: 0.03, // Maintenance during cut
                maxCap: 0.08 
              };
            } else { // wellness
              return { 
                targetWeekly: 0.02, // Conservative progression
                maxCap: 0.06 
              };
            }
          } else { // endurance
            if (goalType === 'endurance') {
              return { 
                targetWeekly: ['build', 'peak'].includes(phase) ? 0.12 : 0.08, // 12% build/peak, 8% base
                maxCap: 0.25 // 25% max
              };
            } else {
              return { 
                targetWeekly: 0.06, // Moderate endurance gains for non-endurance goals
                maxCap: 0.15 
              };
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
          } else {
            const curTop = session.top_set_load;
            const lastTop = lastWeekSession.top_set_load;
            if (curTop && lastTop && lastTop > 0) {
              delta = (curTop - lastTop) / lastTop;
            }
          }
          
          if (delta !== null && delta > 0) {
            const cappedDelta = Math.min(delta, thresholds.maxCap);
            const progressionPoints = 40.0 * (cappedDelta / thresholds.targetWeekly);
            return Math.max(0.0, Math.min(40.0, progressionPoints));
          }
        } else if (targets.modality === 'endurance' && targets.progression.rule === 'endurance_zone_time') {
          const curZone = session.zone_minutes;
          const lastZone = lastWeekSession.zone_minutes;
          
          if (curZone && lastZone && lastZone > 0) {
            const delta = (curZone - lastZone) / lastZone;
            if (delta > 0) {
              const cappedDelta = Math.min(delta, thresholds.maxCap);
              const progressionPoints = 40.0 * (cappedDelta / thresholds.targetWeekly);
              return Math.max(0.0, Math.min(40.0, progressionPoints));
            }
          }
        }
        return 0.0;
      };
      
      // Warmup/Mobility Sublever (0-10): Binary logging
      const calculateWarmup = (): number => {
        return session.warmup_done ? 10.0 : 0.0;
      };
      
      // Intensity Bonus Sublever (0-10): Dynamic base credit with goal-aware targets
      const calculateIntensityBonus = (): number => {
        const completion = calculateCompletion();
        const completionRatio = completion / 40.0;
        const baseCredit = targets.intensity.base_credit;
        
        if (targets.intensity.type === 'RPE') {
          const avgRPE = session.avg_rpe;
          
          if (avgRPE !== undefined && avgRPE !== null && completionRatio > 0) {
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
            
            return Math.max(0.0, Math.min(maxBonus, (baseCredit + prox) * compScale));
          }
        } else { // HR
          const avgHRRatio = session.avg_hr_ratio;
          
          if (avgHRRatio !== undefined && avgHRRatio !== null && completionRatio > 0) {
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
            
            return Math.max(0.0, Math.min(maxBonus, (baseCredit + prox) * compScale));
          }
        }
        return 0.0;
      };
      
      // Calculate individual sublever scores
      const completion = calculateCompletion();
      const progression = calculateProgression();
      const warmup = calculateWarmup();
      const intensityBonus = calculateIntensityBonus();
      
      // Climb Confidence: Sublever completeness (wearable-neutral)
      const compLogged = (session.completed_sets || 0) > 0 || (session.active_minutes || 0) > 0;
      const intensityLogged = (session.avg_rpe !== undefined && session.avg_rpe !== null) || 
                             (session.avg_hr_ratio !== undefined && session.avg_hr_ratio !== null);
      const progressionLogged = Boolean(session.total_volume || session.top_set_load || session.zone_minutes);
      const warmupLogged = Boolean(session.warmup_done);
      
      const sublevers = [compLogged, intensityLogged, progressionLogged, warmupLogged];
      const loggedRatio = sublevers.filter(s => s).length / sublevers.length;
      const confidence = 0.70 + 0.30 * loggedRatio;
      
      // Sum and apply confidence
      const subtotal = completion + progression + warmup + intensityBonus;
      const total = Math.max(0.0, Math.min(100.0, subtotal * confidence));
      
      return Math.round(total * 100) / 100;
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
        
        // Onboarding/sparse fallback
        if (!sleepEpisodes.length) {
          if (lastDurationScore !== null) {
            return Math.max(0.0, Math.min(35.0, 0.8 * lastDurationScore));
          }
          return 17.5; // neutral half-credit
        }
        
        // Aggregate durations
        let totalCore = 0;
        let totalNap = 0;
        
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
        
        return Math.max(0.0, Math.min(35.0, base));
      };
      
      const calculateSleepRegularity = (): number => {
        const TARGET_VAR = 60.0;
        const MAX_VAR = 180.0;
        const timesMin: number[] = [];
        
        // Collect up to last 7 days
        for (const entry of sleepEntries.slice(-7)) {
          const bed = entry.bed ? new Date(entry.bed) : null;
          const quick = entry.quick;
          
          if (bed) {
            let m = bed.getHours() * 60 + bed.getMinutes(); // 0..1439
            if (m < 180) m += 1440; // unwrap small post-midnight bedtimes
            timesMin.push(m % 1440);
          } else if (quick === 'yes' || quick === 'no') {
            // quick mode proxy: "yes" ≈ consistent (23:00), "no" ≈ late (01:00)
            const m = quick === 'yes' ? 23 * 60 : 1 * 60;
            timesMin.push(m);
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
        
        // Base score from variance
        let base: number;
        if (varMinutes <= TARGET_VAR) {
          base = 25.0;
        } else if (varMinutes >= MAX_VAR) {
          base = 0.0;
        } else {
          base = 25.0 * (1 - (varMinutes - TARGET_VAR) / (MAX_VAR - TARGET_VAR));
        }
        
        // Completeness-only adjustment (no wearable/source effects)
        const completeness = N / 7.0;
        const adj = Math.min(1.0, 0.85 + 0.15 * completeness); // 0.85..1.0 based solely on coverage
        return Math.max(0.0, Math.min(25.0, base * adj));
      };
      
      // Combined Sleep (0-60): Duration (0-35) + Regularity (0-25)
      const sleepDuration = calculateSleepDuration();
      const sleepRegularity = calculateSleepRegularity();
      const combinedSleep = Math.max(0.0, Math.min(60.0, sleepDuration + sleepRegularity));
      
      // NEAT Steps (0-40): Goal-aware + size/activity adjustments
      const todaySteps = (dailyRecap as any)?.steps?.count || 0;
      const daysWithStepsData = (dailyRecap as any)?.steps?.daysWithData || 0;
      const lastStepsScore = (dailyRecap as any)?.steps?.lastScore || null;
      
      const calculateNeatSteps = (): number => {
        // Compute personalized goals based on user profile
        const computeNeatGoals = (): [number, number] => {
          const goalType = getGoalType();
          const base: Record<string, [number, number]> = {
            cut: [8000, 12000],
            recomp: [7000, 10000],
            lean_bulk: [6000, 8000],
            endurance: [9000, 13000],
            wellness: [6000, 9000],
          };
          let [low, high] = base[goalType] || base.recomp;
          
          // Frame adjustments
          const heightCm = (profile as any)?.onboardingData?.personal?.height || 170;
          const weightKg = (profile as any)?.onboardingData?.personal?.weight || 70;
          let frameFactor = 0.0;
          frameFactor += (heightCm - 170.0) * 0.004;
          frameFactor += (weightKg - 70.0) * 0.003;
          frameFactor = Math.max(-0.15, Math.min(0.15, frameFactor));
          
          // Activity level adjustments
          const activityLevel = (profile as any)?.onboardingData?.activity?.currentLevel || 'moderate';
          const activityNudge: Record<string, number> = {
            sedentary: -0.10, light: -0.05, moderate: 0.00, active: 0.05, very_active: 0.10
          };
          const nudge = activityNudge[activityLevel] || 0.00;
          
          const adj = 1.0 + frameFactor + nudge;
          let lowAdj = Math.round(low * adj);
          let highAdj = Math.round(high * adj);
          
          // Ensure minimum range
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
        
        const [lowGoal, highGoal] = computeNeatGoals();
        
        // Onboarding / sparse history catch
        if (daysWithStepsData < 3) {
          if (lastStepsScore !== null) {
            return Math.max(0.0, Math.min(40.0, 0.8 * lastStepsScore));
          }
          return 20.0; // neutral half-credit for 0-40 scale
        }
        
        const MAX_COUNTED = 25000;
        const steps = Math.max(0, Math.min(todaySteps, MAX_COUNTED));
        
        // Piecewise scoring
        let base: number;
        if (steps <= lowGoal) {
          base = 40.0 * (steps / lowGoal);
        } else if (steps >= highGoal) {
          base = 40.0;
        } else {
          base = 40.0 * ((steps - lowGoal) / (highGoal - lowGoal));
        }
        
        // Coverage-only adjustment (0.85..1.00)
        const coverage = Math.min(1.0, daysWithStepsData / 7.0);
        const adj = 0.85 + 0.15 * coverage;
        return Math.max(0.0, Math.min(40.0, base * adj));
      };
      
      const neatSteps = calculateNeatSteps();
      
      // Base Camp: Sleep (60) + NEAT (40) = 100 total
      return combinedSleep + neatSteps;
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