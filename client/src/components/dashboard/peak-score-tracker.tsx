import { useMemo } from "react";

interface PeakScoreTrackerProps {
  trailFuelScore: number;
  climbScore: number;
  baseCampScore: number;
  consistencyBonus: number;
  goalType: 'cut' | 'lean_bulk' | 'recomp' | 'endurance' | 'wellness';
  activityStreak: number;
}

export default function PeakScoreTracker({
  trailFuelScore,
  climbScore,
  baseCampScore,
  consistencyBonus,
  goalType,
  activityStreak
}: PeakScoreTrackerProps) {
  const goalWeights = {
    cut: { trailFuel: 50, climb: 30, baseCamp: 20 },
    lean_bulk: { trailFuel: 35, climb: 45, baseCamp: 20 },
    recomp: { trailFuel: 40, climb: 40, baseCamp: 20 },
    endurance: { trailFuel: 35, climb: 40, baseCamp: 25 },
    wellness: { trailFuel: 40, climb: 30, baseCamp: 30 }
  };

  const weights = goalWeights[goalType];
  
  const weightedScore = useMemo(() => {
    const baseScore = (
      (trailFuelScore * weights.trailFuel) +
      (climbScore * weights.climb) +
      (baseCampScore * weights.baseCamp)
    ) / 100;
    
    return Math.min(100, baseScore + consistencyBonus);
  }, [trailFuelScore, climbScore, baseCampScore, weights, consistencyBonus]);

  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calculate segment lengths based on weights and scores
  const calculateSegmentLength = (weight: number, score: number) => {
    const segmentProportion = weight / 100; // Weight as proportion of circle
    const scoreProportion = score / 100; // How much of segment to fill
    return segmentProportion * scoreProportion * circumference;
  };

  const trailFuelLength = calculateSegmentLength(weights.trailFuel, trailFuelScore);
  const climbLength = calculateSegmentLength(weights.climb, climbScore);  
  const baseCampLength = calculateSegmentLength(weights.baseCamp, baseCampScore);

  // Calculate offsets for each segment
  const trailFuelOffset = 0;
  const climbOffset = (weights.trailFuel / 100) * circumference;
  const baseCampOffset = ((weights.trailFuel + weights.climb) / 100) * circumference;

  return (
    <div className="flex items-center justify-center relative w-full">
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          
          {/* Define gradients for contrast effect */}
          <defs>
            <linearGradient id="trailFuelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="climbGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="baseCampGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
          
          {/* Trail Fuel Segment (Bright Teal with Gradient) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="url(#trailFuelGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${trailFuelLength} ${circumference - trailFuelLength}`}
            strokeDashoffset={-trailFuelOffset}
            className="transition-all duration-500"
          />
          
          {/* Climb Segment (Baby Blue with Gradient) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="url(#climbGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${climbLength} ${circumference - climbLength}`}
            strokeDashoffset={-climbOffset}
            className="transition-all duration-500"
          />
          
          {/* Base Camp Segment (Darker Green with Gradient) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="url(#baseCampGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${baseCampLength} ${circumference - baseCampLength}`}
            strokeDashoffset={-baseCampOffset}
            className="transition-all duration-500"
          />
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {Math.round(weightedScore)}
          </span>
        </div>
      </div>
      
      {/* Goal-aware legend with current/max scores */}
      <div className="flex items-center gap-3 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #06b6d4, #0891b2)' }} />
          <span className="text-white/70">Trail Fuel ({Math.round((trailFuelScore/100) * weights.trailFuel)}/{weights.trailFuel})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }} />
          <span className="text-white/70">Climb ({Math.round((climbScore/100) * weights.climb)}/{weights.climb})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #4ade80, #16a34a)' }} />
          <span className="text-white/70">Base Camp ({Math.round((baseCampScore/100) * weights.baseCamp)}/{weights.baseCamp})</span>
        </div>
      </div>
    </div>
      
      {/* Activity Streak Badge - Left Side */}
      <div className="absolute top-9 -left-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-3 py-2 rounded-full shadow-xl border-2 border-orange-300 z-50">
        🔥 {activityStreak}
      </div>

      {/* Consistency Bonus Badge - Video Game Style */}
      {consistencyBonus > 0 && (
        <div className="absolute top-9 left-64 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-bold px-3 py-2 rounded-full shadow-xl border-2 border-amber-300 z-50">
          BONUS: +{consistencyBonus}
        </div>
      )}
    </div>
  );
}