import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Calendar, Dumbbell, Utensils, Target, TrendingUp, LogOut } from "lucide-react";

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
      return await apiRequest("/api/auth/complete-onboarding", {
        method: "POST",
        body: JSON.stringify(onboardingData),
      });
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
            console.log('Found saved onboarding data, creating profile...', onboardingData);
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

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleWorkoutLog = () => {
    setLocation("/workout-log");
  };

  const handleMealLog = () => {
    setLocation("/meal-log");
  };

  const handleCompleteOnboarding = () => {
    setLocation("/onboarding");
  };

  if (isLoading || profileLoading || planLoading || processingOnboarding || createProfileMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          {processingOnboarding || createProfileMutation.isPending ? (
            <div className="space-y-2">
              <p className="text-lg font-medium">Setting up your profile...</p>
              <p className="text-sm text-gray-600">Generating your personalized plan with AI</p>
            </div>
          ) : (
            <p className="text-gray-600">Loading...</p>
          )}
        </div>
      </div>
    );
  }

  const needsOnboarding = !profile || !profile.onboardingCompleted || !personalizedPlan;

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <KettlebellLogo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Body Butler</h1>
                <p className="text-sm text-gray-600">Welcome!</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Onboarding Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Complete Your Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">
                Complete your onboarding to get your personalized fitness and nutrition plan.
              </p>
              <Button onClick={handleCompleteOnboarding} className="w-full">
                Complete Onboarding
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const todaysWorkout = personalizedPlan?.workoutPlan?.days?.[0] || null;
  const macroTargets = personalizedPlan?.macroTargets || {};

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <KettlebellLogo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Body Butler</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.firstName || profile?.onboardingData?.name || 'there'}!
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Today</p>
                  <p className="text-xs text-gray-600">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Calories</p>
                  <p className="text-xs text-gray-600">{macroTargets.dailyCalories || 0} target</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Workout */}
        {todaysWorkout && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5" />
                <span>Today's Workout</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">{todaysWorkout.focus}</h3>
                <p className="text-sm text-gray-600">{todaysWorkout.day}</p>
              </div>
              
              <div className="space-y-2">
                {todaysWorkout.exercises?.slice(0, 3).map((exercise: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{exercise.name}</span>
                    <span className="text-xs text-gray-500">{exercise.sets}x{exercise.reps}</span>
                  </div>
                ))}
                {todaysWorkout.exercises?.length > 3 && (
                  <p className="text-xs text-gray-500">+{todaysWorkout.exercises.length - 3} more exercises</p>
                )}
              </div>
              
              <Button onClick={handleWorkoutLog} className="w-full">
                Start Workout
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Macro Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="w-5 h-5" />
              <span>Today's Nutrition</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Calories</span>
                  <span>0 / {macroTargets.dailyCalories || 0}</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Protein</span>
                  <span>0g / {macroTargets.protein_g || 0}g</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Carbs</span>
                  <span>0g / {macroTargets.carbs_g || 0}g</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Fat</span>
                  <span>0g / {macroTargets.fat_g || 0}g</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
            
            <Button onClick={handleMealLog} variant="outline" className="w-full">
              Log Meal
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleWorkoutLog} variant="outline" className="h-20 flex flex-col space-y-2">
            <Dumbbell className="w-6 h-6" />
            <span className="text-sm">Log Workout</span>
          </Button>
          
          <Button onClick={handleMealLog} variant="outline" className="h-20 flex flex-col space-y-2">
            <Utensils className="w-6 h-6" />
            <span className="text-sm">Log Meal</span>
          </Button>
        </div>
      </div>
    </div>
  );
}