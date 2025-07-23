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
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setShowExercises(true)}
            className="text-3xl font-light hover:text-gray-300 transition-all duration-300 cursor-pointer heading-serif"
            style={{color: 'rgb(235, 235, 240)'}}
          >
            {workoutType}
          </button>
        </div>
      </div>

      <button 
        onClick={onLogWorkout}
        className="w-full text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center gap-3"
        style={{
          background: 'linear-gradient(90deg, rgb(0, 95, 115) 0%, rgb(0, 85, 105) 50%, rgb(0, 75, 95) 100%)',
          boxShadow: '0 0 15px rgba(87, 168, 255, 0.2)'
        }}
      >
        <Play className="w-5 h-5" fill="currentColor" />
        Start
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