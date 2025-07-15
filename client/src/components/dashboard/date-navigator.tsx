import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DateNavigatorProps {
  onDateSelect?: (date: Date) => void;
}

export default function DateNavigator({ onDateSelect }: DateNavigatorProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const openCalendar = () => {
    // This would open a full calendar modal/page
    // For now, we'll just navigate to the calendar page
    window.location.href = '/workout-calendar';
  };

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousDay}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatDate(selectedDate)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={openCalendar}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextDay}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}