import { useMemo } from "react";

interface PeakScoreTrackerProps {
  trailFuelScore: number;
  climbScore: number;
  baseCampScore: number;
  consistencyBonus: number;
  goalType: 'cut' | 'lean_bulk' | 'recomp' | 'endurance' | 'wellness';
}

export default function PeakScoreTracker({
  trailFuelScore,
  climbScore,
  baseCampScore,
  consistencyBonus,
  goalType
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
          
          {/* Trail Fuel Segment (Cyan) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${trailFuelLength} ${circumference - trailFuelLength}`}
            strokeDashoffset={-trailFuelOffset}
            className="transition-all duration-500"
          />
          
          {/* Climb Segment (Purple) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#a855f7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${climbLength} ${circumference - climbLength}`}
            strokeDashoffset={-climbOffset}
            className="transition-all duration-500"
          />
          
          {/* Base Camp Segment (Emerald) */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#10b981"
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
          <span className="text-xs text-white/60 uppercase tracking-wide">
            PEAK
          </span>
          {consistencyBonus > 0 && (
            <span className="text-xs text-green-400">+{consistencyBonus}</span>
          )}
        </div>
      </div>

      {/* Goal-aware legend with current/max scores */}
      <div className="flex items-center gap-3 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-white/70">Trail Fuel ({Math.round((trailFuelScore/100) * weights.trailFuel)}/{weights.trailFuel})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-white/70">Climb ({Math.round((climbScore/100) * weights.climb)}/{weights.climb})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-white/70">Base Camp ({Math.round((baseCampScore/100) * weights.baseCamp)}/{weights.baseCamp})</span>
        </div>
      </div>
    </div>
  );
}