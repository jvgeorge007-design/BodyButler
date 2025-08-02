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
  const consumedCalories = dailyNutrition?.totals?.calories || 0;
  const consumedMacros = dailyNutrition?.totals?.macros || { protein: 0, carbs: 0, fat: 0 };
  
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
    recentItems: dailyNutrition?.meals?.slice(-2).map((meal: any) => ({
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
    insights: dailyNutrition?.insights || []
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

  // Get current date info for the top card
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // Calculate health score average (based on recent meal logs)
  const averageHealthScore = dailyNutrition?.meals?.length > 0 
    ? dailyNutrition.meals.reduce((sum: number, meal: any) => sum + (meal.healthScore || 7), 0) / dailyNutrition.meals.length
    : 7.8;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 pb-32">
        {/* Top Progress Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6" />
              <span className="text-lg font-medium">{dayName}, {monthDay}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">5 day trek</span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-sm text-white/80 mb-1">Summit Progress</div>
            <div className="text-right text-2xl font-bold text-white/90">2,100m</div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full mb-4"></div>
          
          <p className="text-white/90 text-sm leading-relaxed">
            Great momentum - the vista ahead is spectacular
          </p>
        </div>

        {/* Today's Trail Guide Card */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-orange-800">Today's Trail Guide</h3>
          </div>
          
          <p className="text-orange-700 text-sm leading-relaxed">
            Perfect conditions for your ascent today. Your energy peaks after morning protein - 
            since yesterday was a rest day, this afternoon's 45-minute trek will feel 
            energizing rather than draining.
          </p>
        </div>

        {/* Trail Fuel Card - using existing CalorieDisplay component with new styling */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-800">Trail Fuel</h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            </div>
          </div>
          
          {/* Calories Remaining Circle - reusing CalorieDisplay logic */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32">
                <CircularProgress 
                  percentage={((dashboardData.calories.target - dashboardData.calories.remaining) / dashboardData.calories.target) * 100}
                  size={128}
                  strokeWidth={12}
                  color="#3B82F6"
                  backgroundColor="#E5E7EB"
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-blue-600">{dashboardData.calories.remaining}</div>
                <div className="text-xs text-blue-500">cal remaining</div>
              </div>
            </div>
          </div>
          
          {/* Macro Bars - using existing macro data */}
          <div className="space-y-3">
            {/* Protein */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Protein</span>
              <span className="text-sm font-bold text-blue-800">{dashboardData.macros.protein.current}g</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${Math.min((dashboardData.macros.protein.current / dashboardData.macros.protein.target) * 100, 100)}%` }}
              />
            </div>
            
            {/* Carbs */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Carbs</span>
              <span className="text-sm font-bold text-blue-800">{dashboardData.macros.carbs.current}g</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${Math.min((dashboardData.macros.carbs.current / dashboardData.macros.carbs.target) * 100, 100)}%` }}
              />
            </div>
            
            {/* Fat */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Fat</span>
              <span className="text-sm font-bold text-blue-800">{dashboardData.macros.fat.current}g</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${Math.min((dashboardData.macros.fat.current / dashboardData.macros.fat.target) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Wellness + Workout Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Wellness Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-green-600" />
              <h4 className="text-sm font-bold text-green-800">Wellness</h4>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {averageHealthScore.toFixed(1)}
              </div>
              <div className="text-xs text-green-600">avg health score</div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-green-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${(averageHealthScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Workout Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm font-bold text-purple-800">Workout</h4>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                45
              </div>
              <div className="text-xs text-purple-600">min planned</div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-purple-200 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full w-3/4" />
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Bottom Navigation */}
      <BottomNav />
      
      {/* Floating Add Button (Cal AI style) */}
      <button 
        onClick={() => setLocation("/photo-food-logger")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-50 transition-all"
      >
        <Camera className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}