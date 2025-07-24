import { BookOpen, Utensils } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { IOSButton } from "@/components/ui/ios-button";
import FoodLogPopup from "./food-log-popup";

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
  const [showFoodLog, setShowFoodLog] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const macros = [protein, carbs, fat];

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



  return (
    <div ref={containerRef} className="bg-transparent relative">
      {/* Fork and knife icon in upper left corner */}
      <div className="absolute top-0 left-0">
        <Utensils className="w-5 h-5" style={{color: 'rgb(180, 180, 190)'}} />
      </div>
      
      {/* Book icon in upper right corner */}
      <div className="absolute top-0 right-0">
        <button 
          onClick={() => setShowFoodLog(true)}
          className="p-1 hover:bg-white/10 rounded-system-sm haptic-light"
        >
          <BookOpen className="w-5 h-5" strokeWidth={2.5} style={{color: 'rgb(180, 180, 190)'}} />
        </button>
      </div>
      
      <div className="space-y-5 pt-8">
        {macros.map((macro, index) => {
          const percentage = Math.min((macro.current / macro.target) * 100, 100);
          const macroNames = ['Protein', 'Carbs', 'Fat'];
          
          // Blue-complementary color scheme for macro bars
          const barColors = [
            { gradient: 'linear-gradient(90deg, #F59E0B, #D97706)', shadow: '#F59E0B' }, // Protein - Amber
            { gradient: 'linear-gradient(90deg, #34D399, #10B981)', shadow: '#34D399' }, // Carbs - Emerald
            { gradient: 'linear-gradient(90deg, #A78BFA, #8B5CF6)', shadow: '#A78BFA' }  // Fat - Violet
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
      

      
      {/* Food Log Popup */}
      <FoodLogPopup 
        isOpen={showFoodLog}
        onClose={() => setShowFoodLog(false)}
      />
    </div>
  );
}