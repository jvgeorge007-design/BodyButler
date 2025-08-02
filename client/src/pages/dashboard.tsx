import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { IOSButton } from "@/components/ui/ios-button";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import IOSNavHeader from "@/components/navigation/ios-nav-header";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dumbbell, Utensils, TrendingUp, Calendar, User, Mountain } from "lucide-react";

// Import our new dashboard components
import CircularCalorieTracker from "@/components/dashboard/circular-calorie-tracker";
import WorkoutCard from "@/components/dashboard/workout-card";
import MacroTrackerCard from "@/components/dashboard/macro-tracker-card";
import DateNavigator from "@/components/dashboard/date-navigator";
import WeeklyCalendarModal from "@/components/dashboard/weekly-calendar-modal";
import { ProgressCard } from "@/components/dashboard/progress-card";
import BottomNav from "@/components/navigation/bottom-nav";

// Banner component for date and summit progress
const DateBanner = ({ selectedDate, onProfileClick, profile, activityStreak }: { 
  selectedDate: Date; 
  onProfileClick: () => void;
  profile: any;
  activityStreak: number;
}) => {
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  
  // Calculate Summit Progress based on goal timeline
  const calculateSummitProgress = () => {
    if (!profile?.onboardingData?.timeline || !profile?.createdAt) {
      return 0; // No timeline data available
    }
    
    const timeline = profile.onboardingData.timeline.toLowerCase();
    const startDate = new Date(profile.createdAt);
    const currentDate = new Date();
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Map timeline strings to days
    let totalDays = 90; // Default 3 months
    if (timeline.includes('month')) {
      const months = parseInt(timeline.match(/\d+/)?.[0] || '3');
      totalDays = months * 30;
    } else if (timeline.includes('week')) {
      const weeks = parseInt(timeline.match(/\d+/)?.[0] || '12');
      totalDays = weeks * 7;
    } else if (timeline.includes('year')) {
      const years = parseInt(timeline.match(/\d+/)?.[0] || '1');
      totalDays = years * 365;
    }
    
    return Math.min((daysSinceStart / totalDays) * 100, 100);
  };
  
  const summitProgressPercentage = calculateSummitProgress();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <div className="calm-card mb-6">
      <div className="flex justify-between">
        {/* Left side - Date and Goal Progress */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {formatDate(selectedDate)}
            </h2>
            {/* Profile Button - aligned with heading */}
            <button
              onClick={onProfileClick}
              className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
            >
              <User className="w-6 h-6 text-white/80" />
            </button>
          </div>
          
          {/* Summit Progress Tracker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium">Summit Progress</span>
                {activityStreak > 0 && (
                  <div className="flex items-center gap-1 ml-2">
                    <Mountain className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-medium">{activityStreak} day trek</span>
                  </div>
                )}
              </div>
              <span className="text-white text-sm">{Math.round(summitProgressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${summitProgressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    if (urlParams.get("reset") === "true") {
      setSelectedDate(new Date());
      // Clean up the URL
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [location]);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const {
    data: personalizedPlan,
    isLoading: planLoading,
    error: planError,
  } = useQuery({
    queryKey: ["/api/personalized-plan"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  const {
    data: activityStreakData,
    isLoading: streakLoading,
  } = useQuery({
    queryKey: ["/api/activity-streak"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  // Mutation to create profile from saved onboarding data
  const createProfileMutation = useMutation({
    mutationFn: async (onboardingData: any) => {
      return await apiRequest(
        "POST",
        "/api/auth/complete-onboarding",
        onboardingData,
      );
    },
    onSuccess: () => {
      // Clear localStorage and refresh queries
      localStorage.removeItem("onboardingData");
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
        description:
          "There was an issue setting up your profile. Please try onboarding again.",
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
    if (
      (profileError && isUnauthorizedError(profileError as Error)) ||
      (planError && isUnauthorizedError(planError as Error))
    ) {
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
    if (
      isAuthenticated &&
      !isLoading &&
      !processingOnboarding &&
      !createProfileMutation.isPending
    ) {
      // Check if user has no profile but has saved onboarding data
      if (profileError && !profile && !profileLoading) {
        const savedOnboardingData = localStorage.getItem("onboardingData");

        if (savedOnboardingData) {
          try {
            const onboardingData = JSON.parse(savedOnboardingData);
            console.log("Found saved onboarding data, creating profile...");
            setProcessingOnboarding(true);
            createProfileMutation.mutate(onboardingData);
          } catch (error) {
            console.error("Error parsing saved onboarding data:", error);
            localStorage.removeItem("onboardingData");
          }
        }
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    profile,
    profileError,
    profileLoading,
    processingOnboarding,
    createProfileMutation,
  ]);

  // Calculate state variables
  const needsOnboarding = !profile || !profile.onboardingCompleted;
  const needsPlanGeneration =
    profile && profile.onboardingCompleted && !personalizedPlan;

  // Auto-generate plan if user has completed onboarding but no plan
  useEffect(() => {
    if (needsPlanGeneration && !planLoading) {
      console.log("Auto-generating missing personalized plan...");
      apiRequest("POST", "/api/complete-onboarding")
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: ["/api/personalized-plan"],
          });
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
  const userName = user?.firstName || user?.email?.split("@")[0] || "there";

  // Calculate data for dashboard components based on selected date
  const todaysWorkout = personalizedPlan?.workoutPlan?.days?.[0];
  const macroTargets = personalizedPlan?.macroTargets || {};

  // Mock data that varies by selected date (in real app, this would come from API)
  const today = new Date();
  const isPast = selectedDate < today;
  const isToday = selectedDate.toDateString() === today.toDateString();
  const dayOffset = Math.floor(
    (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const workoutTypes = [
    "Push Day",
    "Pull Day",
    "Leg Day",
    "Cardio",
    "Rest Day",
  ];
  const selectedWorkoutType =
    workoutTypes[Math.abs(dayOffset) % workoutTypes.length];

  const dashboardData = {
    calories: {
      consumed: isPast ? 1800 + dayOffset * 50 : isToday ? 1200 : 0,
      target: macroTargets.dailyCalories || 2000,
      remaining: Math.max(
        (macroTargets.dailyCalories || 2000) -
          (isPast ? 1800 + dayOffset * 50 : isToday ? 1200 : 0),
        0,
      ),
    },
    workout: {
      type: selectedWorkoutType,
      focus:
        selectedWorkoutType === "Rest Day"
          ? "Recovery and stretching"
          : `${selectedWorkoutType} focused training`,
      duration: selectedWorkoutType === "Rest Day" ? "30 min" : "45 min",
      exerciseCount:
        selectedWorkoutType === "Rest Day" ? 0 : 5 + (Math.abs(dayOffset) % 3),
    },
    macros: {
      protein: {
        current: isPast ? 120 + dayOffset * 10 : isToday ? 80 : 0,
        target: macroTargets.protein_g || 150,
        unit: "g",
        color: "#F59E0B", // Amber-500 - complementary to blue CTA
      },
      carbs: {
        current: isPast ? 180 + dayOffset * 20 : isToday ? 150 : 0,
        target: macroTargets.carbs_g || 200,
        unit: "g",
        color: "#34D399", // Emerald-400 - complementary to blue
      },
      fat: {
        current: isPast ? 55 + dayOffset * 5 : isToday ? 45 : 0,
        target: macroTargets.fat_g || 65,
        unit: "g",
        color: "#A78BFA", // Violet-400 - harmonious with blue palette
      },
    },
    weeklySchedule: {
      [selectedDate.toISOString().split("T")[0]]: [
        { type: "workout", title: selectedWorkoutType, time: "9:00 AM" },
        { type: "meal", title: "Meal Prep", time: "6:00 PM" },
      ],
    },
  };

  if (
    isLoading ||
    profileLoading ||
    planLoading ||
    processingOnboarding ||
    createProfileMutation.isPending
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center space-y-6 fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <KettlebellLogo className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-title1 text-white">
              Setting up your experience
            </h2>
            <p className="text-body text-white/70">
              This may take a moment...
            </p>
          </div>
          <div className="w-64 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
                 style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'}} />
          </div>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full text-center space-y-8 fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <KettlebellLogo className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-largeTitle text-white">
              Welcome to Body Butler!
            </h2>
            <p className="text-body text-white/70">
              Let's get you set up with a personalized fitness plan
            </p>
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
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full text-center space-y-8 fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <KettlebellLogo className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-largeTitle text-white">
              Generating Your Plan
            </h2>
            <p className="text-body text-white/70">
              Our AI is creating your personalized workout and nutrition plan...
            </p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: "70%" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

      {/* iOS Navigation Header */}
      <IOSNavHeader
        title="Body Butler"
        subtitle="Your personal fitness companion"
        largeTitle={true}
      />

      {/* Main Content with iOS-style spacing */}
      <main
        className="relative z-10 max-w-md mx-auto ios-padding min-h-screen"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 20px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 120px)",
        }}
      >
        <div className="ios-spacing-large">
          {/* Calendar Card */}
          <DateBanner 
            selectedDate={selectedDate}
            onProfileClick={() => setLocation("/settings")}
            profile={profile}
            activityStreak={activityStreakData?.streak || 0}
          />



          {/* Calorie Card Left, Workout Card Right */}
          <div className="flex gap-4">
            {/* Left: Circular Calorie Tracker */}
            <div className="calm-card w-1/2">
              <CircularCalorieTracker
                consumed={dashboardData.calories.consumed}
                target={dashboardData.calories.target}
                remaining={dashboardData.calories.remaining}
              />
            </div>
            
            {/* Right: Workout Card */}
            <div className="calm-card w-1/2">
              <WorkoutCard
                workoutType={dashboardData.workout.type}
                focus={dashboardData.workout.focus}
                duration={dashboardData.workout.duration}
                exerciseCount={dashboardData.workout.exerciseCount}
                onLogWorkout={() => setLocation("/workout")}
              />
            </div>
          </div>

          {/* Diet Card */}
          <div className="calm-card">
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
