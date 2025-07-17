import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowLeft, Check, Plus, Timer } from "lucide-react";

interface ExerciseLog {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  completedSets: Array<{
    reps: number;
    weight?: number;
    completed: boolean;
  }>;
}

export default function WorkoutLog() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  const { data: personalizedPlan, isLoading: planLoading, error } = useQuery({
    queryKey: ["/api/personalized-plan"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

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

  useEffect(() => {
    if (personalizedPlan?.workoutPlan?.days) {
      // Initialize exercise logs with today's workout
      const todaysWorkout = personalizedPlan.workoutPlan.days[0];
      if (todaysWorkout?.exercises) {
        const logs = todaysWorkout.exercises.map((exercise: any, index: number) => ({
          exerciseId: `${index}`,
          name: exercise.name,
          targetSets: exercise.sets,
          targetReps: exercise.reps,
          completedSets: Array(exercise.sets).fill(null).map(() => ({
            reps: exercise.reps,
            weight: 0,
            completed: false,
          })),
        }));
        setExerciseLogs(logs);
      }
    }
  }, [personalizedPlan]);

  const handleBack = () => {
    setLocation("/");
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    setStartTime(new Date());
    toast({
      title: "Workout Started!",
      description: "Let's crush this session!",
    });
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    setExerciseLogs(prev => 
      prev.map((exercise, eIndex) => 
        eIndex === exerciseIndex 
          ? {
              ...exercise,
              completedSets: exercise.completedSets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, completed: !set.completed } : set
              )
            }
          : exercise
      )
    );
  };

  const updateSetData = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setExerciseLogs(prev => 
      prev.map((exercise, eIndex) => 
        eIndex === exerciseIndex 
          ? {
              ...exercise,
              completedSets: exercise.completedSets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    );
  };

  const finishWorkout = () => {
    const completedSets = exerciseLogs.reduce((total, exercise) => 
      total + exercise.completedSets.filter(set => set.completed).length, 0
    );
    
    toast({
      title: "Workout Complete!",
      description: `Great job! You completed ${completedSets} sets.`,
    });
    
    setLocation("/");
  };

  if (isLoading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!personalizedPlan?.workoutPlan?.days?.[0]) {
    return (
      <div className="min-h-screen bg-gray-900 px-6 py-8">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-4 text-gray-300 hover:text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-white">No workout plan available. Please complete your onboarding first.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const todaysWorkout = personalizedPlan.workoutPlan.days[0];
  const totalSets = exerciseLogs.reduce((total, exercise) => total + exercise.targetSets, 0);
  const completedSets = exerciseLogs.reduce((total, exercise) => 
    total + exercise.completedSets.filter(set => set.completed).length, 0
  );

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="text-gray-300 hover:text-white hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {workoutStarted && startTime && (
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Timer className="w-4 h-4" />
              <span>{Math.floor((Date.now() - startTime.getTime()) / 60000)}m</span>
            </div>
          )}
        </div>

        {/* Workout Header */}
        <div className="glass-card">
          <div className="mb-4">
            <h2 className="text-xl font-black heading-serif" style={{color: 'rgb(235, 235, 240)'}}>{todaysWorkout.focus}</h2>
            <div className="flex justify-between text-sm mt-2" style={{color: 'rgb(180, 180, 190)'}}>
              <span>{todaysWorkout.day}</span>
              <span>{completedSets} / {totalSets} sets completed</span>
            </div>
          </div>
          {!workoutStarted && (
            <button 
              onClick={startWorkout} 
              className="w-full gradient-button"
            >
              Start Workout
            </button>
          )}
        </div>

        {/* Exercise List */}
        {workoutStarted && (
          <div className="space-y-4">
            {exerciseLogs.map((exercise, exerciseIndex) => (
              <div key={exercise.exerciseId} className="glass-card">
                <div className="mb-4">
                  <h3 className="text-lg font-bold heading-serif" style={{color: 'rgb(235, 235, 240)'}}>{exercise.name}</h3>
                  <div className="text-sm mt-1" style={{color: 'rgb(180, 180, 190)'}}>
                    Target: {exercise.targetSets} sets × {exercise.targetReps} reps
                  </div>
                </div>
                <div className="space-y-3">
                  {exercise.completedSets.map((set, setIndex) => (
                    <div key={setIndex} className="flex space-x-3 p-2 rounded-lg" style={{
                      background: 'rgb(40, 40, 45)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div className="flex flex-col">
                        <div className="h-6"></div>
                        <button
                          onClick={() => completeSet(exerciseIndex, setIndex)}
                          className={`px-3 rounded-lg text-sm font-medium transition-all duration-200 ${set.completed 
                            ? 'text-white' 
                            : 'hover:bg-gray-600 hover:text-white'
                          }`}
                          style={{
                            background: set.completed ? 'rgb(0, 195, 142)' : 'rgba(20, 20, 25, 0.4)',
                            color: set.completed ? 'white' : 'rgb(180, 180, 190)',
                            border: set.completed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                            height: '32px'
                          }}
                        >
                          {set.completed ? <Check className="w-4 h-4" /> : `Set ${setIndex + 1}`}
                        </button>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs body-sans" style={{color: 'rgb(180, 180, 190)'}}>Reps</label>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSetData(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="h-8 w-full px-2 rounded border-0 text-white body-sans"
                            style={{
                              background: 'rgba(20, 20, 25, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs body-sans" style={{color: 'rgb(180, 180, 190)'}}>Weight (lbs)</label>
                          <input
                            type="number"
                            value={set.weight || 0}
                            onChange={(e) => updateSetData(exerciseIndex, setIndex, 'weight', parseInt(e.target.value) || 0)}
                            className="h-8 w-full px-2 rounded border-0 text-white body-sans"
                            style={{
                              background: 'rgba(20, 20, 25, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Finish Workout */}
            <button 
              onClick={finishWorkout} 
              className="w-full h-12 text-lg gradient-button"
              disabled={completedSets === 0}
            >
              Finish Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}