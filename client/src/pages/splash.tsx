import { useEffect } from "react";
import { useLocation } from "wouter";
import KettlebellLogo from "@/components/ui/kettlebell-logo";

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/welcome");
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-md mx-auto px-4 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-1000">
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
    </div>
  );
}