import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogOut, Dumbbell, Utensils, TrendingUp, Calendar } from "lucide-react";

// Import our new dashboard components
import StreakTracker from "@/components/dashboard/streak-tracker";
import ProgressCard from "@/components/dashboard/progress-card";
import DailyOverview from "@/components/dashboard/daily-overview";
import CalendarWidget from "@/components/dashboard/calendar-widget";
import FloatingChat from "@/components/dashboard/floating-chat";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [processingOnboarding, setProcessingOnboarding] = useState(false);

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
  
  // Calculate mock data for engagement mechanics (in real app, this would come from API)
  const mockData = {
    streaks: {
      workoutStreak: 5,
      mealStreak: 7,
      longestStreak: 12
    },
    todaysWorkout: personalizedPlan?.workoutPlan?.days?.[0] ? {
      name: personalizedPlan.workoutPlan.days[0].day,
      focus: personalizedPlan.workoutPlan.days[0].focus,
      duration: "45 min",
      completed: false
    } : undefined,
    calorieProgress: {
      consumed: 1200,
      target: personalizedPlan?.macroTargets?.dailyCalories || 2000
    },
    weeklyProgress: {
      workoutsCompleted: 3,
      workoutsPlanned: 6,
      mealsLogged: 5,
      mealsPlanned: 7
    },
    weeklySchedule: {
      // This would normally come from your API
      [new Date().toISOString().split('T')[0]]: [
        { type: 'workout', title: 'Push Day', time: '9:00 AM' },
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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header with personalized greeting */}
      <header className="system-blur border-b border-[hsl(var(--border))] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[hsl(var(--blue-primary))] to-[hsl(var(--blue-secondary))] flex items-center justify-center">
              <KettlebellLogo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-title2 text-[hsl(var(--text-primary))]">Welcome back, {userName}</h1>
              <p className="text-caption2">Your plan is ready</p>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = '/api/logout'}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Streak Tracker */}
          <StreakTracker {...mockData.streaks} />

          {/* Daily Overview */}
          <DailyOverview 
            todaysWorkout={mockData.todaysWorkout}
            calorieProgress={mockData.calorieProgress}
          />

          {/* Progress Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressCard
              title="Weekly Workouts"
              current={mockData.weeklyProgress.workoutsCompleted}
              total={mockData.weeklyProgress.workoutsPlanned}
              description="Keep the momentum going!"
              icon={<Dumbbell className="w-5 h-5 text-[hsl(var(--blue-primary))]" />}
              color="hsl(var(--blue-primary))"
              showCheckmarks={true}
            />
            <ProgressCard
              title="Nutrition Goals"
              current={mockData.weeklyProgress.mealsLogged}
              total={mockData.weeklyProgress.mealsPlanned}
              description="Excellent consistency!"
              icon={<Utensils className="w-5 h-5 text-[hsl(var(--success))]" />}
              color="hsl(var(--success))"
              showCheckmarks={true}
            />
          </div>

          {/* Calendar Widget */}
          <CalendarWidget weeklySchedule={mockData.weeklySchedule} />

          {/* Quick Actions */}
          <div className="calm-card">
            <h3 className="text-headline text-[hsl(var(--text-primary))] mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => setLocation("/workout-log")}
                variant="outline"
                className="h-20 flex flex-col items-center gap-3 min-h-[44px] rounded-2xl border-[hsl(var(--border))] hover:border-[hsl(var(--blue-primary))] hover:bg-[hsl(var(--blue-primary))]/5 transition-all duration-200"
              >
                <Dumbbell className="w-6 h-6 text-[hsl(var(--blue-primary))]" />
                <span className="text-callout">Start Workout</span>
              </Button>
              <Button
                onClick={() => setLocation("/meal-log")}
                variant="outline"
                className="h-20 flex flex-col items-center gap-3 min-h-[44px] rounded-2xl border-[hsl(var(--border))] hover:border-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/5 transition-all duration-200"
              >
                <Utensils className="w-6 h-6 text-[hsl(var(--success))]" />
                <span className="text-callout">Log Meal</span>
              </Button>
              <Button
                onClick={() => setLocation("/workout-calendar")}
                variant="outline"
                className="h-20 flex flex-col items-center gap-3 min-h-[44px] rounded-2xl border-[hsl(var(--border))] hover:border-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/5 transition-all duration-200"
              >
                <Calendar className="w-6 h-6 text-[hsl(var(--warning))]" />
                <span className="text-callout">View Calendar</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center gap-3 min-h-[44px] rounded-2xl border-[hsl(var(--border))] hover:border-[hsl(var(--blue-secondary))] hover:bg-[hsl(var(--blue-secondary))]/5 transition-all duration-200"
              >
                <TrendingUp className="w-6 h-6 text-[hsl(var(--blue-secondary))]" />
                <span className="text-callout">Progress</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat */}
      <FloatingChat />
    </div>
  );
}