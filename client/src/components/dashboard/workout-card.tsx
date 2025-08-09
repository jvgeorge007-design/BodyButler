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
      <div className="flex gap-2 justify-center items-center">
        <div className="flex flex-col items-center justify-center">
          <Dumbbell className="w-10 h-10 text-purple-400" />
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {workoutType}
          </div>
        </div>
      </div>
    </div>
  );
}