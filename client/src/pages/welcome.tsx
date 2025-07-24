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
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Logo and Title Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="calm-card mb-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Body Butler Logo */}
              <KettlebellLogo className="w-48 h-56" />
              
              {/* Main Title */}
              <div className="space-y-2">
                <h1 className="text-title1 font-black text-white/90 leading-none tracking-widest">
                  BODY BUTLER
                </h1>
                <p className="text-body text-white/70 font-medium">
                  Transformation tailored to you
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="calm-card w-full">
            <div className="space-y-4">
              {/* Log In Button (Primary) */}
              <Button 
                onClick={handleLogin}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 rounded-xl transition-colors"
              >
                Log In
              </Button>
              
              {/* Get Started Button (Secondary) */}
              <Button 
                onClick={handleGetStarted}
                className="w-full bg-white/10 hover:bg-white/20 text-white/90 font-medium py-4 rounded-xl border border-white/20 transition-colors"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
