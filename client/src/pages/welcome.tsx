import { Button } from "@/components/ui/button";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/onboarding");
  };

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-sm mx-auto text-center space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-6">
          {/* Blue Kettlebell Logo */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
            <KettlebellLogo className="w-12 h-12 text-white" />
          </div>
          
          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Welcome to<br/>Body Butler
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Your personal guide to smarter<br/>workouts and nutrition.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-8">
          {/* Get Started Button (Primary) */}
          <Button 
            onClick={handleGetStarted}
            className="w-full gradient-button"
          >
            Get Started
          </Button>
          
          {/* Log In Button (Secondary) */}
          <Button 
            onClick={handleLogin}
            variant="outline"
            className="w-full outline-button"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
