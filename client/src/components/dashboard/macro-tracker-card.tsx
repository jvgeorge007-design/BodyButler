import { BookOpen } from "lucide-react";
import { useState } from "react";
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
  const macros = [protein, carbs, fat];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Macronutrients</h3>
        <button 
          onClick={() => setShowFoodLog(true)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
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
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: macro.color
                  }}
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
      <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Food
      </button>

      {/* Food Log Popup */}
      <FoodLogPopup 
        isOpen={showFoodLog}
        onClose={() => setShowFoodLog(false)}
      />
    </div>
  );
}