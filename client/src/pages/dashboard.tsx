import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dumbbell, Utensils, TrendingUp, Calendar } from "lucide-react";

// Import our new dashboard components
import CircularCalorieTracker from "@/components/dashboard/circular-calorie-tracker";
import WorkoutCard from "@/components/dashboard/workout-card";
import MacroTrackerCard from "@/components/dashboard/macro-tracker-card";
import DateNavigator from "@/components/dashboard/date-navigator";
import WeeklyCalendarModal from "@/components/dashboard/weekly-calendar-modal";
import BottomNav from "@/components/navigation/bottom-nav";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [processingOnboarding, setProcessingOnboarding] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Reset to current day when home tab is clicked
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
      setSelectedDate(new Date());
      // Clean up the URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [location]);

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const { data: personalizedPlan, isLoading: planLoading, error: planError } = useQuery({
    queryKey: ["/api/personalized-plan"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  // Mutation to create profile from saved onboarding data
  const createProfileMutation = useMutation({
    mutationFn: async (onboardingData: any) => {
      return await apiRequest("POST", "/api/auth/complete-onboarding", onboardingData);
    },
    onSuccess: () => {
      // Clear localStorage and refresh queries
      localStorage.removeItem('onboardingData');
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personalized-plan"] });
      setProcessingOnboarding(false);
      toast({
        title: "Welcome to Body Butler!",
        description: "Your personalized plan has been generated!",
      });
    },
    onError: (error) => {
      console.error("Error creating profile:", error);
      setProcessingOnboarding(false);
      toast({
        title: "Setup Error",
        description: "There was an issue setting up your profile. Please try onboarding again.",
        variant: "destructive",
      });
    },
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
    if ((profileError && isUnauthorizedError(profileError as Error)) || 
        (planError && isUnauthorizedError(planError as Error))) {
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
  }, [profileError, planError, toast]);

  // Check for saved onboarding data and process it after authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading && !processingOnboarding && !createProfileMutation.isPending) {
      // Check if user has no profile but has saved onboarding data
      if (profileError && !profile && !profileLoading) {
        const savedOnboardingData = localStorage.getItem('onboardingData');
        
        if (savedOnboardingData) {
          try {
            const onboardingData = JSON.parse(savedOnboardingData);
            console.log('Found saved onboarding data, creating profile...');
            setProcessingOnboarding(true);
            createProfileMutation.mutate(onboardingData);
          } catch (error) {
            console.error('Error parsing saved onboarding data:', error);
            localStorage.removeItem('onboardingData');
          }
        }
      }
    }
  }, [isAuthenticated, isLoading, profile, profileError, profileLoading, processingOnboarding, createProfileMutation]);

  // Calculate state variables
  const needsOnboarding = !profile || !profile.onboardingCompleted;
  const needsPlanGeneration = profile && profile.onboardingCompleted && !personalizedPlan;

  // Auto-generate plan if user has completed onboarding but no plan
  useEffect(() => {
    if (needsPlanGeneration && !planLoading) {
      console.log('Auto-generating missing personalized plan...');
      apiRequest("POST", "/api/complete-onboarding")
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/personalized-plan"] });
          toast({
            title: "Plan Generated!",
            description: "Your personalized workout plan is ready!",
          });
        })
        .catch((error) => {
          console.error("Error auto-generating plan:", error);
          toast({
            title: "Plan Generation Failed",
            description: "Please try refreshing the page.",
            variant: "destructive",
          });
        });
    }
  }, [needsPlanGeneration, planLoading, queryClient, toast]);

  // Get user's first name for personalized greeting
  const userName = user?.firstName || user?.email?.split('@')[0] || 'there';
  
  // Calculate data for dashboard components based on selected date
  const todaysWorkout = personalizedPlan?.workoutPlan?.days?.[0];
  const macroTargets = personalizedPlan?.macroTargets || {};
  
  // Mock data that varies by selected date (in real app, this would come from API)
  const today = new Date();
  const isPast = selectedDate < today;
  const isToday = selectedDate.toDateString() === today.toDateString();
  const dayOffset = Math.floor((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const workoutTypes = ["Push Day", "Pull Day", "Leg Day", "Cardio", "Rest Day"];
  const selectedWorkoutType = workoutTypes[Math.abs(dayOffset) % workoutTypes.length];
  
  const dashboardData = {
    calories: {
      consumed: isPast ? 1800 + (dayOffset * 50) : (isToday ? 1200 : 0),
      target: macroTargets.dailyCalories || 2000,
      remaining: Math.max((macroTargets.dailyCalories || 2000) - (isPast ? 1800 + (dayOffset * 50) : (isToday ? 1200 : 0)), 0)
    },
    workout: {
      type: selectedWorkoutType,
      focus: selectedWorkoutType === "Rest Day" ? "Recovery and stretching" : `${selectedWorkoutType} focused training`,
      duration: selectedWorkoutType === "Rest Day" ? "30 min" : "45 min",
      exerciseCount: selectedWorkoutType === "Rest Day" ? 0 : (5 + Math.abs(dayOffset) % 3)
    },
    macros: {
      protein: { 
        current: isPast ? 120 + (dayOffset * 10) : (isToday ? 80 : 0), 
        target: macroTargets.protein_g || 150, 
        unit: 'g', 
        color: '#E67E22' 
      },
      carbs: { 
        current: isPast ? 180 + (dayOffset * 20) : (isToday ? 150 : 0), 
        target: macroTargets.carbs_g || 200, 
        unit: 'g', 
        color: '#3498DB' 
      },
      fat: { 
        current: isPast ? 55 + (dayOffset * 5) : (isToday ? 45 : 0), 
        target: macroTargets.fat_g || 65, 
        unit: 'g', 
        color: '#E74C3C' 
      }
    },
    weeklySchedule: {
      [selectedDate.toISOString().split('T')[0]]: [
        { type: 'workout', title: selectedWorkoutType, time: '9:00 AM' },
        { type: 'meal', title: 'Meal Prep', time: '6:00 PM' }
      ]
    }
  };

  if (isLoading || profileLoading || planLoading || processingOnboarding || createProfileMutation.isPending) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center space-y-6 fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-[hsl(var(--blue-primary))] to-[hsl(var(--blue-secondary))] flex items-center justify-center">
            <KettlebellLogo className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-title1 text-[hsl(var(--text-primary))]">Setting up your experience</h2>
            <p className="text-body text-[hsl(var(--text-secondary))]">This may take a moment...</p>
          </div>
          <div className="w-64 h-1 bg-[hsl(var(--surface-secondary))] rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[hsl(var(--blue-primary))] to-[hsl(var(--blue-secondary))] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-[hsl(var(--blue-primary))] to-[hsl(var(--blue-secondary))] flex items-center justify-center">
            <KettlebellLogo className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-largeTitle text-[hsl(var(--text-primary))]">Welcome to Body Butler!</h2>
            <p className="text-body text-[hsl(var(--text-secondary))]">Let's get you set up with a personalized fitness plan</p>
          </div>
          <Button 
            onClick={() => setLocation("/onboarding")}
            className="gradient-button w-full"
          >
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  if (needsPlanGeneration) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-[hsl(var(--blue-primary))] to-[hsl(var(--blue-secondary))] flex items-center justify-center">
            <KettlebellLogo className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-largeTitle text-[hsl(var(--text-primary))]">Generating Your Plan</h2>
            <p className="text-body text-[hsl(var(--text-secondary))]">Our AI is creating your personalized workout and nutrition plan...</p>
          </div>
          <div className="w-full bg-[hsl(var(--surface-secondary))] rounded-full h-2">
            <div className="bg-gradient-to-r from-[hsl(var(--blue-primary))] to-[hsl(var(--blue-secondary))] h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Header Banner - Blue Background */}
      <header className="bg-gradient-to-r from-orange-700 to-orange-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-white text-xl font-black tracking-widest uppercase">
            BODY BUTLER
          </h1>
        </div>
      </header>

      {/* Main Content with Glassmorphism Cards */}
      <main className="max-w-md mx-auto px-6 py-8 pb-28 min-h-screen">
        <div className="space-y-6">
          {/* Calendar Card */}
          <div className="glass-card">
            <DateNavigator 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onCalendarOpen={() => setIsCalendarOpen(true)} 
            />
          </div>

          {/* Circular Calorie Tracker Card - Elevated */}
          <div className="glass-card-elevated">
            <CircularCalorieTracker
              consumed={dashboardData.calories.consumed}
              target={dashboardData.calories.target}
              remaining={dashboardData.calories.remaining}
            />
          </div>

          {/* Workout Card */}
          <div className="glass-card">
            <WorkoutCard
              workoutType={dashboardData.workout.type}
              focus={dashboardData.workout.focus}
              duration={dashboardData.workout.duration}
              exerciseCount={dashboardData.workout.exerciseCount}
              onLogWorkout={() => setLocation("/workout-log")}
            />
          </div>

          {/* Diet Card */}
          <div className="glass-card">
            <MacroTrackerCard
              protein={dashboardData.macros.protein}
              carbs={dashboardData.macros.carbs}
              fat={dashboardData.macros.fat}
            />
          </div>
        </div>
      </main>

      {/* Weekly Calendar Modal */}
      <WeeklyCalendarModal 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDateSelect={(date) => {
          setSelectedDate(date);
          setIsCalendarOpen(false);
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}