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
  const macros = [protein, carbs, fat];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Macronutrients</h3>
      
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
    </div>
  );
}