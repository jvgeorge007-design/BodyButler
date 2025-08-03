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
  
  // SVG circle parameters - Compact size for half-width cards
  const size = 120;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative">
      {/* Card content without background - parent has glassmorphism */}
      <div className="relative z-10">
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(180, 180, 190, 0.2)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#orangeGradient)"
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
            
            {/* Gradient definition - Reduced saturation blue gradient */}
            <defs>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(96, 165, 250)" />
                <stop offset="50%" stopColor="rgb(59, 130, 246)" />
                <stop offset="100%" stopColor="rgb(37, 99, 235)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-light mb-1 animate-pulse-once heading-serif" style={{color: 'rgb(235, 235, 240)'}}>
                {remaining}
              </div>
              <div className="text-sm uppercase font-medium tracking-widest body-sans" style={{color: 'rgb(180, 180, 190)'}}>
                CALORIES LEFT
              </div>
            </div>
          </div>
        </div>
      </div>


      </div>

    </div>
  );
}