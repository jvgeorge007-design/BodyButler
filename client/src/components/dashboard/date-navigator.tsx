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
    <div className="bg-transparent">
      <div className="flex items-center justify-between">
        <button 
          onClick={handlePreviousDay}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-white">
            {formatDate(selectedDate)}
          </span>
          
          <button 
            onClick={handleCalendarClick}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Calendar className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <button 
          onClick={handleNextDay}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}