import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
}

interface ExercisesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  workoutType: string;
  exercises: Exercise[];
}

export default function ExercisesPopup({ isOpen, onClose, workoutType, exercises }: ExercisesPopupProps) {
  if (!isOpen) return null;

  // Mock exercises data based on workout type
  const getExercises = (): Exercise[] => {
    if (workoutType.includes("Push")) {
      return [
        { name: "Bench Press", sets: 4, reps: "8-10" },
        { name: "Overhead Press", sets: 3, reps: "10-12" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
        { name: "Tricep Dips", sets: 3, reps: "12-15" },
        { name: "Lateral Raises", sets: 3, reps: "12-15" }
      ];
    } else if (workoutType.includes("Pull")) {
      return [
        { name: "Pull-ups", sets: 4, reps: "6-8" },
        { name: "Bent Over Rows", sets: 4, reps: "8-10" },
        { name: "Lat Pulldowns", sets: 3, reps: "10-12" },
        { name: "Barbell Curls", sets: 3, reps: "10-12" },
        { name: "Face Pulls", sets: 3, reps: "12-15" }
      ];
    } else if (workoutType.includes("Leg")) {
      return [
        { name: "Squats", sets: 4, reps: "8-10" },
        { name: "Romanian Deadlifts", sets: 4, reps: "8-10" },
        { name: "Bulgarian Split Squats", sets: 3, reps: "10-12 each leg" },
        { name: "Leg Press", sets: 3, reps: "12-15" },
        { name: "Calf Raises", sets: 4, reps: "15-20" }
      ];
    } else if (workoutType.includes("Cardio")) {
      return [
        { name: "Treadmill Run", sets: 1, reps: "20 min" },
        { name: "Rowing Machine", sets: 3, reps: "5 min intervals" },
        { name: "Bike Sprints", sets: 5, reps: "30 sec on, 90 sec off" },
        { name: "Burpees", sets: 3, reps: "10-15" }
      ];
    }
    return [];
  };

  const exerciseList = exercises.length > 0 ? exercises : getExercises();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass-card border-b border-white/20 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white heading-serif">{workoutType}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Exercises List */}
        <div className="p-6 space-y-4">
          {exerciseList.map((exercise, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl glass-card border border-white/20 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white body-sans">{exercise.name}</h3>
                  <p className="text-sm text-white/70 body-sans">
                    {exercise.sets} sets × {exercise.reps}
                    {exercise.weight && ` @ ${exercise.weight}`}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-white/40"></div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}