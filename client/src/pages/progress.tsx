import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import BottomNav from "@/components/navigation/bottom-nav";

export default function Progress() {
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Mock data for demonstration
  const weeklyData = [
    { day: "S/1", calories: 1850, goal: 2000, protein: 120, carbs: 180, fat: 65 },
    { day: "M/2", calories: 1920, goal: 2000, protein: 135, carbs: 190, fat: 58 },
    { day: "T/3", calories: 2100, goal: 2000, protein: 140, carbs: 210, fat: 72 },
    { day: "W/4", calories: 1780, goal: 2000, protein: 115, carbs: 165, fat: 62 },
    { day: "T/5", calories: 2050, goal: 2000, protein: 145, carbs: 195, fat: 68 },
    { day: "F/6", calories: 1950, goal: 2000, protein: 125, carbs: 185, fat: 60 },
    { day: "S/7", calories: 2200, goal: 2000, protein: 150, carbs: 220, fat: 75 }
  ];

  const averageCalories = Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / weeklyData.length);
  const goalCalories = 2000;
  const deficit = goalCalories - averageCalories;

  const maxCalories = Math.max(...weeklyData.map(d => d.calories), goalCalories);
  const getBarHeight = (calories: number) => (calories / maxCalories) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Progress</h1>
          <Calendar className="w-6 h-6" />
        </div>
        
        {/* Week Navigator */}
        <div className="flex items-center justify-center gap-4">
          <button className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-sm opacity-90">Week</div>
            <div className="font-semibold">5/1 - 5/7</div>
          </div>
          <button className="p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Average Daily Calories Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Daily Calories</h3>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke={deficit > 0 ? "#ef4444" : "#10b981"}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(Math.abs(deficit) / goalCalories) * 314} 314`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-2xl font-bold ${deficit > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {deficit > 0 ? '-' : '+'}{Math.abs(deficit)}
                </div>
                <div className="text-xs text-gray-500">GOAL</div>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-sm text-gray-600">Average: {averageCalories} cal</div>
            <div className="text-sm text-gray-600">Goal: {goalCalories} cal</div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="flex items-end justify-between h-32 gap-2">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex flex-col items-center flex-1">
                <div className="flex flex-col justify-end h-24 w-full">
                  {/* Goal line */}
                  <div 
                    className="w-full bg-gray-200 rounded-t"
                    style={{ height: `${getBarHeight(day.goal)}%` }}
                  />
                  {/* Actual calories */}
                  <div 
                    className={`w-full rounded-t ${
                      day.calories > day.goal ? 'bg-red-400' : 'bg-green-400'
                    }`}
                    style={{ 
                      height: `${getBarHeight(day.calories)}%`,
                      marginTop: day.calories > day.goal ? `-${getBarHeight(day.goal)}%` : '0'
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">{day.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Daily Macros Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Daily Macros</h3>
          
          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Protein</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(weeklyData.reduce((sum, day) => sum + day.protein, 0) / weeklyData.length)}g
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: '85%' }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Carbs</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0) / weeklyData.length)}g
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: '75%' }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Fat</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(weeklyData.reduce((sum, day) => sum + day.fat, 0) / weeklyData.length)}g
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-orange-500"
                  style={{ width: '90%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}