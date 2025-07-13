import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading, error } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  // Mutation to complete onboarding with saved data
  const completeOnboardingMutation = useMutation({
    mutationFn: async (onboardingData: any) => {
      await apiRequest("POST", "/api/auth/complete-onboarding", { onboardingData });
    },
    onSuccess: () => {
      localStorage.removeItem('onboardingData');
      toast({
        title: "Welcome to Body Butler!",
        description: "Your personalized plan is being generated...",
      });
    },
    onError: (error) => {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
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
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  // Check for saved onboarding data after login
  useEffect(() => {
    if (isAuthenticated && !profileLoading) {
      const savedData = localStorage.getItem('onboardingData');
      if (savedData) {
        try {
          const onboardingData = JSON.parse(savedData);
          completeOnboardingMutation.mutate(onboardingData);
        } catch (error) {
          console.error("Error parsing saved onboarding data:", error);
          localStorage.removeItem('onboardingData');
        }
      }
    }
  }, [isAuthenticated, profileLoading]);

  const handleCompleteOnboarding = () => {
    setLocation("/onboarding");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const needsOnboarding = !profile || !profile.onboardingCompleted;

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
              <p className="text-sm text-gray-600">Welcome back, {user?.firstName || "there"}!</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="sm"
          >
            Log Out
          </Button>
        </div>

        {/* Main Content */}
        {needsOnboarding ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Complete Your Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">
                Let's create your personalized fitness and nutrition plan. It only takes a few minutes!
              </p>
              <Button 
                onClick={handleCompleteOnboarding}
                className="w-full gradient-button"
              >
                Complete Onboarding
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {profile.name}</p>
                  <p><strong>Goals:</strong> {profile.goals}</p>
                  <p><strong>Workout Days:</strong> {profile.workoutDaysPerWeek} days/week</p>
                  <p><strong>Sleep:</strong> {profile.sleepHours} hours/night</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gradient-button">
                  Start Today's Workout
                </Button>
                <Button variant="outline" className="w-full">
                  View Meal Plan
                </Button>
                <Button variant="outline" className="w-full">
                  Track Progress
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
