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
      <div className="py-2 relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Dumbbell className="w-10 h-10 text-purple-400" />
        </div>
        <div className="flex justify-center items-center pr-4">
          <div className="text-center ml-14">
            <div className="text-lg font-bold text-white">
              {workoutType}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}