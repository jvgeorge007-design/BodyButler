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
          <h2 className="text-3xl font-light heading-serif" style={{color: 'rgb(235, 235, 240)'}}>
            Workout
          </h2>
          <button 
            onClick={() => setShowExercises(true)}
            className="text-3xl font-light italic hover:text-gray-300 transition-all duration-300 cursor-pointer heading-serif"
            style={{color: '#00D4AA'}}
          >
            {workoutType}
          </button>
        </div>
        
        {!isRestDay && (
          <div className="flex items-center gap-2 body-sans" style={{color: 'rgb(180, 180, 190)'}}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span className="text-sm font-medium">{exerciseCount} exercises</span>
          </div>
        )}
      </div>

      <button 
        onClick={onLogWorkout}
        className="w-full text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center gap-3"
        style={{background: 'linear-gradient(90deg, #00D4AA 0%, #00C4AA 50%, #00B4AA 100%)'}}
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