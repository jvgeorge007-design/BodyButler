import { Heart, TrendingUp, Footprints } from "lucide-react";
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
      <div className="py-2 relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Footprints className="w-10 h-10 text-green-400" />
        </div>
        <div className="flex justify-center items-center pr-4">
          <div className="text-center ml-14">
            <div className="text-lg font-bold text-white">
              {averageHealthScore > 0 ? averageHealthScore : '--'}
            </div>
            <div className="text-xs text-white/60">health score</div>
          </div>
        </div>
      </div>
    </div>
  );
}