import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";

import OnboardingHeader from "@/components/onboarding/onboarding-header";
import Section1 from "@/components/onboarding/section-1";
import Section2 from "@/components/onboarding/section-2";
import Section3 from "@/components/onboarding/section-3";
import Section4 from "@/components/onboarding/section-4";
import Section5 from "@/components/onboarding/section-5";
import Section6 from "@/components/onboarding/section-6";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { Button } from "@/components/ui/button";

const TOTAL_SECTIONS = 6;

export default function Onboarding() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0); // 0 = intro, 1-6 = sections
  const [formData, setFormData] = useState({});

  const { data: existingProfile, error } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated && !isLoading,
    retry: false,
  });

  // Allow access to onboarding for both authenticated and non-authenticated users
  // Non-authenticated users can fill out the form, then sign up at the end

  // Handle unauthorized errors only for authenticated users trying to load existing profiles
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error) && isAuthenticated) {
      toast({
        title: "Session expired",
        description: "Please log in again to continue...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast, isAuthenticated]);

  useEffect(() => {
    if (existingProfile) {
      setFormData(existingProfile);
    }
  }, [existingProfile]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
      setLocation("/");
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateFormData = (sectionData: any) => {
    setFormData(prev => ({ ...prev, ...sectionData }));
  };

  const handleNext = (sectionData?: any) => {
    if (sectionData) {
      updateFormData(sectionData);
    }
    
    if (currentSection < TOTAL_SECTIONS) {
      setCurrentSection(currentSection + 1);
    } else {
      // Final submission
      const finalData = { ...formData, ...sectionData, onboardingCompleted: true };
      
      if (!isAuthenticated) {
        // For non-authenticated users, store data locally and prompt to sign up
        localStorage.setItem('onboardingData', JSON.stringify(finalData));
        toast({
          title: "Onboarding Complete!",
          description: "Please sign up to save your personalized plan.",
        });
        setLocation("/login");
      } else {
        // For authenticated users, save to the backend
        saveMutation.mutate(finalData);
      }
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleBeginOnboarding = () => {
    setCurrentSection(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Introduction screen
  if (currentSection === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-white">
        <div className="w-full max-w-sm mx-auto text-center space-y-8">
          {/* Logo (Smaller) */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
              <KettlebellLogo className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Introduction Content */}
          <div className="space-y-6">
            {/* Greeting */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Hi, I'm BB —<br/>Your Body Butler
              </h1>
              
              {/* Description */}
              <div className="space-y-4">
                <p className="text-gray-600 text-base font-medium leading-relaxed">
                  To create your personalized transformation plan,
                </p>
                <p className="text-gray-600 text-base font-medium leading-relaxed">
                  I'll ask a few quick questions about your body, lifestyle, and goals.
                </p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Quick Setup</span>
                <span className="text-blue-500 font-semibold">6 steps</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-0 transition-all duration-300"></div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button 
              onClick={handleBeginOnboarding}
              className="w-full gradient-button"
            >
              Let's Begin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding sections
  return (
    <div className="min-h-screen bg-white">
      <OnboardingHeader 
        currentSection={currentSection}
        totalSections={TOTAL_SECTIONS}
        onBack={handleBack}
      />
      
      <div className="pb-8">
        {currentSection === 1 && (
          <Section1 
            data={formData}
            onNext={handleNext}
            isLoading={saveMutation.isPending}
          />
        )}
        {currentSection === 2 && (
          <Section2 
            data={formData}
            onNext={handleNext}
            isLoading={saveMutation.isPending}
          />
        )}
        {currentSection === 3 && (
          <Section3 
            data={formData}
            onNext={handleNext}
            isLoading={saveMutation.isPending}
          />
        )}
        {currentSection === 4 && (
          <Section4 
            data={formData}
            onNext={handleNext}
            isLoading={saveMutation.isPending}
          />
        )}
        {currentSection === 5 && (
          <Section5 
            data={formData}
            onNext={handleNext}
            isLoading={saveMutation.isPending}
          />
        )}
        {currentSection === 6 && (
          <Section6 
            data={formData}
            onNext={handleNext}
            isLoading={saveMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
