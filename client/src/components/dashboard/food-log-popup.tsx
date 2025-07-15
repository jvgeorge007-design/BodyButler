import { X } from "lucide-react";

interface FoodEntry {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: string;
}

interface FoodLogPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FoodLogPopup({ isOpen, onClose }: FoodLogPopupProps) {
  if (!isOpen) return null;

  // Mock food data for today
  const foodEntries: FoodEntry[] = [
    { name: "Greek Yogurt", amount: "1 cup", calories: 130, protein: 20, carbs: 9, fat: 0, meal: "Breakfast" },
    { name: "Banana", amount: "1 medium", calories: 105, protein: 1, carbs: 27, fat: 0, meal: "Breakfast" },
    { name: "Oatmeal", amount: "1/2 cup dry", calories: 150, protein: 5, carbs: 27, fat: 3, meal: "Breakfast" },
    { name: "Chicken Breast", amount: "6 oz", calories: 284, protein: 53, carbs: 0, fat: 6, meal: "Lunch" },
    { name: "Brown Rice", amount: "1 cup cooked", calories: 216, protein: 5, carbs: 45, fat: 2, meal: "Lunch" },
    { name: "Broccoli", amount: "1 cup", calories: 25, protein: 3, carbs: 5, fat: 0, meal: "Lunch" },
    { name: "Salmon", amount: "5 oz", calories: 231, protein: 31, carbs: 0, fat: 11, meal: "Dinner" },
    { name: "Sweet Potato", amount: "1 medium", calories: 112, protein: 2, carbs: 26, fat: 0, meal: "Dinner" },
    { name: "Spinach Salad", amount: "2 cups", calories: 14, protein: 2, carbs: 2, fat: 0, meal: "Dinner" }
  ];

  const mealGroups = foodEntries.reduce((groups, entry) => {
    if (!groups[entry.meal]) groups[entry.meal] = [];
    groups[entry.meal].push(entry);
    return groups;
  }, {} as Record<string, FoodEntry[]>);

  const getMealTotals = (entries: FoodEntry[]) => {
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + entry.calories,
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fat: totals.fat + entry.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Food Log</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Add Food Button */}
        <div className="px-6 pt-4">
          <button 
            onClick={() => {/* Will be handled by parent component */}}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-colors"
          >
            + Add Food
          </button>
        </div>

        {/* Food Entries by Meal */}
        <div className="p-6 space-y-6">
          {Object.entries(mealGroups).map(([meal, entries]) => {
            const totals = getMealTotals(entries);
            return (
              <div key={meal} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{meal}</h3>
                  <div className="text-sm text-gray-600">
                    {totals.calories} cal
                  </div>
                </div>
                
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-2xl border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{entry.name}</h4>
                          <p className="text-sm text-gray-600">{entry.amount}</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {entry.calories} cal
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="text-blue-600">P: {entry.protein}g</span>
                        <span className="text-green-600">C: {entry.carbs}g</span>
                        <span className="text-orange-600">F: {entry.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Meal Totals */}
                <div className="p-3 rounded-2xl bg-gray-100 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{meal} Total</span>
                    <span className="font-semibold text-gray-900">{totals.calories} cal</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-blue-600">Protein: {totals.protein}g</span>
                    <span className="text-green-600">Carbs: {totals.carbs}g</span>
                    <span className="text-orange-600">Fat: {totals.fat}g</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}