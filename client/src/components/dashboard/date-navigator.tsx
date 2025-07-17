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
    <div className="elegant-card mb-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={handlePreviousDay}
          className="p-3 hover:bg-accent/20 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-headline text-foreground heading-serif">
            {formatDate(selectedDate)}
          </span>
          
          <button 
            onClick={handleCalendarClick}
            className="p-3 hover:bg-accent/20 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            <Calendar className="w-5 h-5 text-primary" />
          </button>
        </div>
        
        <button 
          onClick={handleNextDay}
          className="p-3 hover:bg-accent/20 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      </div>
    </div>
  );
}