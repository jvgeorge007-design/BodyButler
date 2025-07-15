import { Calendar, Activity, Utensils, Moon, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyOverviewProps {
  todaysWorkout?: {
    name: string;
    focus: string;
    duration: string;
    completed: boolean;
  };
  calorieProgress: {
    consumed: number;
    target: number;
  };
  recoveryScore?: number;
  sleepHours?: number;
}

export default function DailyOverview({ 
  todaysWorkout, 
  calorieProgress, 
  recoveryScore = 75,
  sleepHours = 7.5 
}: DailyOverviewProps) {
  const caloriePercentage = Math.round((calorieProgress.consumed / calorieProgress.target) * 100);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-title1 text-[hsl(var(--text-primary))]">Today's Overview</h2>
        <div className="flex items-center gap-1 text-caption1 text-[hsl(var(--text-secondary))]">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Today's Movement Card */}
      <div className="calm-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[hsl(var(--blue-light))]/20">
              <Activity className="w-5 h-5 text-[hsl(var(--blue-primary))]" />
            </div>
            <div>
              <h3 className="text-headline text-[hsl(var(--text-primary))]">Today's Movement</h3>
              {todaysWorkout ? (
                <p className="text-caption2 mt-1">{todaysWorkout.focus} • {todaysWorkout.duration}</p>
              ) : (
                <p className="text-caption2 mt-1">Rest day - focus on recovery</p>
              )}
            </div>
          </div>
          {todaysWorkout?.completed && (
            <span className="success-badge">
              <Activity className="w-3 h-3" />
              Completed
            </span>
          )}
        </div>
        
        {todaysWorkout && !todaysWorkout.completed && (
          <Button className="gradient-button w-full">
            Start {todaysWorkout.name}
          </Button>
        )}
      </div>

      {/* Nutrition & Recovery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Caloric Intake */}
        <div className="surface-card">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-4 h-4 text-[hsl(var(--success))]" />
            <span className="text-callout text-[hsl(var(--text-primary))]">Nutrition</span>
          </div>
          <div className="text-center">
            <div className="text-title2 font-bold text-[hsl(var(--success))]">
              {calorieProgress.consumed}
            </div>
            <div className="text-caption2">of {calorieProgress.target} calories</div>
            <div className="mt-2">
              <div className="w-full bg-[hsl(var(--surface-secondary))] rounded-full h-2">
                <div 
                  className="bg-[hsl(var(--success))] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Score */}
        <div className="surface-card">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-[hsl(var(--warning))]" />
            <span className="text-callout text-[hsl(var(--text-primary))]">Recovery</span>
          </div>
          <div className="text-center">
            <div className="text-title2 font-bold text-[hsl(var(--warning))]">
              {recoveryScore}%
            </div>
            <div className="text-caption2">readiness score</div>
            <div className="mt-2">
              <div className="w-full bg-[hsl(var(--surface-secondary))] rounded-full h-2">
                <div 
                  className="bg-[hsl(var(--warning))] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${recoveryScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="surface-card">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-4 h-4 text-[hsl(var(--blue-primary))]" />
            <span className="text-callout text-[hsl(var(--text-primary))]">Sleep</span>
          </div>
          <div className="text-center">
            <div className="text-title2 font-bold text-[hsl(var(--blue-primary))]">
              {sleepHours}h
            </div>
            <div className="text-caption2">last night</div>
            <div className="mt-2">
              <div className="w-full bg-[hsl(var(--surface-secondary))] rounded-full h-2">
                <div 
                  className="bg-[hsl(var(--blue-primary))] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((sleepHours / 8) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}