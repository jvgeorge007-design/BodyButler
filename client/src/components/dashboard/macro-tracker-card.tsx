import { BookOpen, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import FoodLogPopup from "./food-log-popup";
import AddFoodCarousel from "./add-food-carousel";

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
  const [showAddFoodCarousel, setShowAddFoodCarousel] = useState(false);
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
    <div ref={containerRef} className="bg-transparent">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-light text-white heading-serif">Diet</h3>
        <button 
          onClick={() => setShowFoodLog(true)}
          className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95"
        >
          <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
      </div>
      
      <div className="space-y-5">
        {macros.map((macro, index) => {
          const percentage = Math.min((macro.current / macro.target) * 100, 100);
          const macroNames = ['Protein', 'Carbs', 'Fat'];
          
          // Richer, darker hues - 2-3 shades deeper than previous
          const barColors = [
            { gradient: 'linear-gradient(90deg, #9333ea, #7c3aed)', shadow: '#9333ea' }, // Protein - Purple-600/700 (much richer)
            { gradient: 'linear-gradient(90deg, #ca8a04, #a16207)', shadow: '#ca8a04' }, // Carbs - Yellow-600/700 (darker mustard yellow)  
            { gradient: 'linear-gradient(90deg, #e11d48, #be123c)', shadow: '#e11d48' }  // Fat - Rose-600/700 (richer red)
          ];
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white body-sans">
                  {macroNames[index]}
                </span>
                <span className="text-sm font-semibold text-white body-sans">
                  {macro.current}g / {macro.target}g
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-2000 ease-out shadow-lg ${isVisible ? 'animate-fill-bar' : ''}`}
                  style={{ 
                    '--target-width': `${percentage}%`,
                    width: isVisible ? undefined : '0%',
                    background: barColors[index].gradient,
                    boxShadow: `0 0 12px ${barColors[index].shadow}`
                  } as React.CSSProperties & { '--target-width': string }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-white font-medium body-sans">
                  {macro.target - macro.current}g remaining
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Food Button */}
      <button 
        onClick={() => setShowAddFoodCarousel(true)}
        className="w-full mt-6 bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white font-medium py-3 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Food
      </button>

      {/* Food Log Popup */}
      <FoodLogPopup 
        isOpen={showFoodLog}
        onClose={() => setShowFoodLog(false)}
      />
      
      {/* Add Food Carousel */}
      <AddFoodCarousel 
        isOpen={showAddFoodCarousel}
        onClose={() => setShowAddFoodCarousel(false)}
      />
    </div>
  );
}