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
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            Workout
          </h2>
          <button 
            onClick={() => setShowExercises(true)}
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            {workoutType}
          </button>
        </div>
        
        {!isRestDay && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>⏱️ —</span>
            <div className="flex items-center gap-1">
              <Dumbbell className="w-4 h-4" />
              <span>{exerciseCount} exercises</span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={onLogWorkout}
        className={`w-full font-medium py-3 rounded-2xl transition-colors flex items-center justify-center gap-2 ${
          isRestDay 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isRestDay ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Log Recovery Activity
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
            Start Workout
          </>
        )}
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