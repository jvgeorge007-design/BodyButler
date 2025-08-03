import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Calendar, Award, Target, ChevronRight, Trophy, Flame, Star, TrendingDown, Zap } from "lucide-react";

import { IOSButton } from "@/components/ui/ios-button";
import { IOSList, IOSListItem } from "@/components/ui/ios-list";
import BottomNav from "@/components/navigation/bottom-nav";

export default function Progress() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Mock progress data - in real app, this would come from API
  const progressData = {
    week: {
      workoutsCompleted: 4,
      workoutsPlanned: 5,
      caloriesAverage: 1950,
      caloriesTarget: 2000,
      weightChange: -0.5,
      achievements: [
        { title: "Consistency Champion", description: "Completed 4 workouts this week", icon: Trophy },
        { title: "Calorie Control", description: "Stayed within calorie goals 6/7 days", icon: Target }
      ]
    },
    month: {
      workoutsCompleted: 16,
      workoutsPlanned: 20,
      caloriesAverage: 1975,
      caloriesTarget: 2000,
      weightChange: -2.3,
      achievements: [
        { title: "Monthly Warrior", description: "Completed 16 workouts this month", icon: Zap },
        { title: "Progress Tracker", description: "Lost 2.3 lbs this month", icon: TrendingDown }
      ]
    },
    year: {
      workoutsCompleted: 180,
      workoutsPlanned: 240,
      caloriesAverage: 1965,
      caloriesTarget: 2000,
      weightChange: -15.2,
      achievements: [
        { title: "Transformation", description: "Lost 15.2 lbs this year", icon: Star },
        { title: "Dedication", description: "Completed 180 workouts", icon: Flame }
      ]
    }
  };

  const currentData = progressData[selectedPeriod];
  const workoutPercentage = (currentData.workoutsCompleted / currentData.workoutsPlanned) * 100;
  const calorieAccuracy = ((2000 - Math.abs(currentData.caloriesAverage - currentData.caloriesTarget)) / 2000) * 100;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>



      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto ios-padding min-h-screen" style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)'
      }}>
        <div className="ios-spacing-large">
          {/* Period Selection */}
          <div className="calm-card">
            <h3 className="text-headline font-semibold text-white mb-3">Time Period</h3>
            <div className="flex ios-spacing-small">
              {(['week', 'month', 'year'] as const).map((period) => (
                <IOSButton
                  key={period}
                  variant={selectedPeriod === period ? 'primary' : 'secondary'}
                  size="small"
                  onClick={() => setSelectedPeriod(period)}
                  className="flex-1"
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </IOSButton>
              ))}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="calm-card">
            <h3 className="text-headline font-semibold text-white mb-4">Overview</h3>
            <div className="ios-spacing-small">
              {/* Workouts Progress */}
              <div className="ios-progress-section">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-body text-white">Workouts</span>
                  <span className="text-callout ios-gray">
                    {currentData.workoutsCompleted}/{currentData.workoutsPlanned}
                  </span>
                </div>
                <div className="ios-progress-bar">
                  <div 
                    className="ios-progress-fill ios-bg-green"
                    style={{ width: `${workoutPercentage}%` }}
                  />
                </div>
                <div className="text-caption-2 ios-gray mt-1">
                  {workoutPercentage.toFixed(0)}% completed
                </div>
              </div>

              {/* Calorie Accuracy */}
              <div className="ios-progress-section">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-body text-white">Calorie Accuracy</span>
                  <span className="text-callout ios-gray">
                    {currentData.caloriesAverage} avg
                  </span>
                </div>
                <div className="ios-progress-bar">
                  <div 
                    className="ios-progress-fill ios-bg-blue"
                    style={{ width: `${calorieAccuracy}%` }}
                  />
                </div>
                <div className="text-caption-2 ios-gray mt-1">
                  {calorieAccuracy.toFixed(0)}% accuracy
                </div>
              </div>

              {/* Weight Change */}
              <div className="ios-progress-section">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-body text-white">Weight Change</span>
                  <span className={`text-callout font-semibold ${
                    currentData.weightChange < 0 ? 'ios-green' : 'ios-red'
                  }`}>
                    {currentData.weightChange > 0 ? '+' : ''}{currentData.weightChange} lbs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="calm-card">
            <h3 className="text-headline font-semibold text-white mb-4">Achievements</h3>
            <IOSList grouped>
              {currentData.achievements.map((achievement, index) => (
                <IOSListItem
                  key={index}
                  icon={<achievement.icon className="w-5 h-5 text-white/80" />}
                  title={achievement.title}
                  subtitle={achievement.description}
                  showChevron
                  onPress={() => {/* TODO: Show achievement details */}}
                />
              ))}
            </IOSList>
          </div>

          {/* Quick Actions */}
          <div className="calm-card">
            <h3 className="text-headline font-semibold text-white mb-4">Quick Actions</h3>
            <IOSList grouped>
              <IOSListItem
                icon={<Calendar className="w-5 h-5 text-white/80" />}
                title="View Workout History"
                subtitle="See all your completed workouts"
                showChevron
                onPress={() => {/* TODO: Navigate to workout history */}}
              />
              <IOSListItem
                icon={<Target className="w-5 h-5 text-white/80" />}
                title="Update Goals"
                subtitle="Adjust your fitness targets"
                showChevron
                onPress={() => {/* TODO: Navigate to goals */}}
              />
              <IOSListItem
                icon={<Award className="w-5 h-5 text-white/80" />}
                title="All Achievements"
                subtitle="View your complete achievement list"
                showChevron
                onPress={() => {/* TODO: Navigate to achievements */}}
              />
            </IOSList>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}