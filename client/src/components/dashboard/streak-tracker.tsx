import { Flame, Target, Trophy } from "lucide-react";

interface StreakTrackerProps {
  workoutStreak: number;
  mealStreak: number;
  longestStreak: number;
}

export default function StreakTracker({ workoutStreak, mealStreak, longestStreak }: StreakTrackerProps) {
  return (
    <div className="surface-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-headline text-[hsl(var(--text-primary))]">Daily Streaks</h3>
        <Trophy className="w-5 h-5 text-[hsl(var(--warning))]" />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Workout Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Flame className="w-4 h-4 text-[hsl(var(--streak))]" />
            <span className="text-title2 font-bold text-[hsl(var(--streak))]">{workoutStreak}</span>
          </div>
          <p className="text-caption2">Workout days</p>
        </div>
        
        {/* Meal Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Target className="w-4 h-4 text-[hsl(var(--success))]" />
            <span className="text-title2 font-bold text-[hsl(var(--success))]">{mealStreak}</span>
          </div>
          <p className="text-caption2">Meal goals</p>
        </div>
        
        {/* Personal Best */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Trophy className="w-4 h-4 text-[hsl(var(--warning))]" />
            <span className="text-title2 font-bold text-[hsl(var(--warning))]">{longestStreak}</span>
          </div>
          <p className="text-caption2">Personal best</p>
        </div>
      </div>
      
      {/* Streak badges */}
      <div className="flex gap-2 flex-wrap">
        {workoutStreak >= 7 && (
          <span className="streak-badge">
            <Flame className="w-3 h-3" />
            Week Warrior
          </span>
        )}
        {mealStreak >= 5 && (
          <span className="success-badge">
            <Target className="w-3 h-3" />
            Nutrition Pro
          </span>
        )}
        {longestStreak >= 14 && (
          <span className="warning-badge">
            <Trophy className="w-3 h-3" />
            Consistency Champion
          </span>
        )}
      </div>
    </div>
  );
}