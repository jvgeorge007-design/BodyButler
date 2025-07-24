import { Calendar } from "lucide-react";
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

  

  return (
    <div className="bg-transparent">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium" style={{color: 'rgb(235, 235, 240)'}}>
            {formatDate(selectedDate)}
          </span>
          
          <button 
            onClick={handleCalendarClick}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Calendar className="w-5 h-5" style={{color: 'rgb(235, 235, 240)'}} />
          </button>
        </div>
      </div>
    </div>
  );
}