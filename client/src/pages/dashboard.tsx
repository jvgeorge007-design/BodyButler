import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Plus, TrendingUp, Calendar, Flame, Target, ChevronRight, User, Zap, Activity, Heart } from "lucide-react";
import BottomNav from "@/components/navigation/bottom-nav";
import CircularProgress from "@/components/ui/circular-progress";

// Cal AI-inspired dashboard components
const PhotoFoodLogger = ({ onScanPhoto }: { onScanPhoto: () => void }) => (
  <div className="calm-card">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white">Log Your Meal</h3>
      <Camera className="w-6 h-6 text-white/60" />
    </div>
    <p className="text-white/70 text-sm mb-6">
      Snap a photo to instantly track calories and macros
    </p>
    <Button 
      onClick={onScanPhoto}
      className="w-full gradient-button ios-touch-target"
    >
      <Camera className="w-4 h-4 mr-2" />
      Take Photo
    </Button>
  </div>
);

const CalorieDisplay = ({ consumed, target, remaining }: { consumed: number; target: number; remaining: number }) => {
  const percentage = Math.min((consumed / target) * 100, 100);
  
  return (
    <div className="calm-card text-center">
      {/* Large calorie number - 3x bigger as suggested */}
      <div className="mb-6">
        <div className="text-6xl font-bold text-white mb-2">
          {remaining.toLocaleString()}
        </div>
        <div className="text-white/70 text-lg">
          calories left today
        </div>
      </div>
      
      {/* Circular progress ring with gradient */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
          <defs>
            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="url(#calorieGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Flame className="w-8 h-8 text-white/80" />
        </div>
      </div>
      
      {/* Consumed stats */}
      <div className="text-white/60 text-sm">
        <span className="font-medium text-white">{consumed.toLocaleString()}</span> eaten
      </div>
    </div>
  );
};

const MacroCard = ({ 
  name, 
  current, 
  target, 
  unit, 
  color, 
  icon 
}: { 
  name: string; 
  current: number; 
  target: number; 
  unit: string; 
  color: string; 
  icon: React.ReactNode; 
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);
  
  return (
    <div className="calm-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-white/80 text-sm font-medium">{name}</span>
        </div>
        <span className="text-white/60 text-xs">{remaining.toFixed(0)}{unit} left</span>
      </div>
      
      <div className="relative w-16 h-16 mx-auto mb-3">
        <CircularProgress 
          percentage={percentage}
          size={64}
          strokeWidth={6}
          color={color}
          backgroundColor="rgba(255,255,255,0.2)"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{current.toFixed(0)}</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-white/60 text-xs">
          {current.toFixed(0)} / {target.toFixed(0)}{unit}
        </div>
      </div>
    </div>
  );
};

const WeeklyCalendar = ({ selectedDate, onDateSelect }: { selectedDate: Date; onDateSelect: (date: Date) => void }) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  return (
    <div className="calm-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">This Week</h3>
        <Calendar className="w-5 h-5 text-white/60" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`p-2 rounded-xl text-center transition-all ${
                isSelected 
                  ? 'bg-blue-500 text-white' 
                  : isToday 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:bg-white/10'
              }`}
            >
              <div className="text-xs font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-sm font-bold mt-1">
                {date.getDate()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const RecentlyLogged = ({ items }: { items: any[] }) => (
  <div className="calm-card">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Recently Logged</h3>
      <ChevronRight className="w-5 h-5 text-white/60" />
    </div>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="text-xl">🍎</span>
          </div>
          <div className="flex-1">
            <div className="text-white font-medium text-sm">{item.name}</div>
            <div className="text-white/60 text-xs">{item.time} • {item.calories} cal</div>
          </div>
          <div className="text-white/60 text-xs">
            P{item.protein}g • C{item.carbs}g • F{item.fat}g
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActionButton = ({ 
  icon, 
  label, 
  description, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  description: string; 
  onClick: () => void; 
}) => (
  <button 
    onClick={onClick}
    className="w-full calm-card hover:bg-white/15 transition-all flex items-center gap-4"
  >
    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-1 text-left">
      <div className="text-white font-medium">{label}</div>
      <div className="text-white/60 text-sm">{description}</div>
    </div>
    <ChevronRight className="w-5 h-5 text-white/60" />
  </button>
);

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [processingOnboarding, setProcessingOnboarding] = useState(false);

  // Get user profile
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useQuery({
    queryKey: ['/api/profile'],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  // Get personalized plan
  const { 
    data: personalizedPlan, 
    isLoading: planLoading, 
    error: planError 
  } = useQuery({
    queryKey: ['/api/personalized-plan'],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  // Create profile mutation for processing saved onboarding data
  const createProfileMutation = useMutation({
    mutationFn: async (onboardingData: any) => {
      const response = await apiRequest('POST', '/api/profile', onboardingData);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Profile created successfully:', data);
      localStorage.removeItem('onboardingData');
      setProcessingOnboarding(false);
      refetchProfile();
      toast({
        title: "Profile Created!",
        description: "Your profile has been set up successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      setProcessingOnboarding(false);
      toast({
        title: "Profile Creation Failed",
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

  // Get user's first name for personalized greeting
  const userName = (user as any)?.firstName || (user as any)?.email?.split("@")[0] || "there";

  // Get daily nutrition data from Vision API
  const { data: dailyNutrition } = useQuery({
    queryKey: ["/api/daily-nutrition", selectedDate.toISOString().split('T')[0]],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  // Calculate dashboard data
  const macroTargets = (personalizedPlan as any)?.macroTargets || {};
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  
  // Real data from Vision API or defaults
  const consumedCalories = (dailyNutrition as any)?.totals?.calories || 0;
  const consumedMacros = (dailyNutrition as any)?.totals?.macros || { protein: 0, carbs: 0, fat: 0 };
  
  const dashboardData = {
    calories: {
      consumed: consumedCalories,
      target: macroTargets.dailyCalories || 2500,
      remaining: Math.max((macroTargets.dailyCalories || 2500) - consumedCalories, 0),
    },
    macros: {
      protein: {
        current: consumedMacros.protein,
        target: macroTargets.protein_g || 180,
        unit: "g",
        color: "#EF4444", // Red for protein (universal convention)
        icon: <Target className="w-4 h-4 text-red-400" />
      },
      carbs: {
        current: consumedMacros.carbs,
        target: macroTargets.carbs_g || 250,
        unit: "g",
        color: "#F97316", // Orange for carbs
        icon: <Flame className="w-4 h-4 text-orange-400" />
      },
      fat: {
        current: consumedMacros.fat,
        target: macroTargets.fat_g || 80,
        unit: "g",
        color: "#3B82F6", // Blue for fats
        icon: <TrendingUp className="w-4 h-4 text-blue-400" />
      },
    },
    recentItems: (dailyNutrition as any)?.meals?.slice(-2).map((meal: any) => ({
      name: meal.foodItems.join(', ').substring(0, 20) + '...',
      time: new Date(meal.timestamp).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      calories: meal.totalCalories,
      protein: meal.macros.protein,
      carbs: meal.macros.carbs,
      fat: meal.macros.fat,
      image: "/placeholder-food.jpg"
    })) || [],
    insights: (dailyNutrition as any)?.insights || []
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
            <h2 className="text-2xl font-bold text-white">
              Setting up your experience
            </h2>
            <p className="text-white/70">
              This may take a moment...
            </p>
          </div>
          <div className="w-64 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate state variables
  const needsOnboarding = !profile || !(profile as any)?.onboardingCompleted;
  const needsPlanGeneration =
    profile && (profile as any)?.onboardingCompleted && !personalizedPlan;

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

  if (needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-md w-full text-center space-y-8 fade-in">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <KettlebellLogo className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">
              Welcome to Body Butler!
            </h2>
            <p className="text-white/70">
              Let's get you set up with a personalized fitness plan
            </p>
          </div>
          <Button
            onClick={() => setLocation("/onboarding")}
            className="w-full gradient-button ios-touch-target"
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
            <h2 className="text-3xl font-bold text-white">
              Generating Your Plan
            </h2>
            <p className="text-white/70">
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
      {/* Header with App Name and Streak */}
      <div className="flex items-center justify-between p-6 pt-12">
        <div className="flex items-center gap-3">
          <KettlebellLogo className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Body Butler</h1>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 font-medium">15</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 pb-32">
        {/* Weekly Calendar */}
        <WeeklyCalendar 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Main Calorie Display with Gradient Circle */}
        <div className="mb-6">
          <CalorieDisplay
            consumed={dashboardData.calories.consumed}
            target={dashboardData.calories.target}
            remaining={dashboardData.calories.remaining}
          />
        </div>

        {/* Macro Cards - Separate cards with individual progress rings */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <MacroCard {...dashboardData.macros.protein} name="Protein" />
          <MacroCard {...dashboardData.macros.carbs} name="Carbs" />
          <MacroCard {...dashboardData.macros.fat} name="Fat" />
        </div>

        {/* Photo-first logging as primary interaction */}
        <div className="mb-6">
          <PhotoFoodLogger onScanPhoto={() => setLocation("/photo-food-logger")} />
        </div>

        {/* Recently logged with visual meal history */}
        {dashboardData.recentItems.length > 0 && (
          <div className="mb-6">
            <RecentlyLogged items={dashboardData.recentItems} />
          </div>
        )}

        {/* Daily AI Insights */}
        {dashboardData.insights.length > 0 && (
          <div className="mb-6">
            <div className="calm-card">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Today's Insights
              </h3>
              <div className="space-y-3">
                {dashboardData.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-white/90 text-sm leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <QuickActionButton
            icon={<TrendingUp className="w-5 h-5 text-white/80" />}
            label="Progress"
            description="View your fitness journey"
            onClick={() => setLocation("/progress")}
          />
          <QuickActionButton
            icon={<Target className="w-5 h-5 text-white/80" />}
            label="Workouts"
            description="Today's training plan"
            onClick={() => setLocation("/workout")}
          />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
      
      {/* Floating Add Button (Cal AI style) */}
      <button 
        onClick={() => setLocation("/photo-food-logger")}
        className="fixed bottom-24 right-6 w-14 h-14 ios-bg-blue ios-corner-radius-large flex items-center justify-center shadow-lg z-50 transition-all ios-touch-target"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}