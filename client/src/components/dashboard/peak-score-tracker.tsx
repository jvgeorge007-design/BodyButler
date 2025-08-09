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

  // Calculate positions for three inner circles
  const centerX = size / 2;
  const centerY = size / 2;
  const innerRadius = radius * 0.6;
  
  const trailFuelAngle = -90; // Top
  const climbAngle = 30; // Bottom right
  const baseCampAngle = 150; // Bottom left
  
  const getCirclePosition = (angle: number, distance: number) => ({
    x: centerX + Math.cos((angle * Math.PI) / 180) * distance,
    y: centerY + Math.sin((angle * Math.PI) / 180) * distance
  });

  const trailFuelPos = getCirclePosition(trailFuelAngle, innerRadius * 0.4);
  const climbPos = getCirclePosition(climbAngle, innerRadius * 0.4);
  const baseCampPos = getCirclePosition(baseCampAngle, innerRadius * 0.4);

  const innerCircleRadius = 16;
  const innerStrokeWidth = 3;
  const innerCircumference = (innerCircleRadius - innerStrokeWidth) * 2 * Math.PI;

  const getStrokeDasharray = (score: number, circumference: number) => {
    const progress = (score / 100) * circumference;
    return `${progress} ${circumference - progress}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green-500
    if (score >= 60) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Outer circle background */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={strokeWidth}
          />
          
          {/* Outer circle progress */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={getScoreColor(weightedScore)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={getStrokeDasharray(weightedScore, circumference)}
            className="transition-all duration-500"
          />

          {/* Trail Fuel inner circle */}
          <circle
            cx={trailFuelPos.x}
            cy={trailFuelPos.y}
            r={innerCircleRadius - innerStrokeWidth}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={innerStrokeWidth}
          />
          <circle
            cx={trailFuelPos.x}
            cy={trailFuelPos.y}
            r={innerCircleRadius - innerStrokeWidth}
            fill="none"
            stroke="#3b82f6" // blue-500
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={getStrokeDasharray(trailFuelScore, innerCircumference)}
            className="transition-all duration-500"
          />

          {/* Climb inner circle */}
          <circle
            cx={climbPos.x}
            cy={climbPos.y}
            r={innerCircleRadius - innerStrokeWidth}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={innerStrokeWidth}
          />
          <circle
            cx={climbPos.x}
            cy={climbPos.y}
            r={innerCircleRadius - innerStrokeWidth}
            fill="none"
            stroke="#8b5cf6" // violet-500
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={getStrokeDasharray(climbScore, innerCircumference)}
            className="transition-all duration-500"
          />

          {/* Base Camp inner circle */}
          <circle
            cx={baseCampPos.x}
            cy={baseCampPos.y}
            r={innerCircleRadius - innerStrokeWidth}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={innerStrokeWidth}
          />
          <circle
            cx={baseCampPos.x}
            cy={baseCampPos.y}
            r={innerCircleRadius - innerStrokeWidth}
            fill="none"
            stroke="#f59e0b" // amber-500
            strokeWidth={innerStrokeWidth}
            strokeLinecap="round"
            strokeDasharray={getStrokeDasharray(baseCampScore, innerCircumference)}
            className="transition-all duration-500"
          />
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold ${weightedScore >= 80 ? 'text-green-400' : weightedScore >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
            {Math.round(weightedScore)}
          </span>
          {consistencyBonus > 0 && (
            <span className="text-xs text-green-400">+{consistencyBonus}</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-white/80">Fuel</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
          <span className="text-xs text-white/80">Climb</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-xs text-white/80">Base</span>
        </div>
      </div>
    </div>
  );
}