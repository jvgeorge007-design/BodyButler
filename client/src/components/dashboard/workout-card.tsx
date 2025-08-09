import { Button } from "@/components/ui/button";
import { Dumbbell, Play } from "lucide-react";

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
    <div className="bg-transparent relative">
      <div className="flex items-center justify-center pt-3 pb-6">
        <div 
          className="text-2xl font-light heading-serif text-center w-full"
          style={{color: 'rgb(235, 235, 240)'}}
        >
          {workoutType}
        </div>
      </div>
    </div>
  );
}