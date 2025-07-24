import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import KettlebellLogo from "@/components/ui/kettlebell-logo";

export default function Splash() {
  const [, setLocation] = useLocation();
  const [showCTA, setShowCTA] = useState(false);

  // Show CTA after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCTA(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center space-y-8">
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

          {/* Subtle CTA */}
          {showCTA && (
            <Button
              onClick={handleContinue}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/80 font-medium px-6 py-3 rounded-full border border-white/20 transition-all duration-300 animate-in fade-in"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}