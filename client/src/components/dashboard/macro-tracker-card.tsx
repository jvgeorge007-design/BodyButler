import { Utensils, TrendingDown, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { IOSButton } from "@/components/ui/ios-button";
import { UnifiedFoodInterface } from "./unified-food-interface";

interface MacroData {
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface MacroTrackerCardProps {
  protein: MacroData;
  carbs: MacroData;
  fat: MacroData;
}

export default function MacroTrackerCard({
  protein,
  carbs,
  fat
}: MacroTrackerCardProps) {
  const [showUnifiedInterface, setShowUnifiedInterface] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const macros = [
    { ...protein, name: 'Protein' },
    { ...carbs, name: 'Carbs' },
    { ...fat, name: 'Fat' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only trigger once
        }
      },
      {
        threshold: 1.0 // Trigger when 100% of the element is visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Progressive disclosure logic
  const totalCalories = macros.reduce((sum, macro) => sum + (macro.current * (macro.name === 'Protein' ? 4 : macro.name === 'Carbs' ? 4 : 9)), 0);
  const averageProgress = macros.reduce((sum, macro) => sum + (macro.current / macro.target), 0) / macros.length;
  const needsAttention = macros.filter(macro => (macro.current / macro.target) < 0.5);
  const isOnTrack = averageProgress >= 0.7;

  return (
    <div ref={containerRef} className="bg-transparent relative">
      {/* Fork and knife icon in upper left corner */}
      <div className="absolute top-0 left-0">
        <Utensils className="w-5 h-5" style={{color: 'rgb(180, 180, 190)'}} />
      </div>
      
      <div className="space-y-5 pt-8">
        {macros.map((macro, index) => {
          const percentage = Math.min((macro.current / macro.target) * 100, 100);
          const macroNames = ['Protein', 'Carbs', 'Fat'];
          
          // New color scheme for macro bars
          const barColors = [
            { gradient: 'linear-gradient(90deg, #2CD6D6, #26C4C4)', shadow: '#2CD6D6' }, // Protein - Cyan
            { gradient: 'linear-gradient(90deg, #3CD8A3, #32C693)', shadow: '#3CD8A3' }, // Carbs - Green  
            { gradient: 'linear-gradient(90deg, #FF9A8B, #F5847B)', shadow: '#FF9A8B' }  // Fat - Coral
          ];
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium body-sans" style={{color: 'rgb(235, 235, 240)'}}>
                  {macroNames[index]}
                </span>
                <span className="text-sm font-semibold body-sans" style={{color: 'rgb(235, 235, 240)'}}>
                  {macro.current}g / {macro.target}g
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-system-xs h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-2000 ease-out ${isVisible ? 'animate-fill-bar' : ''}`}
                  style={{ 
                    '--target-width': `${percentage}%`,
                    width: isVisible ? undefined : '0%',
                    background: barColors[index].gradient
                  } as React.CSSProperties & { '--target-width': string }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-medium body-sans" style={{color: 'rgb(180, 180, 190)'}}>
                  {macro.target - macro.current}g remaining
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progressive Disclosure for Macro Details */}
      {needsAttention.length > 0 && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-system-md">
          <div className="flex items-center gap-2 text-orange-400 text-callout font-medium">
            <TrendingDown className="w-4 h-4" />
            {needsAttention.length} macro{needsAttention.length > 1 ? 's' : ''} need attention
          </div>
        </div>
      )}

      {/* Smart Action Button - Consolidated Food Management */}
      <div className="flex items-center justify-between mt-6">
        <button 
          onClick={() => setShowUnifiedInterface(true)}
          className="flex-1 flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-system-md haptic-medium transition-all duration-300"
        >
          <Utensils className="w-5 h-5" style={{color: 'rgb(0, 122, 255)'}} />
          <span className="text-body font-medium" style={{color: 'rgb(235, 235, 240)'}}>
            Food
          </span>
          {isOnTrack ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-orange-400" />
          )}
        </button>
        
        {/* Optional: Show detailed breakdown toggle */}
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="ml-3 p-3 hover:bg-white/10 rounded-system-md haptic-light"
        >
          {showDetails ? 
            <ChevronUp className="w-5 h-5" style={{color: 'rgb(180, 180, 190)'}} /> :
            <ChevronDown className="w-5 h-5" style={{color: 'rgb(180, 180, 190)'}} />
          }
        </button>
      </div>

      {/* Progressive Disclosure: Detailed Breakdown */}
      {showDetails && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-system-md">
          <div className="text-callout font-medium text-gray-400 mb-3">Daily Breakdown</div>
          <div className="space-y-2">
            <div className="flex justify-between text-footnote">
              <span style={{color: 'rgb(180, 180, 190)'}}>Total Calories</span>
              <span style={{color: 'rgb(235, 235, 240)'}}>{Math.round(totalCalories)} kcal</span>
            </div>
            <div className="flex justify-between text-footnote">
              <span style={{color: 'rgb(180, 180, 190)'}}>Overall Progress</span>
              <span style={{color: isOnTrack ? 'rgb(74, 222, 128)' : 'rgb(251, 113, 133)'}}>
                {Math.round(averageProgress * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Unified Food Interface */}
      <UnifiedFoodInterface 
        isOpen={showUnifiedInterface}
        onClose={() => setShowUnifiedInterface(false)}
        macros={macros}
      />
    </div>
  );
}