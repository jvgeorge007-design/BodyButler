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
    <div ref={containerRef} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Macronutrients</h3>
        <button 
          onClick={() => setShowFoodLog(true)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 active:brightness-110"
        >
          <BookOpen className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
        </button>
      </div>
      
      <div className="space-y-5">
        {macros.map((macro, index) => {
          const percentage = Math.min((macro.current / macro.target) * 100, 100);
          const macroNames = ['Protein', 'Carbs', 'Fat'];
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {macroNames[index]}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {macro.current}g / {macro.target}g
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-2000 ease-out shadow-sm ${isVisible ? 'animate-fill-bar' : ''}`}
                  style={{ 
                    '--target-width': `${percentage}%`,
                    width: isVisible ? undefined : '0%',
                    background: `linear-gradient(90deg, ${macro.color}, ${macro.color}dd)`,
                    boxShadow: `0 0 8px ${macro.color}40`
                  } as React.CSSProperties & { '--target-width': string }}
                />
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {Math.round(percentage)}%
                </span>
                <span className="text-xs" style={{ color: macro.color }}>
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
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-95 active:brightness-110 flex items-center justify-center gap-2"
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