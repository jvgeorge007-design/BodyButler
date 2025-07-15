import { Calendar } from "lucide-react";
import { useState } from "react";

interface DateNavigatorProps {
  onDateSelect?: (date: Date) => void;
  onCalendarOpen?: () => void;
}

export default function DateNavigator({ onDateSelect, onCalendarOpen }: DateNavigatorProps) {
  const [selectedDate] = useState(new Date());

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
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">
          {formatDate(selectedDate)}
        </span>
        
        <button 
          onClick={handleCalendarClick}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Calendar className="w-5 h-5 text-blue-600" />
        </button>
      </div>
    </div>
  );
}