import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Plus, TrendingUp, Calendar, Flame, Target, ChevronRight } from "lucide-react";
import BottomNav from "@/components/navigation/bottom-nav";
import CircularProgress from "@/components/ui/circular-progress";

// Cal AI-inspired dashboard components
const PhotoFoodLogger = ({ onScanPhoto }: { onScanPhoto: () => void }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white">Log Your Meal</h3>
      <Camera className="w-6 h-6 text-white/60" />
    </div>
    <p className="text-white/70 text-sm mb-6">
      Snap a photo to instantly track calories and macros
    </p>
    <Button 
      onClick={onScanPhoto}
      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-2xl transition-all"
    >
      <Camera className="w-4 h-4 mr-2" />
      Take Photo
    </Button>
  </div>
);

const CalorieDisplay = ({ consumed, target, remaining }: { consumed: number; target: number; remaining: number }) => {
  const percentage = Math.min((consumed / target) * 100, 100);
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center">
      {/* Large calorie number - 3x bigger as suggested */}
      <div className="mb-6">
        <div className="text-6xl font-bold text-white mb-2">
          {remaining.toLocaleString()}
        </div>
        <div className="text-white/70 text-lg">
          calories left today
        </div>
      </div>
      
      {/* Circular progress ring */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <CircularProgress 
          percentage={percentage}
          size={128}
          strokeWidth={8}
          color="#3B82F6"
          backgroundColor="rgba(255,255,255,0.2)"
        />
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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-white font-medium">{name}</span>
        </div>
        <span className="text-xs text-white/60">{remaining}{unit} left</span>
      </div>
      
      {/* Large current number */}
      <div className="mb-3">
        <span className="text-3xl font-bold text-white">
          {current}
        </span>
        <span className="text-white/60 ml-1">/{target}{unit}</span>
      </div>
      
      {/* Progress ring */}
      <div className="relative w-16 h-16">
        <CircularProgress 
          percentage={percentage}
          size={64}
          strokeWidth={6}
          color={color}
          backgroundColor="rgba(255,255,255,0.2)"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const RecentlyLogged = ({ items }: { items: any[] }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
    <h3 className="text-xl font-semibold text-white mb-4">Recently logged</h3>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl">
          <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
            <img 
              src={item.image || "/placeholder-food.jpg"} 
              alt={item.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="flex-1">
            <div className="font-medium text-white">{item.name}</div>
            <div className="text-sm text-white/60">{item.time}</div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-medium text-white flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {item.calories} kcal
              </span>
              <span className="text-xs text-red-400">{item.protein}g</span>
              <span className="text-xs text-orange-400">{item.carbs}g</span>
              <span className="text-xs text-blue-400">{item.fat}g</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const WeeklyCalendar = ({ selectedDate, onDateSelect }: { selectedDate: Date; onDateSelect: (date: Date) => void }) => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date();
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return date;
  });

  return (
    <div className="flex justify-between items-center mb-6">
      {currentWeek.map((date, index) => {
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const isToday = date.toDateString() === today.toDateString();
        
        return (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            <span className="text-xs mb-1">{days[index]}</span>
            <span className={`text-lg font-medium ${isToday && !isSelected ? 'text-blue-400' : ''}`}>
              {date.getDate()}
            </span>
            {/* Logged indicator dot */}
            <div className={`w-1 h-1 rounded-full mt-1 ${
              Math.random() > 0.3 ? 'bg-green-400' : 'bg-transparent'
            }`} />
          </button>
        );
      })}
    </div>
  );
};

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
    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
  >
    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-1 text-left">
      <div className="font-medium text-white">{label}</div>
      <div className="text-sm text-white/60">{description}</div>
    </div>
    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
  </button>
);

export default function DashboardV2() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [processingOnboarding, setProcessingOnboarding] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Get user's first name for personalized greeting
  const userName = (user as any)?.firstName || (user as any)?.email?.split("@")[0] || "there";

  // Calculate dashboard data
  const macroTargets = (personalizedPlan as any)?.macroTargets || {};
  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  
  // Mock data that would come from your nutrition database
  const dashboardData = {
    calories: {
      consumed: isToday ? 1200 : 0,
      target: macroTargets.dailyCalories || 2500,
      remaining: Math.max((macroTargets.dailyCalories || 2500) - (isToday ? 1200 : 0), 0),
    },
    macros: {
      protein: {
        current: isToday ? 78 : 0,
        target: macroTargets.protein_g || 180,
        unit: "g",
        color: "#EF4444", // Red for protein (universal convention)
        icon: <Target className="w-4 h-4 text-red-400" />
      },
      carbs: {
        current: isToday ? 89 : 0,
        target: macroTargets.carbs_g || 250,
        unit: "g",
        color: "#F97316", // Orange for carbs
        icon: <Flame className="w-4 h-4 text-orange-400" />
      },
      fat: {
        current: isToday ? 48 : 0,
        target: macroTargets.fat_g || 80,
        unit: "g",
        color: "#3B82F6", // Blue for fats
        icon: <TrendingUp className="w-4 h-4 text-blue-400" />
      },
    },
    recentItems: [
      {
        name: "Apple Salmon salad...",
        time: "9:00am",
        calories: 500,
        protein: 78,
        carbs: 78,
        fat: 78,
        image: "/placeholder-salad.jpg"
      },
      {
        name: "Weight lifting",
        time: "12:42 PM",
        calories: 50,
        protein: 0,
        carbs: 0,
        fat: 0,
        image: "/placeholder-workout.jpg"
      }
    ]
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-2xl"
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

        {/* Main Calorie Display - Single screen dashboard as suggested */}
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
          <PhotoFoodLogger onScanPhoto={() => setLocation("/scan-receipt")} />
        </div>

        {/* Recently logged with visual meal history */}
        <div className="mb-6">
          <RecentlyLogged items={dashboardData.recentItems} />
        </div>

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
        onClick={() => setLocation("/add-food")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-50 transition-all"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}