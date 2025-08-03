import { ArrowLeft, User, Mountain } from "lucide-react";
import { useLocation } from "wouter";
import peakuLogo from "@assets/image (1)_1754253759487.png";

interface IOSNavHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  rightButton?: React.ReactNode;
  largeTitle?: boolean;
  selectedDate?: Date;
  onProfileClick?: () => void;
  profile?: any;
  activityStreak?: number;
}

export default function IOSNavHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  onBack, 
  rightButton,
  largeTitle = false,
  selectedDate,
  onProfileClick,
  profile,
  activityStreak = 0
}: IOSNavHeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setLocation('/dashboard');
    }
  };

  // Calculate Summit Progress based on goal timeline
  const calculateSummitProgress = () => {
    if (!profile?.onboardingData?.timeline || !profile?.createdAt) {
      return 0; // No timeline data available
    }
    
    const timeline = profile.onboardingData.timeline.toLowerCase();
    const startDate = new Date(profile.createdAt);
    const currentDate = new Date();
    const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Map timeline strings to days
    let totalDays = 90; // Default 3 months
    if (timeline.includes('month')) {
      const months = parseInt(timeline.match(/\d+/)?.[0] || '3');
      totalDays = months * 30;
    } else if (timeline.includes('week')) {
      const weeks = parseInt(timeline.match(/\d+/)?.[0] || '12');
      totalDays = weeks * 7;
    } else if (timeline.includes('year')) {
      const years = parseInt(timeline.match(/\d+/)?.[0] || '1');
      totalDays = years * 365;
    }
    
    return Math.min((daysSinceStart / totalDays) * 100, 100);
  };

  const summitProgressPercentage = calculateSummitProgress();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <div className="ios-nav-header" style={{
      background: 'rgba(20, 20, 25, 0.9)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {selectedDate ? (
          /* Top Nav: Logo and Profile Icon Only */
          <div className="flex items-center justify-between">
            {/* PeakU Logo */}
            <div className="flex items-center justify-start">
              <img 
                src={peakuLogo} 
                alt="PeakU Logo" 
                className="w-24 h-12 object-contain"
              />
            </div>

            <div className="flex items-center justify-end">
              {onProfileClick ? (
                <button
                  onClick={onProfileClick}
                  className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                >
                  <User className="w-5 h-5 text-white/80" />
                </button>
              ) : rightButton ? (
                rightButton
              ) : (
                <div className="w-10" />
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {showBackButton ? (
              <button onClick={handleBack} className="p-2 -ml-2">
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
            ) : (
              <div className="w-10" />
            )}
            
            <div className="text-center flex-1">
              <h1 className={`font-bold text-white ${largeTitle ? 'text-2xl' : 'text-lg'}`}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-white/60 mt-1">{subtitle}</p>
              )}
            </div>

            {onProfileClick ? (
              <button
                onClick={onProfileClick}
                className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
              >
                <User className="w-5 h-5 text-white/80" />
              </button>
            ) : rightButton ? (
              rightButton
            ) : (
              <div className="w-10" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}