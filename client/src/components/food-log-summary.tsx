import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Calendar, Trophy } from 'lucide-react';

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
  const { data: foodLog, isLoading } = useQuery<FoodLogSummary>({
    queryKey: ['/api/receipt/food-log'],
    staleTime: 1000 * 30, // 30 seconds - fresh data for debugging
  });

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
        
        const mealTotals = items.reduce((acc: any, item: any) => ({
          calories: acc.calories + parseFloat(item.calories || '0'),
          protein: acc.protein + parseFloat(item.protein || '0'),
          carbs: acc.carbs + parseFloat(item.totalCarbs || '0'),
        }), { calories: 0, protein: 0, carbs: 0 });

        return (
          <Card key={mealType} className="calm-card p-4">
            <div className="space-y-3">
              {/* Meal Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white capitalize">{mealType}</h4>
                <span className="text-sm text-white/60">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Meal Totals */}
              <div className="grid grid-cols-3 gap-4 text-center bg-white/5 rounded-lg p-3">
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

              {/* Food Items */}
              <div className="space-y-2">
                {items.map((item: any, index: number) => (
                  <div key={item.id || index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{item.foodName}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-white/60">{item.quantity} {item.unit}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getGradeColor(item.healthGrade)} bg-white/10`}>
                          {item.healthGrade}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{Math.round(parseFloat(item.calories || '0'))} cal</p>
                      <p className="text-xs text-white/60">{Math.round(parseFloat(item.protein || '0'))}p • {Math.round(parseFloat(item.totalCarbs || '0'))}c</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}