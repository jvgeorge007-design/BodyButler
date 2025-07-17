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
      <main className="max-w-md mx-auto ios-padding min-h-screen flex flex-col items-center justify-center" style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 40px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)'
      }}>
        <div className="w-full text-center ios-spacing-large">
          {/* Logo Section */}
          <div className="flex flex-col items-center ios-spacing-large">
            {/* Body Butler Logo */}
            <KettlebellLogo className="w-60 h-72" />
            
            {/* Main Title */}
            <div className="ios-spacing-medium -mt-4">
              <h1 className="text-largeTitle font-black text-white leading-none tracking-widest heading-serif">
                BODY BUTLER
              </h1>
              <p className="text-title3 text-white/80 font-medium body-sans">
                Transformation tailored to you
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ios-spacing-large pt-8">
            {/* Get Started Button (Primary) */}
            <Button 
              onClick={handleGetStarted}
              className="w-full gradient-button ios-touch-target ios-spacing-small"
            >
              Get Started
            </Button>
            
            {/* Log In Button (Secondary) */}
            <Button 
              onClick={handleLogin}
              className="w-full bg-white text-[rgb(0,95,115)] font-medium py-4 px-8 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 active:scale-95 ios-touch-target border-2 border-[rgb(0,95,115)] hover:bg-[rgb(0,95,115)] hover:text-white"
            >
              Log In
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
