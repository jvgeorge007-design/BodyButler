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
    <Card className={`calm-card p-4 ${className}`}>
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

        {/* Macros Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-white/60 mb-1">Calories</div>
            <div className="text-lg font-semibold text-white">{foodLog.dailyTotals.calories}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/60 mb-1">Protein</div>
            <div className="text-lg font-semibold text-white">{foodLog.dailyTotals.protein}g</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/60 mb-1">Carbs</div>
            <div className="text-lg font-semibold text-white">{foodLog.dailyTotals.carbs}g</div>
          </div>
        </div>

        {/* Meals Breakdown */}
        <div className="space-y-2">
          {Object.entries(foodLog.meals).map(([mealType, items]) => {
            if (items.length === 0) return null;
            
            return (
              <div key={mealType} className="flex items-center justify-between py-2 border-t border-white/10 first:border-t-0">
                <div className="capitalize text-white/80 text-sm font-medium">{mealType}</div>
                <div className="text-white/60 text-xs">{items.length} item{items.length !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}