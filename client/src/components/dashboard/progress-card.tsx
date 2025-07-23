import { TrendingUp } from "lucide-react";

export function ProgressCard() {
  return (
    <div className="bg-transparent">
      {/* Progress Content */}
      <div className="space-y-4">
        {/* Weekly Progress */}
        <div className="text-center">
          <div className="text-3xl font-bold heading-serif mb-1" style={{color: 'rgb(235, 235, 240)'}}>
            5
          </div>
          <div className="text-sm font-medium body-sans" style={{color: 'rgb(180, 180, 190)'}}>
            workouts this week
          </div>
        </div>
        
        {/* Trend Indicator */}
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4" style={{color: 'rgb(87, 168, 255)'}} />
          <span className="text-xs font-medium body-sans" style={{color: 'rgb(87, 168, 255)'}}>
            +2 from last week
          </span>
        </div>
      </div>
    </div>
  );
}