import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import KettlebellLogo from "@/components/ui/kettlebell-logo";

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
        <div className="flex flex-col items-center">
          {/* Body Butler Logo */}
          <KettlebellLogo className="w-60 h-72" />
          
          {/* Main Title */}
          <div className="space-y-2 -mt-4">
            <h1 className="text-4xl font-black text-gray-900 leading-none tracking-tighter">
              BODY BUTLER
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Transformation tailored to you
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-8">
          {/* Get Started Button (Primary) */}
          <Button 
            onClick={handleGetStarted}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-colors"
          >
            Get Started
          </Button>
          
          {/* Log In Button (Secondary) */}
          <Button 
            onClick={handleLogin}
            variant="outline"
            className="w-full border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-semibold py-4 rounded-xl transition-colors"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
