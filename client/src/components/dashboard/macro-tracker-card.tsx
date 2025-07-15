import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Utensils, Plus } from "lucide-react";

interface MacroData {
  current: number;
  target: number;
  unit: string;
}

interface MacroTrackerCardProps {
  calories: MacroData;
  protein: MacroData;
  carbs: MacroData;
  fat: MacroData;
  onLogMeal: () => void;
}

export default function MacroTrackerCard({
  calories,
  protein,
  carbs,
  fat,
  onLogMeal
}: MacroTrackerCardProps) {
  const macros = [
    { name: 'Protein', data: protein, color: 'hsl(var(--blue-primary))' },
    { name: 'Carbs', data: carbs, color: 'hsl(var(--success))' },
    { name: 'Fat', data: fat, color: 'hsl(var(--warning))' }
  ];

  const caloriePercentage = Math.min((calories.current / calories.target) * 100, 100);

  return (
    <div className="calm-card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[hsl(var(--success))]/10">
            <Utensils className="w-6 h-6 text-[hsl(var(--success))]" />
          </div>
          <div>
            <h3 className="text-headline text-[hsl(var(--text-primary))]">Today's Nutrition</h3>
            <p className="text-caption2">Track your daily intake</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-callout font-medium text-[hsl(var(--success))]">{Math.round(caloriePercentage)}%</div>
          <div className="text-caption2">complete</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Calories - Featured */}
        <div className="p-4 bg-[hsl(var(--surface-secondary))] rounded-xl">
          <div className="flex justify-between items-center mb-3">
            <span className="text-callout font-medium text-[hsl(var(--text-primary))]">Calories</span>
            <span className="text-body font-semibold text-[hsl(var(--text-primary))]">
              {calories.current} / {calories.target} {calories.unit}
            </span>
          </div>
          <Progress 
            value={caloriePercentage} 
            className="h-3"
            style={{ 
              background: 'hsl(var(--surface))',
            }}
          />
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-4">
          {macros.map((macro) => {
            const percentage = Math.min((macro.data.current / macro.data.target) * 100, 100);
            return (
              <div key={macro.name} className="text-center">
                <div className="mb-2">
                  <div className="text-callout font-medium text-[hsl(var(--text-primary))]">
                    {macro.data.current}
                  </div>
                  <div className="text-caption2">
                    / {macro.data.target}{macro.data.unit}
                  </div>
                </div>
                <div className="w-full bg-[hsl(var(--surface-secondary))] rounded-full h-2 mb-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: macro.color
                    }}
                  />
                </div>
                <div className="text-caption2" style={{ color: macro.color }}>
                  {macro.name}
                </div>
              </div>
            );
          })}
        </div>

        <Button 
          onClick={onLogMeal}
          className="gradient-button w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Meal
        </Button>
      </div>
    </div>
  );
}