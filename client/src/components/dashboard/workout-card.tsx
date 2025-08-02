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
      {/* Workout title with barbell icon */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white/60">Workout</h3>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex items-center justify-center">
          <button 
            onClick={() => setShowExercises(true)}
            className="text-2xl font-light hover:text-gray-300 transition-all duration-300 cursor-pointer heading-serif text-center"
            style={{color: 'rgb(235, 235, 240)'}}
          >
            {workoutType}
          </button>
        </div>
      </div>



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