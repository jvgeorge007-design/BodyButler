import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Calendar, Trophy, ChevronDown, ChevronRight, Info, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';

interface FoodLogSummary {
  date: string;
  meals: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
    snacks: any[];
  };
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    grade: string;
  };
  totalItems: number;
}

interface FoodLogSummaryProps {
  date?: string;
  className?: string;
}

export default function FoodLogSummary({ date = new Date().toISOString().split('T')[0], className = '' }: FoodLogSummaryProps) {
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<Record<string, number>>({});
  
  const queryClient = useQueryClient();
  
  const { data: foodLog, isLoading } = useQuery<FoodLogSummary>({
    queryKey: ['/api/receipt/food-log'],
    staleTime: 1000 * 30, // 30 seconds - fresh data for debugging
  });

  const deleteFoodItem = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest(`/api/receipt/food-log/${itemId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/receipt/food-log'] });
    },
  });

  const toggleMeal = (mealType: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleSwipeStart = (itemId: string, startX: number) => {
    setSwipeDirection(prev => ({ ...prev, [itemId]: startX }));
  };

  const handleSwipeMove = (itemId: string, currentX: number) => {
    const startX = swipeDirection[itemId];
    if (startX !== undefined) {
      const diff = startX - currentX;
      const element = document.getElementById(`item-${itemId}`);
      const deleteBackground = document.getElementById(`delete-${itemId}`);
      
      if (element && diff > 0) {
        const swipeDistance = Math.min(diff, 80);
        element.style.transform = `translateX(-${swipeDistance}px)`;
        element.style.opacity = diff > 40 ? '0.7' : '1';
        
        // Show delete background proportionally
        if (deleteBackground) {
          deleteBackground.style.transform = `translateX(${100 - (swipeDistance / 80) * 100}%)`;
        }
      }
    }
  };

  const handleSwipeEnd = (itemId: string, endX: number) => {
    const startX = swipeDirection[itemId];
    if (startX !== undefined) {
      const diff = startX - endX;
      const element = document.getElementById(`item-${itemId}`);
      const deleteBackground = document.getElementById(`delete-${itemId}`);
      
      if (diff > 80) {
        // Delete item
        deleteFoodItem.mutate(itemId);
      } else if (element) {
        // Reset position
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
        if (deleteBackground) {
          deleteBackground.style.transform = 'translateX(100%)';
        }
      }
      
      setSwipeDirection(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={`calm-card p-4 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!foodLog || foodLog.totalItems === 0) {
    return (
      <Card className={`calm-card p-4 text-center ${className}`}>
        <Calendar className="w-8 h-8 text-white/40 mx-auto mb-2" />
        <p className="text-white/60 text-sm">No food logged for today</p>
        <p className="text-white/40 text-xs mt-1">Start by scanning a receipt or adding food manually</p>
      </Card>
    );
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-400';
    if (grade.startsWith('B')) return 'text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-400';
    if (grade.startsWith('D')) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Summary */}
      <Card className="calm-card p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Today's Nutrition</h3>
              <p className="text-sm text-white/60">{foodLog.totalItems} items logged</p>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className={`text-xl font-bold ${getGradeColor(foodLog.dailyTotals.grade)}`}>
                {foodLog.dailyTotals.grade}
              </span>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{foodLog.dailyTotals.calories}</p>
              <p className="text-sm text-white/60">Calories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{foodLog.dailyTotals.protein}g</p>
              <p className="text-sm text-white/60">Protein</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{foodLog.dailyTotals.carbs}g</p>
              <p className="text-sm text-white/60">Carbs</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Meal Breakdown */}
      {Object.entries(foodLog.meals).map(([mealType, items]) => {
        if (!items || items.length === 0) return null;
        
        const isExpanded = expandedMeals[mealType];
        const mealTotals = items.reduce((acc: any, item: any) => ({
          calories: acc.calories + parseFloat(item.calories || '0'),
          protein: acc.protein + parseFloat(item.protein || '0'),
          carbs: acc.carbs + parseFloat(item.totalCarbs || '0'),
        }), { calories: 0, protein: 0, carbs: 0 });

        return (
          <Card key={mealType} className="calm-card overflow-hidden">
            {/* Meal Header - Clickable */}
            <div 
              className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleMeal(mealType)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-white/60" />
                  )}
                  <h4 className="text-lg font-semibold text-white capitalize">{mealType}</h4>
                </div>
                <span className="text-sm text-white/60">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Meal Totals - Always visible */}
              <div className="grid grid-cols-3 gap-4 text-center bg-white/5 rounded-lg p-3 mt-3">
                <div>
                  <p className="text-lg font-bold text-white">{Math.round(mealTotals.calories)}</p>
                  <p className="text-xs text-white/60">Calories</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{Math.round(mealTotals.protein)}g</p>
                  <p className="text-xs text-white/60">Protein</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{Math.round(mealTotals.carbs)}g</p>
                  <p className="text-xs text-white/60">Carbs</p>
                </div>
              </div>
            </div>

            {/* Food Items - Expandable */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {items.map((item: any, index: number) => (
                  <div 
                    key={item.id || index} 
                    id={`item-${item.id || index}`}
                    className="relative bg-white/5 rounded-lg overflow-hidden transition-transform duration-200"
                    onTouchStart={(e) => handleSwipeStart(item.id || index, e.touches[0].clientX)}
                    onTouchMove={(e) => handleSwipeMove(item.id || index, e.touches[0].clientX)}
                    onTouchEnd={(e) => handleSwipeEnd(item.id || index, e.changedTouches[0].clientX)}
                  >
                    <div className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{item.foodName}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-white/60">{item.quantity} {item.unit}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getGradeColor(item.healthGrade)} bg-white/10`}>
                            {item.healthGrade}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{Math.round(parseFloat(item.calories || '0'))} cal</p>
                          <p className="text-xs text-white/60">{Math.round(parseFloat(item.protein || '0'))}p • {Math.round(parseFloat(item.totalCarbs || '0'))}c</p>
                        </div>
                        <button
                          onClick={() => handleItemClick(item)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Info className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Delete background - revealed on swipe */}
                    <div 
                      id={`delete-${item.id || index}`}
                      className="absolute inset-y-0 right-0 w-20 bg-red-500/20 flex items-center justify-center translate-x-full transition-transform duration-200"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* Detailed Item Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="calm-card border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {selectedItem?.foodName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{Math.round(parseFloat(selectedItem.calories || '0'))}</p>
                  <p className="text-sm text-white/60">Calories</p>
                </div>
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getGradeColor(selectedItem.healthGrade)} bg-white/10`}>
                    {selectedItem.healthGrade} Grade
                  </span>
                </div>
              </div>

              {/* Macronutrients */}
              <div>
                <h4 className="text-white font-semibold mb-3">Macronutrients</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{Math.round(parseFloat(selectedItem.protein || '0'))}g</p>
                    <p className="text-xs text-white/60">Protein</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{Math.round(parseFloat(selectedItem.totalCarbs || '0'))}g</p>
                    <p className="text-xs text-white/60">Carbs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{Math.round(parseFloat(selectedItem.totalFat || '0'))}g</p>
                    <p className="text-xs text-white/60">Fat</p>
                  </div>
                </div>
              </div>

              {/* Detailed Nutrition */}
              <div>
                <h4 className="text-white font-semibold mb-3">Detailed Nutrition</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Fiber</span>
                    <span className="text-white">{parseFloat(selectedItem.fiber || '0').toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Sugar</span>
                    <span className="text-white">{parseFloat(selectedItem.sugars || '0').toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Saturated Fat</span>
                    <span className="text-white">{parseFloat(selectedItem.saturatedFat || '0').toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Sodium</span>
                    <span className="text-white">{parseFloat(selectedItem.sodium || '0').toFixed(0)}mg</span>
                  </div>
                </div>
              </div>

              {/* Serving Info */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Quantity</span>
                  <span className="text-white">{selectedItem.quantity} {selectedItem.unit}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-white/60">Health Score</span>
                  <span className="text-white">{selectedItem.healthScore}/100</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}