import { X } from "lucide-react";
import { useModal } from "@/contexts/modal-context";
import { useEffect } from "react";

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
  const { registerModal, unregisterModal } = useModal();
  
  useEffect(() => {
    if (isOpen) {
      registerModal('food-log-popup', onClose);
    } else {
      unregisterModal('food-log-popup');
    }
    
    return () => {
      unregisterModal('food-log-popup');
    };
  }, [isOpen, onClose, registerModal, unregisterModal]);
  
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" style={{
        background: 'rgba(20, 20, 25, 0.4)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 rounded-t-2xl" style={{
          background: 'rgba(20, 20, 25, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black heading-serif" style={{color: 'rgb(235, 235, 240)'}}>Food Log</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-gray-800"
              style={{color: 'rgb(180, 180, 190)'}}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Food Button */}
        <div className="px-6 pt-4">
          <button 
            onClick={() => {/* Will be handled by parent component */}}
            className="w-full gradient-button"
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
                  <h3 className="text-lg font-bold heading-serif" style={{color: 'rgb(235, 235, 240)'}}>{meal}</h3>
                  <div className="text-sm body-sans" style={{color: 'rgb(180, 180, 190)'}}>
                    {totals.calories} cal
                  </div>
                </div>
                
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(20, 20, 25, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium body-sans" style={{color: 'rgb(235, 235, 240)'}}>{entry.name}</h4>
                          <p className="text-sm body-sans" style={{color: 'rgb(180, 180, 190)'}}>{entry.amount}</p>
                        </div>
                        <div className="text-sm font-semibold body-sans" style={{color: 'rgb(235, 235, 240)'}}>
                          {entry.calories} cal
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs body-sans">
                        <span style={{color: '#2CD6D6'}}>P: {entry.protein}g</span>
                        <span style={{color: '#3CD8A3'}}>C: {entry.carbs}g</span>
                        <span style={{color: '#FF9A8B'}}>F: {entry.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Meal Totals */}
                <div className="p-3 rounded-xl" style={{
                  background: 'rgba(0, 183, 225, 0.1)',
                  border: '1px solid rgba(0, 183, 225, 0.3)'
                }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold body-sans" style={{color: 'rgb(235, 235, 240)'}}>{meal} Total</span>
                    <span className="font-bold body-sans" style={{color: 'rgb(235, 235, 240)'}}>{totals.calories} cal</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1 body-sans">
                    <span style={{color: '#2CD6D6'}}>Protein: {totals.protein}g</span>
                    <span style={{color: '#3CD8A3'}}>Carbs: {totals.carbs}g</span>
                    <span style={{color: '#FF9A8B'}}>Fat: {totals.fat}g</span>
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