import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import KettlebellLogo from "@/components/ui/kettlebell-logo";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, Plus, TrendingUp, Calendar, Flame, Target, ChevronRight, User, Zap, Activity, Heart } from "lucide-react";
import BottomNav from "@/components/navigation/bottom-nav";
import CircularProgress from "@/components/ui/circular-progress";

export default function DashboardNew() {
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    staleTime: 1000 * 60 * 5,
  });

  const { data: nutritionData, isLoading: nutritionLoading } = useQuery({
    queryKey: ['/api/daily-nutrition'],
    staleTime: 1000 * 60 * 5,
  });

  const { data: personalizedPlan } = useQuery({
    queryKey: ['/api/personalized-plan'],
    staleTime: 1000 * 60 * 5,
  });

  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Please log in to continue</div>
      </div>
    );
  }

  const totalCalories = nutritionData?.totalCalories || 0;
  const totalProtein = nutritionData?.totalProtein || 0;
  const totalCarbs = nutritionData?.totalCarbs || 0;
  const totalFat = nutritionData?.totalFat || 0;

  const calorieGoal = personalizedPlan?.dailyCalorieTarget || 2000;
  const proteinGoal = personalizedPlan?.proteinTarget || 150;
  const carbGoal = personalizedPlan?.carbTarget || 200;
  const fatGoal = personalizedPlan?.fatTarget || 65;

  const caloriesRemaining = Math.max(0, calorieGoal - totalCalories);

  // Get current date info
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // Calculate health score average (based on recent meal logs)
  const averageHealthScore = nutritionData?.meals?.length > 0 
    ? nutritionData.meals.reduce((sum: number, meal: any) => sum + (meal.healthScore || 7), 0) / nutritionData.meals.length
    : 7.8;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Top Progress Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-6 h-6" />
              <span className="text-lg font-medium">{dayName}, {monthDay}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">5 day trek</span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-sm text-white/80 mb-1">Summit Progress</div>
            <div className="text-right text-2xl font-bold text-white/90">2,100m</div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full mb-4"></div>
          
          <p className="text-white/90 text-sm leading-relaxed">
            Great momentum - the vista ahead is spectacular
          </p>
        </div>

        {/* Today's Trail Guide Card */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-orange-800">Today's Trail Guide</h3>
          </div>
          
          <p className="text-orange-700 text-sm leading-relaxed">
            Perfect conditions for your ascent today. Your energy peaks after morning protein - 
            since yesterday was a rest day, this afternoon's 45-minute trek will feel 
            energizing rather than draining.
          </p>
        </div>

        {/* Trail Fuel Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-blue-800">Trail Fuel</h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            </div>
          </div>
          
          {/* Calories Remaining Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32">
                <CircularProgress 
                  percentage={((calorieGoal - caloriesRemaining) / calorieGoal) * 100}
                  size={128}
                  strokeWidth={12}
                  color="#3B82F6"
                  backgroundColor="#E5E7EB"
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-blue-600">{caloriesRemaining}</div>
                <div className="text-xs text-blue-500">cal remaining</div>
              </div>
            </div>
          </div>
          
          {/* Macro Bars */}
          <div className="space-y-3">
            {/* Protein */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Protein</span>
              <span className="text-sm font-bold text-blue-800">{totalProtein}g</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%` }}
              />
            </div>
            
            {/* Carbs */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Carbs</span>
              <span className="text-sm font-bold text-blue-800">{totalCarbs}g</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${Math.min((totalCarbs / carbGoal) * 100, 100)}%` }}
              />
            </div>
            
            {/* Fat */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Fat</span>
              <span className="text-sm font-bold text-blue-800">{totalFat}g</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${Math.min((totalFat / fatGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Wellness + Workout Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Wellness Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-green-600" />
              <h4 className="text-sm font-bold text-green-800">Wellness</h4>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {averageHealthScore.toFixed(1)}
              </div>
              <div className="text-xs text-green-600">avg health score</div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-green-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${(averageHealthScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Workout Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <h4 className="text-sm font-bold text-purple-800">Workout</h4>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                45
              </div>
              <div className="text-xs text-purple-600">min planned</div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-purple-200 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 right-4">
          <button
            onClick={() => setLocation('/photo-food-logger')}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <Camera className="w-7 h-7 text-white" />
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}