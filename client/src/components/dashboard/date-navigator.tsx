import { ChevronLeft, ChevronRight, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

interface DateNavigatorProps {
  onDateSelect?: (date: Date) => void;
}

interface DayInfo {
  date: Date;
  workout?: {
    type: string;
    completed: boolean;
  };
  calories?: {
    consumed: number;
    goal: number;
  };
}

export default function DateNavigator({ onDateSelect }: DateNavigatorProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [, setLocation] = useLocation();

  // Mock data for demonstration - in real app this would come from API
  const getDayInfo = (date: Date): DayInfo => {
    const today = new Date();
    const isPast = date < today;
    const isToday = date.toDateString() === today.toDateString();
    const isFuture = date > today;

    if (isPast || isToday) {
      return {
        date,
        workout: { type: "Push Day", completed: isPast },
        calories: { consumed: isPast ? 1850 : 1200, goal: 2000 }
      };
    } else {
      return {
        date,
        workout: { type: "Pull Day", completed: false },
        calories: { consumed: 0, goal: 2000 }
      };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    onDateSelect?.(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    onDateSelect?.(newDate);
  };

  const openDetailedView = () => {
    const dayInfo = getDayInfo(selectedDate);
    const today = new Date();
    const isPast = selectedDate < today;
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    if (isPast || isToday) {
      // Navigate to detailed diary view for past/current days
      setLocation("/workout-calendar");
    } else {
      // Navigate to workout template view for future days
      setLocation("/workout-calendar");
    }
  };

  const dayInfo = getDayInfo(selectedDate);
  const today = new Date();
  const isPast = selectedDate < today;
  const isToday = selectedDate.toDateString() === today.toDateString();

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousDay}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Button>
        
        <button 
          onClick={openDetailedView}
          className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
        >
          <span className="text-lg font-semibold text-gray-900">
            {formatDate(selectedDate)}
          </span>
          <Calendar className="w-4 h-4 text-blue-600" />
        </button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextDay}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </Button>
      </div>

      {/* Day Summary */}
      <div className="space-y-3">
        {/* Workout Info */}
        {dayInfo.workout && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dayInfo.workout.completed && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {dayInfo.workout.type}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {dayInfo.workout.completed ? 'Completed' : (isToday ? 'Scheduled' : 'Planned')}
            </span>
          </div>
        )}

        {/* Calorie Info */}
        {dayInfo.calories && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Calories</span>
            <span className="text-sm font-semibold text-gray-900">
              {isPast || isToday ? (
                `${dayInfo.calories.consumed} / ${dayInfo.calories.goal}`
              ) : (
                `Goal: ${dayInfo.calories.goal}`
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}