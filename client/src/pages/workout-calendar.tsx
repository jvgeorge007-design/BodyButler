import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Dumbbell } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, isSameDay, isToday } from "date-fns";

export default function WorkoutCalendar() {
  const { isAuthenticated } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Start on Monday

  const { data: personalizedPlan, isLoading } = useQuery({
    queryKey: ["/api/personalized-plan"],
    enabled: isAuthenticated,
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!personalizedPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <Calendar className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Workout Plan Found</h2>
        <p className="text-gray-600 text-center mb-6">
          Complete your onboarding to get a personalized workout calendar.
        </p>
        <Button onClick={() => window.location.href = "/onboarding"}>
          Complete Onboarding
        </Button>
      </div>
    );
  }

  const workoutDays = personalizedPlan.workoutPlan?.days || [];
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  // Map workout days to calendar days
  const getWorkoutForDay = (date: Date) => {
    const dayName = format(date, 'EEEE');
    return workoutDays.find(workout => workout.day === dayName);
  };

  const getFocusColor = (focus: string) => {
    if (focus.toLowerCase().includes('push')) return 'bg-red-100 text-red-800';
    if (focus.toLowerCase().includes('pull')) return 'bg-blue-100 text-blue-800';
    if (focus.toLowerCase().includes('legs')) return 'bg-green-100 text-green-800';
    if (focus.toLowerCase().includes('upper')) return 'bg-purple-100 text-purple-800';
    if (focus.toLowerCase().includes('lower')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addWeeks(prev, direction === 'next' ? 1 : -1));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Header Banner - Higher Opacity */}
      <header 
        className="px-6 py-4"
        style={{
          background: 'linear-gradient(90deg, rgb(0, 95, 115) 0%, rgb(0, 85, 105) 50%, rgb(0, 75, 95) 100%)',
          boxShadow: '0 4px 20px rgba(87, 168, 255, 0.25)',
          opacity: 0.95
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-white text-xl font-black tracking-widest uppercase">
            WORKOUT CALENDAR
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold heading-serif" style={{color: 'rgb(235, 235, 240)'}}>Weekly Schedule</h2>
            <p className="body-sans" style={{color: 'rgb(180, 180, 190)'}}>Your personalized training schedule</p>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-bold body-sans" style={{color: 'rgb(235, 235, 240)'}}>
              {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
          {weekDays.map((date, index) => {
            const workout = getWorkoutForDay(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div key={index} className={`glass-card p-4 ${isCurrentDay ? 'ring-2 ring-orange-600' : ''}`}>
                <div className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80 body-sans">
                        {format(date, 'EEEE')}
                      </p>
                      <p className={`text-lg font-bold ${isCurrentDay ? 'text-orange-400' : 'text-white'} body-sans`}>
                        {format(date, 'd')}
                      </p>
                    </div>
                    {workout && <Dumbbell className="w-4 h-4 text-white/60" />}
                  </div>
                </div>
                <div className="pt-0">
                  {workout ? (
                    <div className="space-y-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getFocusColor(workout.focus)}`}>
                        {workout.focus}
                      </div>
                      <div className="space-y-1">
                        {workout.exercises?.slice(0, 3).map((exercise: any, idx: number) => (
                          <p key={idx} className="text-xs text-white/70 truncate body-sans">
                            {exercise.name}
                          </p>
                        ))}
                        {workout.exercises?.length > 3 && (
                          <p className="text-xs text-white/50 body-sans">
                            +{workout.exercises.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-white/60 body-sans">Rest Day</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week Overview */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-white" />
            <span className="font-black text-white heading-serif">This Week's Overview</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400 body-sans">
                {workoutDays.length}
              </p>
              <p className="text-sm text-white/70 body-sans">Workout Days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400 body-sans">
                {7 - workoutDays.length}
              </p>
              <p className="text-sm text-white/70 body-sans">Rest Days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400 body-sans">
                {personalizedPlan.workoutPlan?.split || 'Custom'}
              </p>
              <p className="text-sm text-white/70 body-sans">Training Split</p>
            </div>
          </div>
          
          {personalizedPlan.workoutPlan?.progression && (
            <div className="mt-6 p-4 glass-card border border-orange-600/30 rounded-lg">
              <h4 className="font-semibold text-orange-400 mb-2 body-sans">Progression Notes</h4>
              <p className="text-sm text-white/80 body-sans">
                {personalizedPlan.workoutPlan.progression}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}