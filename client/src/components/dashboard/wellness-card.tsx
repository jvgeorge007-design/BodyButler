import { Heart, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface WellnessCardProps {}

export default function WellnessCard({}: WellnessCardProps) {
  // Fetch food log entries to calculate wellness metrics
  const { data: foodLogData, isLoading } = useQuery({
    queryKey: ['/api/food-log'],
    enabled: true,
  });

  // Calculate running average health score from logged meals
  const calculateWellnessMetrics = () => {
    if (!foodLogData || !foodLogData.meals) {
      return { averageHealthScore: 0, totalMeals: 0 };
    }

    // Extract all entries from all meal types
    const allEntries: any[] = [];
    Object.values(foodLogData.meals).forEach((mealEntries: any) => {
      if (Array.isArray(mealEntries)) {
        allEntries.push(...mealEntries);
      }
    });

    if (allEntries.length === 0) {
      return { averageHealthScore: 0, totalMeals: 0 };
    }

    const validEntries = allEntries.filter((entry: any) => 
      entry.healthScore && !isNaN(parseFloat(entry.healthScore))
    );

    if (validEntries.length === 0) {
      return { averageHealthScore: 0, totalMeals: allEntries.length };
    }

    const totalScore = validEntries.reduce((sum: number, entry: any) => {
      return sum + parseFloat(entry.healthScore);
    }, 0);

    const average = totalScore / validEntries.length;
    return {
      averageHealthScore: Math.round(average * 10) / 10, // Round to 1 decimal
      totalMeals: allEntries.length
    };
  };

  const { averageHealthScore, totalMeals } = calculateWellnessMetrics();

  // Convert health score to letter grade
  const getHealthGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'D';
  };

  // Get color based on health score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="bg-transparent relative">
      {/* Wellness title with heart icon */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Wellness</h3>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Health Score Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={`text-3xl font-bold ${getScoreColor(averageHealthScore)}`}>
              {averageHealthScore > 0 ? averageHealthScore : '--'}
            </span>
            <span className="text-xl text-white/60">/100</span>
          </div>
          
          {averageHealthScore > 0 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-white/80">
                {getHealthGrade(averageHealthScore)}
              </span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          )}
        </div>
        
        {averageHealthScore > 0 && (
          <>
            {/* Stats */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Meals Logged</span>
                <span className="text-sm font-medium text-white">
                  {totalMeals}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60">Avg Score</span>
                <span className={`text-sm font-medium ${getScoreColor(averageHealthScore)}`}>
                  {averageHealthScore}/100
                </span>
              </div>
            </div>
            
            {/* Motivational Message */}
            <div className="text-center">
              <p className="text-xs text-white/60">
                {averageHealthScore >= 80
                  ? "Excellent nutrition choices! 🌟"
                  : averageHealthScore >= 60
                  ? "Good progress! Keep it up!"
                  : "Room for improvement - you've got this!"
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}