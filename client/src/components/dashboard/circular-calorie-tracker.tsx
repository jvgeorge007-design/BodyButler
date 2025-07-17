import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CircularCalorieTrackerProps {
  consumed: number;
  target: number;
  remaining: number;
}

export default function CircularCalorieTracker({
  consumed,
  target,
  remaining
}: CircularCalorieTrackerProps) {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  
  // SVG circle parameters - Large center focus like reference
  const size = 240;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative">
      {/* Card content without background - parent has glassmorphism */}
      <div className="relative z-10">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              fill="none"
            />
            
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#gradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              className="animate-fill-circle"
              style={{
                '--target-offset': `${strokeDashoffset}`,
                '--circumference': `${circumference}`
              } as any}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(320, 100%, 70%)" />
                <stop offset="50%" stopColor="hsl(280, 100%, 65%)" />
                <stop offset="100%" stopColor="hsl(260, 100%, 60%)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-light text-white mb-2 animate-pulse-once heading-serif">
                {remaining}
              </div>
              <div className="text-sm text-gray-400 uppercase font-medium tracking-widest body-sans">
                REMAINING
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Reference image style */}
      <div className="grid grid-cols-3 gap-8 text-center mt-12">
        <div>
          <div className="text-3xl font-light text-orange-400 mb-2 heading-serif">{target}</div>
          <div className="text-xs text-gray-400 uppercase font-medium tracking-widest body-sans">GOAL</div>
        </div>
        
        <div>
          <div className="text-3xl font-light text-gray-400 mb-2 heading-serif">{consumed}</div>
          <div className="text-xs text-gray-400 uppercase font-medium tracking-widest body-sans">FOOD</div>
        </div>
        
        <div>
          <div className="text-3xl font-light text-purple-400 mb-2 heading-serif">0</div>
          <div className="text-xs text-gray-400 uppercase font-medium tracking-widest body-sans">EXERCISE</div>
        </div>
      </div>
      </div>

    </div>
  );
}