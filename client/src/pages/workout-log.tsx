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
    <div className="min-h-screen bg-gray-900 px-6 py-8">
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
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{todaysWorkout.focus}</CardTitle>
            <div className="flex justify-between text-sm text-gray-300">
              <span>{todaysWorkout.day}</span>
              <span>{completedSets} / {totalSets} sets completed</span>
            </div>
          </CardHeader>
          {!workoutStarted && (
            <CardContent>
              <Button onClick={startWorkout} className="w-full bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white">
                Start Workout
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Exercise List */}
        {workoutStarted && (
          <div className="space-y-4">
            {exerciseLogs.map((exercise, exerciseIndex) => (
              <Card key={exercise.exerciseId} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">{exercise.name}</CardTitle>
                  <div className="text-sm text-gray-300">
                    Target: {exercise.targetSets} sets × {exercise.targetReps} reps
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {exercise.completedSets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg bg-gray-700">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-gray-300">Reps</Label>
                          <Input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSetData(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="h-8 bg-gray-600 border-gray-500 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-300">Weight (lbs)</Label>
                          <Input
                            type="number"
                            value={set.weight || 0}
                            onChange={(e) => updateSetData(exerciseIndex, setIndex, 'weight', parseInt(e.target.value) || 0)}
                            className="h-8 bg-gray-600 border-gray-500 text-white"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <Button
                        variant={set.completed ? "default" : "outline"}
                        size="sm"
                        onClick={() => completeSet(exerciseIndex, setIndex)}
                        className={`px-3 ${set.completed 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                      >
                        {set.completed ? <Check className="w-4 h-4" /> : `Set ${setIndex + 1}`}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            
            {/* Finish Workout */}
            <Button 
              onClick={finishWorkout} 
              className="w-full h-12 text-lg bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white"
              disabled={completedSets === 0}
            >
              Finish Workout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}