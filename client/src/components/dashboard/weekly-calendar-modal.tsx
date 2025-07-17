import { ChevronLeft, ChevronRight, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface WeeklyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect?: (date: Date) => void;
}

interface DayData {
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

export default function WeeklyCalendarModal({ isOpen, onClose, onDateSelect }: WeeklyCalendarModalProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  if (!isOpen) return null;

  // Get the start of the week (Sunday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Get array of dates for the current week
  const getWeekDays = (weekStart: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Mock data for demonstration
  const getDayData = (date: Date): DayData => {
    const today = new Date();
    const isPast = date < today;
    const isToday = date.toDateString() === today.toDateString();
    
    const workoutTypes = ["Push Day", "Pull Day", "Leg Day", "Cardio", "Rest Day"];
    const dayOfWeek = date.getDay();
    
    if (isPast || isToday) {
      return {
        date,
        workout: { 
          type: workoutTypes[dayOfWeek % workoutTypes.length], 
          completed: isPast 
        },
        calories: { 
          consumed: isPast ? 1800 + (dayOfWeek * 50) : 1200, 
          goal: 2000 
        }
      };
    } else {
      return {
        date,
        workout: { 
          type: workoutTypes[dayOfWeek % workoutTypes.length], 
          completed: false 
        },
        calories: { 
          consumed: 0, 
          goal: 2000 
        }
      };
    }
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = getWeekDays(weekStart);

  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const handleDayClick = (date: Date) => {
    onDateSelect?.(date);
    onClose();
  };

  const formatWeekRange = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    } else {
      return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 heading-serif">Calendar</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Button>
            
            <span className="text-lg font-semibold text-gray-900">
              {formatWeekRange()}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Calendar Days */}
        <div className="p-6 space-y-3">
          {weekDays.map((day, index) => {
            const dayData = getDayData(day);
            const today = new Date();
            const isToday = day.toDateString() === today.toDateString();
            const isPast = day < today;
            
            return (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                className={`w-full text-left p-4 rounded-2xl border transition-colors hover:bg-gray-50 ${
                  isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm text-gray-500">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  
                  {dayData.workout?.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                
                {/* Workout Info */}
                {dayData.workout && (
                  <div className="mb-2">
                    <div className="text-sm font-medium text-gray-700">
                      {dayData.workout.type}
                    </div>
                    <div className="text-xs text-gray-500">
                      {dayData.workout.completed ? 'Completed' : (isToday ? 'Scheduled' : 'Planned')}
                    </div>
                  </div>
                )}
                
                {/* Calorie Info */}
                {dayData.calories && (
                  <div className="text-xs text-gray-600">
                    {isPast || isToday ? (
                      `${dayData.calories.consumed} / ${dayData.calories.goal} cal`
                    ) : (
                      `Goal: ${dayData.calories.goal} cal`
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}