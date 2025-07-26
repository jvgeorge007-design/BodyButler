import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Clock, Star, Utensils, Camera } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import IOSNavHeader from '@/components/navigation/ios-nav-header';
import BottomNav from '@/components/navigation/bottom-nav';
import FoodLogSummary from '@/components/food-log-summary';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

const MEAL_TIMES = {
  breakfast: { start: 6, end: 11, label: 'Breakfast' },
  lunch: { start: 11, end: 15, label: 'Lunch' },
  dinner: { start: 15, end: 20, label: 'Dinner' },
  snacks: { start: 20, end: 6, label: 'Snacks' }
};

const RECENT_FOODS: FoodItem[] = [
  { id: '1', name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 9, fat: 4, serving: '1 cup' },
  { id: '2', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100g' },
  { id: '3', name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, serving: '100g' },
  { id: '4', name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, serving: '1 medium' }
];

const QUICK_ADD_OPTIONS = [
  { icon: Camera, label: 'Scan Receipt', description: 'Auto-log from receipt photo', route: '/scan-receipt' },
  { icon: Clock, label: 'Recent Foods', description: 'From your food history' },
  { icon: Star, label: 'Favorites', description: 'Your saved favorites' },
  { icon: Search, label: 'Search Foods', description: 'Find any food item' },
  { icon: Utensils, label: 'Custom Recipe', description: 'Create your own meal' }
];

export default function AddFood() {
  const [, setLocation] = useLocation();
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Fetch personalized plan data (same as dashboard)
  const { data: personalizedPlan } = useQuery({
    queryKey: ['/api/personalized-plan'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Smart meal detection based on current time
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= MEAL_TIMES.breakfast.start && hour < MEAL_TIMES.breakfast.end) {
      setSelectedMeal('breakfast');
    } else if (hour >= MEAL_TIMES.lunch.start && hour < MEAL_TIMES.lunch.end) {
      setSelectedMeal('lunch');
    } else if (hour >= MEAL_TIMES.dinner.start && hour < MEAL_TIMES.dinner.end) {
      setSelectedMeal('dinner');
    } else {
      setSelectedMeal('snacks');
    }
  }, []);

  const handleMealSelect = (meal: string) => {
    setSelectedMeal(meal);
  };

  const handleQuickAdd = (option: string, route?: string) => {
    setSelectedOption(option);
    if (route) {
      setLocation(route);
    } else if (option === 'Search Foods') {
      // Focus on search input
      const searchInput = document.getElementById('food-search');
      searchInput?.focus();
    }
  };

  const handleFoodAdd = (food: FoodItem) => {
    console.log(`Adding ${food.name} to ${selectedMeal}`);
    // Here you would typically make an API call to add the food
    // For now, just navigate back to dashboard
    setLocation('/');
  };

  const getCurrentMealProgress = () => {
    // Use same data calculation as dashboard
    const macroTargets = (personalizedPlan?.macroTargets as any) || {};
    const today = new Date();
    const selectedDate = new Date(); // Assuming current date for add-food page
    const isPast = selectedDate < today;
    const isToday = selectedDate.toDateString() === today.toDateString();
    const dayOffset = Math.floor((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate current daily totals (same as dashboard)
    const dailyCalories = isPast ? 1800 + dayOffset * 50 : isToday ? 1200 : 0;
    const dailyProtein = isPast ? 120 + dayOffset * 10 : isToday ? 80 : 0;
    const dailyCarbs = isPast ? 180 + dayOffset * 20 : isToday ? 150 : 0;
    const dailyFat = isPast ? 55 + dayOffset * 5 : isToday ? 45 : 0;

    // Return daily totals (not per-meal) to match dashboard
    return {
      calories: { 
        current: dailyCalories, 
        target: macroTargets.dailyCalories || 2000 
      },
      protein: { 
        current: dailyProtein, 
        target: macroTargets.protein_g || 150 
      },
      carbs: { 
        current: dailyCarbs, 
        target: macroTargets.carbs_g || 200 
      },
      fat: { 
        current: dailyFat, 
        target: macroTargets.fat_g || 65 
      }
    };
  };

  const mealProgress = getCurrentMealProgress();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* Header */}
      <IOSNavHeader 
        title="Add Food"
        onBackClick={() => setLocation('/')}
      />

      <div className="relative z-10 px-6 pt-4 pb-24">
        {/* Daily Progress */}
        <div className="calm-card mb-6">
          <h3 className="text-body font-medium text-white mb-3">
            Today's Progress
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(mealProgress).map(([macro, data]) => {
              const percentage = Math.min((data.current / data.target) * 100, 100);
              return (
                <div key={macro} className="text-center">
                  <div className="text-footnote text-gray-400 mb-1 capitalize">{macro}</div>
                  <div className="text-callout font-medium text-white">
                    {data.current}/{data.target}
                  </div>
                  <div className="w-full bg-gray-700 rounded-system-xs h-1.5 mt-1">
                    <div 
                      className="h-1.5 rounded-system-xs transition-all duration-500 bg-blue-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meal Selection Tabs */}
        <div className="mb-6">
          <h2 className="text-headline font-medium text-white mb-4">Select Meal</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(MEAL_TIMES).map(([key, meal]) => (
              <button
                key={key}
                onClick={() => handleMealSelect(key)}
                className={`px-4 py-2 rounded-system-lg text-callout font-medium transition-all duration-300 haptic-light whitespace-nowrap ${
                  selectedMeal === key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {meal.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="food-search"
              type="text"
              placeholder="Search for foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-system-md text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all duration-300"
            />
          </div>
        </div>

        {/* Quick Add Options */}
        <div className="mb-6">
          <h3 className="text-headline font-medium text-white mb-4">Quick Add</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ADD_OPTIONS.map((option) => (
              <button
                key={option.label}
                onClick={() => handleQuickAdd(option.label, (option as any).route)}
                className={`p-4 bg-white/5 border border-white/10 rounded-system-lg haptic-medium transition-all duration-300 hover:bg-white/10 hover:border-white/20 text-left ${
                  selectedOption === option.label ? 'bg-blue-500/20 border-blue-400/50' : ''
                }`}
              >
                <option.icon className="w-6 h-6 text-white/80 mb-2" />
                <div className="text-body font-medium text-white">{option.label}</div>
                <div className="text-footnote text-gray-400 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Food Log Summary */}
        <div className="mb-6">
          <h3 className="text-headline font-medium text-white mb-4">Today's Food Log</h3>
          <div className="space-y-3">
            <FoodLogSummary />
          </div>
        </div>

        {/* Recent Foods */}
        {(selectedOption === 'Recent Foods' || !selectedOption) && (
          <div>
            <h3 className="text-headline font-medium text-white mb-4">Recent Foods</h3>
            <div className="space-y-3">
              {RECENT_FOODS.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleFoodAdd(food)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-system-lg haptic-light hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-body font-medium text-white">{food.name}</div>
                    <div className="text-callout font-medium text-white/80">{food.calories} cal</div>
                  </div>
                  <div className="flex justify-between text-footnote text-gray-400">
                    <span>{food.serving}</span>
                    <span>P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div>
            <h3 className="text-headline font-medium text-white mb-4">Search Results</h3>
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <div className="text-body text-gray-400">Search for "{searchQuery}"</div>
              <div className="text-footnote text-gray-500 mt-2">Feature coming soon</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}