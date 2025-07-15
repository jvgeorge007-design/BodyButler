import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DateNavigatorProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onCalendarOpen?: () => void;
}

export default function DateNavigator({ selectedDate: propSelectedDate, onDateSelect, onCalendarOpen }: DateNavigatorProps) {
  const selectedDate = propSelectedDate || new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleCalendarClick = () => {
    onCalendarOpen?.();
  };

  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    onDateSelect?.(previousDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    onDateSelect?.(nextDay);
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={handlePreviousDay}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 active:brightness-110"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-900">
            {formatDate(selectedDate)}
          </span>
          
          <button 
            onClick={handleCalendarClick}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 active:brightness-110"
          >
            <Calendar className="w-5 h-5 text-blue-600" />
          </button>
        </div>
        
        <button 
          onClick={handleNextDay}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 active:brightness-110"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}