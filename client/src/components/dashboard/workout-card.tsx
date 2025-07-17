import { Button } from "@/components/ui/button";
import { Dumbbell, Play } from "lucide-react";
import ExercisesPopup from "./exercises-popup";
import { useState } from "react";

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
  const [showExercises, setShowExercises] = useState(false);

  return (
    <div className="bg-transparent">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-light text-white heading-serif">
            Workout
          </h2>
          <button 
            onClick={() => setShowExercises(true)}
            className="text-3xl font-light text-white hover:text-gray-300 transition-all duration-300 cursor-pointer heading-serif"
          >
            {workoutType}
          </button>
        </div>
        
        {!isRestDay && (
          <div className="flex items-center gap-1 text-white body-sans">
            <span className="text-lg">⏱</span>
            <span className="text-sm font-medium">— {exerciseCount} exercises</span>
          </div>
        )}
      </div>

      <button 
        onClick={onLogWorkout}
        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center gap-3"
      >
        <Play className="w-5 h-5" fill="currentColor" />
        Start Workout
      </button>

      {/* Exercises Popup */}
      <ExercisesPopup 
        isOpen={showExercises}
        onClose={() => setShowExercises(false)}
        workoutType={workoutType}
        exercises={[]}
      />
    </div>
  );
}