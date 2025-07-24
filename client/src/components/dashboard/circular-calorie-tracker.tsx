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
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative">
      {/* Cal. text in upper left corner */}
      <div className="absolute top-0 left-0 z-20">
        <span className="text-sm font-medium body-sans" style={{color: 'rgb(180, 180, 190)'}}>Cal.</span>
      </div>
      
      {/* Card content without background - parent has glassmorphism */}
      <div className="relative z-10 pt-6">
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
            
            {/* Gradient definition - Dark blue to light blue like WHOOP */}
            <defs>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(0, 84, 166)" />
                <stop offset="50%" stopColor="rgb(0, 122, 255)" />
                <stop offset="100%" stopColor="rgb(52, 199, 235)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-light mb-1 animate-pulse-once heading-serif" style={{color: 'rgb(235, 235, 240)'}}>
                {remaining}
              </div>
              <div className="text-sm uppercase font-medium tracking-widest body-sans" style={{color: 'rgb(180, 180, 190)'}}>
                REMAINING
              </div>
            </div>
          </div>
        </div>
      </div>


      </div>

    </div>
  );
}