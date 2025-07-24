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
    <div className="bg-transparent relative">
      {/* Barbell icon in upper left corner */}
      <div className="absolute top-0 left-0">
        <Dumbbell className="w-5 h-5" style={{color: 'rgb(180, 180, 190)'}} />
      </div>
      
      <div className="pt-8 mb-8">
        <div className="flex items-center justify-center mb-4">
          <button 
            onClick={() => setShowExercises(true)}
            className="text-3xl font-light hover:text-gray-300 transition-all duration-300 cursor-pointer heading-serif text-center"
            style={{color: 'rgb(235, 235, 240)'}}
          >
            {workoutType}
          </button>
        </div>
      </div>

      <button 
        onClick={onLogWorkout}
        className="w-full text-white font-medium py-3 rounded-system-md haptic-medium flex items-center justify-center gap-3"
        style={{
          background: 'rgb(0, 122, 255)',
          boxShadow: '0 4px 20px rgba(0, 122, 255, 0.3), 0 2px 8px rgba(0, 122, 255, 0.2)'
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