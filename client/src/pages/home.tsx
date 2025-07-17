import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const needsOnboarding = !profile || !profile.onboardingCompleted;

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-700 to-orange-800 rounded-2xl flex items-center justify-center">
              <KettlebellLogo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white heading-serif">Body Butler</h1>
              <p className="text-sm text-white/80 body-sans">Welcome back, {user?.firstName || "there"}!</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-white border-white/30 hover:bg-white/10"
          >
            Log Out
          </Button>
        </div>

        {/* Main Content */}
        {needsOnboarding ? (
          <div className="glass-card p-6">
            <div className="space-y-4">
              <h2 className="text-center font-black text-white heading-serif">Complete Your Setup</h2>
              <p className="text-center text-white/80 body-sans">
                Let's create your personalized fitness and nutrition plan. It only takes a few minutes!
              </p>
              <Button 
                onClick={handleCompleteOnboarding}
                className="w-full bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95"
              >
                Complete Onboarding
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-black text-white heading-serif mb-4">Your Profile</h2>
              <div className="space-y-2 text-white body-sans">
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Goals:</strong> {profile.goals}</p>
                <p><strong>Workout Days:</strong> {profile.workoutDaysPerWeek} days/week</p>
                <p><strong>Sleep:</strong> {profile.sleepHours} hours/night</p>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-black text-white heading-serif mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95">
                  Start Today's Workout
                </Button>
                <Button variant="outline" className="w-full text-white border-white/30 hover:bg-white/10">
                  View Meal Plan
                </Button>
                <Button variant="outline" className="w-full text-white border-white/30 hover:bg-white/10">
                  Track Progress
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
