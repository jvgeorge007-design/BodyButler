import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Play, CheckCircle2, Circle, Dumbbell } from "lucide-react";
import IOSNavHeader from "@/components/navigation/ios-nav-header";

interface ExerciseSet {
  setNumber: number;
  targetReps: number;
  completedReps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  sets: ExerciseSet[];
}

export default function Workout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  const { data: personalizedPlan, isLoading: planLoading, error } = useQuery({
    queryKey: ["/api/personalized-plan"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  // Initialize exercises from personalized plan
  useEffect(() => {
    if (personalizedPlan && (personalizedPlan as any).workoutPlan?.days?.[0]?.exercises) {
      const todaysExercises = (personalizedPlan as any).workoutPlan.days[0].exercises.map((exercise: any, index: number) => ({
        id: `exercise_${index}`,
        name: exercise.name,
        targetSets: exercise.sets || 3,
        targetReps: exercise.reps || 10,
        sets: Array(exercise.sets || 3).fill(null).map((_, setIndex) => ({
          setNumber: setIndex + 1,
          targetReps: exercise.reps || 10,
          completedReps: exercise.reps || 10,
          weight: 0,
          completed: false
        }))
      }));
      setExercises(todaysExercises);
    }
  }, [personalizedPlan]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Session expired",
        description: "Please log in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    toast({
      title: "Workout Started!",
      description: "Let's crush this session!",
    });
  };

  const handleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => 
      prev.map((exercise, eIndex) => 
        eIndex === exerciseIndex 
          ? {
              ...exercise,
              sets: exercise.sets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, completed: !set.completed } : set
              )
            }
          : exercise
      )
    );
  };

  const handleUpdateReps = (exerciseIndex: number, setIndex: number, reps: number) => {
    setExercises(prev => 
      prev.map((exercise, eIndex) => 
        eIndex === exerciseIndex 
          ? {
              ...exercise,
              sets: exercise.sets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, completedReps: reps } : set
              )
            }
          : exercise
      )
    );
  };

  const handleUpdateWeight = (exerciseIndex: number, setIndex: number, weight: number) => {
    setExercises(prev => 
      prev.map((exercise, eIndex) => 
        eIndex === exerciseIndex 
          ? {
              ...exercise,
              sets: exercise.sets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, weight } : set
              )
            }
          : exercise
      )
    );
  };

  const handleFinishWorkout = () => {
    const totalSets = exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
    const completedSets = exercises.reduce((total, exercise) => 
      total + exercise.sets.filter(set => set.completed).length, 0
    );
    
    toast({
      title: "Workout Complete!",
      description: `Great job! You completed ${completedSets}/${totalSets} sets.`,
    });
    setLocation('/');
  };

  const todaysWorkout = personalizedPlan ? (personalizedPlan as any).workoutPlan?.days?.[0] : null;

  if (isLoading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!todaysWorkout) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <IOSNavHeader 
          title="Workout"
          showBackButton
          onBack={() => setLocation('/')}
        />
        <div className="px-6 py-8">
          <div className="calm-card text-center">
            <h2 className="text-title2 text-white/90 mb-2">No Workout Available</h2>
            <p className="text-body text-white/60">Please complete your onboarding to get a personalized workout plan.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalSets = exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = exercises.reduce((total, exercise) => 
    total + exercise.sets.filter(set => set.completed).length, 0
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <IOSNavHeader 
        title={`${todaysWorkout.focus}`}
        showBackButton
        onBack={() => setLocation('/')}
      />

      <div className="px-6 py-8 pb-24 max-w-md mx-auto">
        {!workoutStarted && (
          <div className="calm-card mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Dumbbell className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1">
                <h1 className="text-title2 text-white/90 mb-2">{todaysWorkout.focus}</h1>
                <p className="text-body text-white/60">
                  {exercises.length} exercises
                </p>
              </div>
            </div>

            <button 
              onClick={handleStartWorkout}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 text-white/80" fill="currentColor" />
              Start Workout
            </button>
          </div>
        )}

        {/* Exercise List */}
        <div className="space-y-6">
          {exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="calm-card">
              <div className="mb-4">
                <h3 className="text-headline text-white/90 mb-2">{exercise.name}</h3>
                <p className="text-body text-white/60">
                  Suggested: {exercise.targetSets} sets × {exercise.targetReps} reps
                </p>
              </div>

              <div className="space-y-4">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="form-grid">
                    <div className="form-row">
                      <span className="text-body text-white/80 min-w-[50px]">
                        Set {set.setNumber}
                      </span>
                      
                      <div className="form-field">
                        <label className="text-caption1 text-white/60 mb-1 block">
                          Reps {workoutStarted && (
                            <span className="text-white/40">({set.targetReps} suggested)</span>
                          )}
                        </label>
                        <input
                          type="number"
                          value={set.completedReps}
                          onChange={(e) => handleUpdateReps(exerciseIndex, setIndex, parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none"
                          min="0"
                          disabled={!workoutStarted}
                        />
                      </div>

                      <div className="form-field">
                        <label className="text-caption1 text-white/60 mb-1 block">Weight (lbs)</label>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => handleUpdateWeight(exerciseIndex, setIndex, parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none"
                          min="0"
                          placeholder="0"
                          disabled={!workoutStarted}
                        />
                      </div>

                      {workoutStarted && (
                        <button
                          onClick={() => handleCompleteSet(exerciseIndex, setIndex)}
                          className={`p-2 rounded-xl transition-colors ${
                            set.completed 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-white/10 text-white/60 hover:bg-white/20'
                          }`}
                        >
                          {set.completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Finish Workout Button */}
        {workoutStarted && (
          <div className="calm-card mt-6">
            <button
              onClick={handleFinishWorkout}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-2xl transition-colors"
            >
              Finish Workout ({completedSets}/{totalSets} sets completed)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}