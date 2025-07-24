import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Play, Pause, Timer, CheckCircle2, Circle, RotateCcw, Dumbbell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import IOSNavHeader from '@/components/navigation/ios-nav-header';

interface ExerciseSet {
  reps: number;
  weight?: number;
  completed: boolean;
}

interface WorkoutExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  completedSets: ExerciseSet[];
  restTime?: number; // in seconds
}

export default function WorkoutSession() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState(false);

  // Fetch personalized plan data
  const { data: personalizedPlan } = useQuery({
    queryKey: ['/api/personalized-plan'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update current time every second for timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            toast({
              title: "Rest Complete!",
              description: "Ready for your next set",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, toast]);

  // Initialize exercises from personalized plan
  useEffect(() => {
    if (personalizedPlan && (personalizedPlan as any).workoutPlan?.days?.[0]?.exercises) {
      const todaysExercises = (personalizedPlan as any).workoutPlan.days[0].exercises.map((exercise: any, index: number) => ({
        id: `exercise_${index}`,
        name: exercise.name,
        targetSets: exercise.sets || 3,
        targetReps: exercise.reps || 10,
        restTime: exercise.restTime || 60,
        completedSets: Array(exercise.sets || 3).fill(null).map(() => ({
          reps: exercise.reps || 10,
          weight: 0,
          completed: false
        }))
      }));
      setExercises(todaysExercises);
    }
  }, [personalizedPlan]);

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setStartTime(new Date());
    toast({
      title: "Workout Started!",
      description: "Let's crush this session!",
    });
  };

  const handlePauseResume = () => {
    setWorkoutPaused(!workoutPaused);
    toast({
      title: workoutPaused ? "Workout Resumed" : "Workout Paused",
      description: workoutPaused ? "Keep going!" : "Take your time",
    });
  };

  const handleCompleteSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => 
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

    // Start rest timer if set was completed
    const exercise = exercises[exerciseIndex];
    if (exercise?.completedSets[setIndex] && !exercise.completedSets[setIndex].completed) {
      const restTime = exercise.restTime || 60;
      setRestTimer(restTime);
      setIsResting(true);
      toast({
        title: "Set Complete!",
        description: `Rest for ${restTime} seconds`,
      });
    }
  };

  const handleUpdateReps = (exerciseIndex: number, setIndex: number, reps: number) => {
    setExercises(prev => 
      prev.map((exercise, eIndex) => 
        eIndex === exerciseIndex 
          ? {
              ...exercise,
              completedSets: exercise.completedSets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, reps } : set
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
              completedSets: exercise.completedSets.map((set, sIndex) =>
                sIndex === setIndex ? { ...set, weight } : set
              )
            }
          : exercise
      )
    );
  };

  const handleFinishWorkout = () => {
    toast({
      title: "Workout Complete!",
      description: "Great job on finishing your session!",
    });
    setLocation('/');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = (): string => {
    if (!startTime || workoutPaused) return "0:00";
    const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    return formatTime(elapsed);
  };

  const totalSets = exercises.reduce((total, exercise) => total + exercise.targetSets, 0);
  const completedSets = exercises.reduce((total, exercise) => 
    total + exercise.completedSets.filter(set => set.completed).length, 0
  );

  const todaysWorkout = personalizedPlan ? (personalizedPlan as any).workoutPlan?.days?.[0] : null;

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="relative">
        <IOSNavHeader 
          title={workoutStarted ? "Workout Session" : "Today's Workout"}
          showBackButton
          onBack={() => setLocation('/')}
        />
        {workoutStarted && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/80">
            <Timer className="w-4 h-4" />
            <span className="text-subheadline font-medium">{getElapsedTime()}</span>
          </div>
        )}
      </div>

      <div className="px-6 py-8 pb-24 max-w-md mx-auto">
        {/* Workout Overview */}
        {!workoutStarted && (
          <div className="space-y-6">
            {/* Workout Header */}
            <div className="calm-card">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Dumbbell className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-title2 text-white/90 mb-2">{todaysWorkout.focus}</h1>
                  <div className="flex items-center gap-4 text-body text-white/60">
                    <span>{todaysWorkout.day}</span>
                    <span>•</span>
                    <span>{exercises.length} exercises</span>
                    <span>•</span>
                    <span>{totalSets} sets</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleStartWorkout}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Start Workout
              </button>
            </div>

            {/* Exercise Preview */}
            <div className="calm-card">
              <h3 className="text-headline text-white/90 mb-4">Exercises</h3>
              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div>
                      <h4 className="text-body text-white/90 font-medium">{exercise.name}</h4>
                      <p className="text-caption1 text-white/60">{exercise.targetSets} sets × {exercise.targetReps} reps</p>
                    </div>
                    <Circle className="w-5 h-5 text-white/40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Workout */}
        {workoutStarted && (
          <div className="space-y-6">
            {/* Workout Controls */}
            <div className="calm-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-headline text-white/90">{todaysWorkout.focus}</h2>
                  <p className="text-body text-white/60">{completedSets} / {totalSets} sets completed</p>
                </div>
                <button
                  onClick={handlePauseResume}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {workoutPaused ? (
                    <Play className="w-5 h-5 text-white/80" fill="currentColor" />
                  ) : (
                    <Pause className="w-5 h-5 text-white/80" />
                  )}
                </button>
              </div>

              {/* Rest Timer */}
              {isResting && restTimer > 0 && (
                <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-blue-300">Rest Time</span>
                    <span className="text-title3 text-blue-300 font-bold">{formatTime(restTimer)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Exercise List */}
            <div className="space-y-4">
              {exercises.map((exercise, exerciseIndex) => (
                <div key={exercise.id} className="calm-card">
                  <div className="mb-4">
                    <h3 className="text-headline text-white/90 mb-2">{exercise.name}</h3>
                    <p className="text-body text-white/60">Target: {exercise.targetSets} sets × {exercise.targetReps} reps</p>
                  </div>

                  <div className="space-y-3">
                    {exercise.completedSets.map((set, setIndex) => (
                      <div key={setIndex} className="form-grid">
                        <div className="form-row">
                          <span className="text-body text-white/80 min-w-[40px]">Set {setIndex + 1}</span>
                          
                          <div className="form-field">
                            <label className="text-caption1 text-white/60 mb-1 block">Reps</label>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => handleUpdateReps(exerciseIndex, setIndex, parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none"
                              min="0"
                            />
                          </div>

                          <div className="form-field">
                            <label className="text-caption1 text-white/60 mb-1 block">Weight (lbs)</label>
                            <input
                              type="number"
                              value={set.weight || 0}
                              onChange={(e) => handleUpdateWeight(exerciseIndex, setIndex, parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none"
                              min="0"
                              placeholder="0"
                            />
                          </div>

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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Finish Workout Button */}
            <div className="calm-card">
              <button
                onClick={handleFinishWorkout}
                disabled={completedSets === 0}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-white/10 disabled:text-white/40 text-white font-semibold py-4 rounded-2xl transition-colors"
              >
                Finish Workout ({completedSets}/{totalSets} sets)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}