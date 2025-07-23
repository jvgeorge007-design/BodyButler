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
          {largeTitle ? (
            <div>
              <h1 className="text-title-1 font-bold" style={{
                background: 'linear-gradient(90deg, rgb(0, 183, 225) 0%, rgb(0, 183, 225) 30%, rgb(0, 189, 184) 70%, rgb(0, 195, 142) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{title}</h1>
            </div>
          ) : (
            <div>
              <h1 className="text-headline font-semibold" style={{
                background: 'linear-gradient(90deg, rgb(0, 183, 225) 0%, rgb(0, 183, 225) 30%, rgb(0, 189, 184) 70%, rgb(0, 195, 142) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{title}</h1>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center">
          {rightButton}
        </div>
      </div>
    </div>
  );
}