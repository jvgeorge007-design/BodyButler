import { Activity, Utensils } from "lucide-react";

interface CircularCalorieTrackerProps {
  totalCalories: number;
  targetCalories: number;
  workoutCalories: number;
  exerciseCalories: number;
}

export default function CircularCalorieTracker({
  totalCalories,
  targetCalories,
  workoutCalories,
  exerciseCalories
}: CircularCalorieTrackerProps) {
  const percentage = Math.min((totalCalories / targetCalories) * 100, 100);
  const workoutPercentage = Math.min((workoutCalories / targetCalories) * 100, 100);
  const exercisePercentage = Math.min((exerciseCalories / targetCalories) * 100, 100);
  
  // SVG circle parameters
  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const totalOffset = circumference - (percentage / 100) * circumference;
  const workoutOffset = circumference - (workoutPercentage / 100) * circumference;
  const exerciseOffset = circumference - (exercisePercentage / 100) * circumference;

  return (
    <div className="calm-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-headline text-[hsl(var(--text-primary))]">Today's Calories</h3>
        <div className="text-right">
          <div className="text-title2 font-bold text-[hsl(var(--blue-primary))]">{totalCalories}</div>
          <div className="text-caption2">of {targetCalories}</div>
        </div>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--surface-secondary))"
              strokeWidth={strokeWidth}
              fill="none"
            />
            
            {/* Exercise calories (inner) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--success))"
              strokeWidth={strokeWidth / 2}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={exerciseOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
              style={{ strokeDasharray: `${circumference} ${circumference}` }}
            />
            
            {/* Workout calories (outer) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius - strokeWidth / 4}
              stroke="hsl(var(--blue-primary))"
              strokeWidth={strokeWidth / 2}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={workoutOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
              style={{ strokeDasharray: `${circumference} ${circumference}` }}
            />
            
            {/* Total progress outline */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--blue-primary))"
              strokeWidth={2}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={totalOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out opacity-30"
              style={{ strokeDasharray: `${circumference} ${circumference}` }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-title1 font-bold text-[hsl(var(--text-primary))]">
                {Math.round(percentage)}%
              </div>
              <div className="text-caption2">complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--blue-primary))]"></div>
            <Activity className="w-4 h-4 text-[hsl(var(--blue-primary))]" />
          </div>
          <div>
            <div className="text-callout font-medium text-[hsl(var(--text-primary))]">{workoutCalories}</div>
            <div className="text-caption2">Workout</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--success))]"></div>
            <Utensils className="w-4 h-4 text-[hsl(var(--success))]" />
          </div>
          <div>
            <div className="text-callout font-medium text-[hsl(var(--text-primary))]">{exerciseCalories}</div>
            <div className="text-caption2">Exercise</div>
          </div>
        </div>
      </div>
    </div>
  );
}