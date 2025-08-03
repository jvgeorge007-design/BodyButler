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
      <div className="max-w-md mx-auto px-4 py-4">
        {selectedDate ? (
          <div className="space-y-3">
            {/* Top Row: Logo, Date, and Profile Icon */}
            <div className="flex items-center justify-between">
              {/* PeakU Logo */}
              <div className="flex items-center justify-start w-24 h-10">
                <img 
                  src={peakuLogo} 
                  alt="PeakU Logo" 
                  className="w-24 h-12 object-contain"
                />
              </div>

              <h2 className="text-xl font-bold text-white flex-1 text-center">
                {formatDate(selectedDate)}
              </h2>

              <div className="flex items-center justify-end w-24 h-10">
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

            {/* Summit Progress Tracker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">Summit Progress</span>
                  {activityStreak > 0 && (
                    <div className="flex items-center gap-1 ml-2">
                      <Mountain className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-medium">{activityStreak} day trek</span>
                    </div>
                  )}
                </div>
                <span className="text-white text-sm">{Math.round(summitProgressPercentage)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summitProgressPercentage}%` }}
                />
              </div>
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