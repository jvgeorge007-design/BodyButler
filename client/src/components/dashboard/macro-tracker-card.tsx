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
    <div ref={containerRef} className="bg-transparent relative h-full flex flex-col">
      <div className="flex flex-col h-full">
        {/* Protein and Carbs */}
        <div>
          {/* Protein */}
          <div>
            {(() => {
              const macro = macros[0]; // Protein
              const percentage = Math.min((macro.current / macro.target) * 100, 100);
              const barColor = { gradient: 'linear-gradient(90deg, #FCD34D, #F59E0B)', shadow: '#FCD34D' }; // Protein - Less saturated amber
              
              return (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium body-sans" style={{color: 'rgb(235, 235, 240)'}}>
                      Protein
                    </span>
                    <span className="text-xs font-medium body-sans whitespace-nowrap" style={{color: 'rgb(180, 180, 190)'}}>
                      {macro.target - macro.current}g left
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-system-xs h-1 overflow-hidden">
                    <div 
                      className={`h-1 rounded-full transition-all duration-2000 ease-out ${isVisible ? 'animate-fill-bar' : ''}`}
                      style={{ 
                        '--target-width': `${percentage}%`,
                        width: isVisible ? undefined : '0%',
                        background: barColor.gradient
                      } as React.CSSProperties & { '--target-width': string }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
          
          {/* Carbs - pushed down */}
          <div className="pt-6">
            {(() => {
              const macro = macros[1]; // Carbs
              const percentage = Math.min((macro.current / macro.target) * 100, 100);
              const barColor = { gradient: 'linear-gradient(90deg, #6EE7B7, #34D399)', shadow: '#6EE7B7' }; // Carbs - Less saturated emerald
              
              return (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium body-sans" style={{color: 'rgb(235, 235, 240)'}}>
                      Carbs
                    </span>
                    <span className="text-xs font-medium body-sans whitespace-nowrap" style={{color: 'rgb(180, 180, 190)'}}>
                      {macro.target - macro.current}g left
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-system-xs h-1 overflow-hidden">
                    <div 
                      className={`h-1 rounded-full transition-all duration-2000 ease-out ${isVisible ? 'animate-fill-bar' : ''}`}
                      style={{ 
                        '--target-width': `${percentage}%`,
                        width: isVisible ? undefined : '0%',
                        background: barColor.gradient
                      } as React.CSSProperties & { '--target-width': string }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Fat - Pushed much further down */}
        <div className="mt-auto pt-10">
          {(() => {
            const macro = macros[2]; // Fat
            const percentage = Math.min((macro.current / macro.target) * 100, 100);
            const barColor = { gradient: 'linear-gradient(90deg, #C4B5FD, #A78BFA)', shadow: '#C4B5FD' }; // Fat - Less saturated violet
            
            return (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium body-sans" style={{color: 'rgb(235, 235, 240)'}}>
                    Fat
                  </span>
                  <span className="text-xs font-medium body-sans whitespace-nowrap" style={{color: 'rgb(180, 180, 190)'}}>
                    {macro.target - macro.current}g left
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-system-xs h-1 overflow-hidden">
                  <div 
                    className={`h-1 rounded-full transition-all duration-2000 ease-out ${isVisible ? 'animate-fill-bar' : ''}`}
                    style={{ 
                      '--target-width': `${percentage}%`,
                      width: isVisible ? undefined : '0%',
                      background: barColor.gradient
                    } as React.CSSProperties & { '--target-width': string }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      

      
      {/* Food Log Popup */}
      <FoodLogPopup 
        isOpen={showFoodLog}
        onClose={() => setShowFoodLog(false)}
      />
    </div>
  );
}