import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Target } from "lucide-react";

interface WorkoutCardProps {
  workoutType?: string;
  focus?: string;
  duration?: string;
  exerciseCount?: number;
  onLogWorkout: () => void;
}

export default function WorkoutCard({
  workoutType = "Rest Day",
  focus = "Recovery and stretching",
  duration = "30 min",
  exerciseCount = 0,
  onLogWorkout
}: WorkoutCardProps) {
  const isRestDay = workoutType === "Rest Day" || !workoutType;

  return (
    <div className="calm-card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isRestDay ? 'bg-[hsl(var(--surface-secondary))]' : 'bg-[hsl(var(--blue-primary))]/10'}`}>
            <Dumbbell className={`w-6 h-6 ${isRestDay ? 'text-[hsl(var(--text-secondary))]' : 'text-[hsl(var(--blue-primary))]'}`} />
          </div>
          <div>
            <h3 className="text-headline text-[hsl(var(--text-primary))]">Today's Workout</h3>
            <p className="text-caption2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
        {!isRestDay && (
          <div className="text-right">
            <div className="text-callout font-medium text-[hsl(var(--blue-primary))]">{exerciseCount}</div>
            <div className="text-caption2">exercises</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-title3 font-semibold text-[hsl(var(--text-primary))] mb-2">
            {workoutType}
          </h4>
          <p className="text-body text-[hsl(var(--text-secondary))] mb-3">
            {focus}
          </p>
        </div>

        {!isRestDay && (
          <div className="flex items-center gap-4 text-[hsl(var(--text-secondary))]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-callout">{duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="text-callout">{exerciseCount} exercises</span>
            </div>
          </div>
        )}

        <Button 
          onClick={onLogWorkout}
          className={`w-full ${isRestDay ? 'outline-button' : 'gradient-button'}`}
          variant={isRestDay ? "outline" : "default"}
        >
          {isRestDay ? 'Log Recovery Activity' : `Start ${workoutType}`}
        </Button>
      </div>
    </div>
  );
}