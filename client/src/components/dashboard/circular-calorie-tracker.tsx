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
  
  // SVG circle parameters - MyFitnessPal style
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden" style={{
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    }}>
      {/* Background shadow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 to-purple-100/40 rounded-3xl"></div>
      <div className="relative z-10">
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E8F4F8"
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
                <stop offset="0%" stopColor="#4A90E2" />
                <stop offset="100%" stopColor="#7B68EE" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1 animate-pulse-once">
                {remaining}
              </div>
              <div className="text-xs text-gray-500 uppercase font-medium tracking-wide">
                REMAINING
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - MyFitnessPal style */}
      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-lg font-bold text-emerald-600 mb-1">{target}</div>
          <div className="text-xs text-gray-500 uppercase font-medium tracking-wide">GOAL</div>
        </div>
        
        <div>
          <div className="text-lg font-bold text-blue-600 mb-1">{consumed}</div>
          <div className="text-xs text-gray-500 uppercase font-medium tracking-wide">FOOD</div>
        </div>
        
        <div>
          <div className="text-lg font-bold text-orange-500 mb-1">0</div>
          <div className="text-xs text-gray-500 uppercase font-medium tracking-wide">EXERCISE</div>
        </div>
      </div>
      </div>

    </div>
  );
}