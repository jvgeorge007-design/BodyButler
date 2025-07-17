import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import KettlebellLogo from "@/components/ui/kettlebell-logo";

export default function Welcome() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/onboarding");
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm mx-auto text-center space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          {/* Body Butler Logo */}
          <KettlebellLogo className="w-60 h-72" />
          
          {/* Main Title */}
          <div className="space-y-2 -mt-4">
            <h1 className="text-4xl font-black text-white leading-none tracking-widest heading-serif">
              BODY BUTLER
            </h1>
            <p className="text-white/80 text-lg font-medium body-sans">
              Transformation tailored to you
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
            className="w-full bg-white text-[rgb(0,95,115)] font-medium py-4 px-8 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 active:scale-95 min-h-[48px] min-w-[48px] border-2 border-[rgb(0,95,115)] hover:bg-[rgb(0,95,115)] hover:text-white"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
