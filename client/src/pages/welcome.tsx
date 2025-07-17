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
            variant="outline"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 w-full border-2 border-orange-600 hover:bg-orange-600 hover:text-white font-semibold py-4 rounded-xl transition-colors bg-[#ffffff] text-[#005c70]"
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
