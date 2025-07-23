import { Calendar, ChevronLeft, ChevronRight, Dumbbell, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CalendarEvent {
  type: 'workout' | 'meal';
  title: string;
  time?: string;
}

interface CalendarWidgetProps {
  weeklySchedule?: Record<string, CalendarEvent[]>;
}

export default function CalendarWidget({ weeklySchedule = {} }: CalendarWidgetProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
  const getWeekDays = (offset: number = 0) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (offset * 7));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };
  
  const weekDays = getWeekDays(currentWeekOffset);
  const today = new Date();
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    const dayKey = date.toISOString().split('T')[0];
    return weeklySchedule[dayKey] || [];
  };

  return (
    <div className="calm-card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-[hsl(var(--blue-primary))]" />
        <h3 className="text-headline text-[hsl(var(--text-primary))]">This Week</h3>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-caption1 text-[hsl(var(--text-secondary))] pb-2">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {weekDays.map((date, index) => {
          const events = getEventsForDay(date);
          const dayIsToday = isToday(date);
          
          return (
            <div
              key={index}
              className={`
                min-h-[60px] p-2 rounded-xl border transition-all duration-200
                ${dayIsToday 
                  ? 'bg-[hsl(var(--blue-primary))]/10 border-[hsl(var(--blue-primary))] ring-1 ring-[hsl(var(--blue-primary))]/20' 
                  : 'bg-[hsl(var(--surface-secondary))] border-transparent hover:border-[hsl(var(--border))]'
                }
              `}
            >
              <div className={`text-center text-sm font-medium mb-1 ${
                dayIsToday ? 'text-[hsl(var(--blue-primary))]' : 'text-[hsl(var(--text-primary))]'
              }`}>
                {date.getDate()}
              </div>
              
              <div className="space-y-1">
                {events.slice(0, 2).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`
                      flex items-center gap-1 px-1 py-0.5 rounded text-xs
                      ${event.type === 'workout' 
                        ? 'bg-[hsl(var(--blue-primary))]/20 text-[hsl(var(--blue-primary))]'
                        : 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]'
                      }
                    `}
                  >
                    {event.type === 'workout' ? (
                      <Dumbbell className="w-2.5 h-2.5" />
                    ) : (
                      <Utensils className="w-2.5 h-2.5" />
                    )}
                    <span className="truncate">{event.title}</span>
                  </div>
                ))}
                {events.length > 2 && (
                  <div className="text-xs text-[hsl(var(--text-tertiary))] text-center">
                    +{events.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" className="flex-1">
          <Dumbbell className="w-4 h-4 mr-2" />
          View Workouts
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Utensils className="w-4 h-4 mr-2" />
          Meal Plan
        </Button>
      </div>
    </div>
  );
}