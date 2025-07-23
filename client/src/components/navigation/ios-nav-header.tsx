import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface IOSNavHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightButton?: React.ReactNode;
  largeTitle?: boolean;
}

export default function IOSNavHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBack, 
  rightButton,
  largeTitle = false 
}: IOSNavHeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="ios-nav-header" style={{
      background: 'rgba(20, 20, 25, 0.9)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="flex items-center justify-between px-4 py-2" style={{
        paddingTop: `calc(env(safe-area-inset-top) + 8px)`
      }}>
        {/* Left Side */}
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="ios-haptic-light ios-spring-fast ios-touch-target flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 ios-blue" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Center Title */}
        <div className="flex-1 text-center">
        </div>

        {/* Right Side */}
        <div className="flex items-center">
          {rightButton}
        </div>
      </div>
    </div>
  );
}