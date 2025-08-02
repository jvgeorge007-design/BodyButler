import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';

interface TrekInsight {
  type: 'nutrition' | 'workout' | 'recovery' | 'habit';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  confidence: number;
}

interface DailyRecap {
  date: string;
  foodLogs: any[];
  workoutLogs: any[];
  userFeedback: any[];
  insights: TrekInsight[];
}

export function TrekNavigationCard() {
  const [selectedInsight, setSelectedInsight] = useState<TrekInsight | null>(null);

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const { data: dailyRecap, isLoading } = useQuery<DailyRecap>({
    queryKey: ['/api/daily-recap', yesterdayStr],
    enabled: true,
  });

  const getPriorityColor = (priority: TrekInsight['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white/60';
    }
  };

  const getPriorityIcon = (priority: TrekInsight['priority']) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getTypeEmoji = (type: TrekInsight['type']) => {
    switch (type) {
      case 'nutrition': return '🍎';
      case 'workout': return '💪';
      case 'recovery': return '😴';
      case 'habit': return '🎯';
      default: return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="calm-card">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white/60">Trek Navigation</h3>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40"></div>
        </div>
      </div>
    );
  }

  const insights = dailyRecap?.insights || [];
  const highPriorityInsights = insights.filter(i => i.priority === 'high');
  const topInsight = highPriorityInsights[0] || insights[0];

  return (
    <div className="calm-card">
      <div className="flex items-center gap-2 mb-2">
        <Navigation className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white/60">Trek Navigation</h3>
      </div>
      
      {insights.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🧭</div>
          <p className="text-white/60 text-sm">
            Log more activities to unlock personalized insights
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Top Priority Insight */}
          {topInsight && (
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`flex items-center gap-1 ${getPriorityColor(topInsight.priority)}`}>
                    {getPriorityIcon(topInsight.priority)}
                    <span className="text-lg">{getTypeEmoji(topInsight.type)}</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm mb-1">
                    {topInsight.title}
                  </h4>
                  <p className="text-white/70 text-xs mb-2 leading-relaxed">
                    {topInsight.description}
                  </p>
                  <div className="bg-white/10 rounded px-2 py-1">
                    <p className="text-xs font-medium text-white/90">
                      💡 {topInsight.action}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Confidence Bar */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-white/50">Confidence</span>
                <div className="flex-1 bg-white/10 rounded-full h-1">
                  <div 
                    className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-1000"
                    style={{ width: `${topInsight.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-white/70">{topInsight.confidence}%</span>
              </div>
            </div>
          )}
          
          {/* Additional Insights */}
          {insights.length > 1 && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Other Insights ({insights.length - 1})
              </h5>
              {insights.slice(1, 3).map((insight, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-sm p-2 bg-white/3 rounded border border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedInsight(insight)}
                >
                  <span className="text-base">{getTypeEmoji(insight.type)}</span>
                  <span className="flex-1 text-white/80 text-xs">{insight.title}</span>
                  <div className={`flex items-center ${getPriorityColor(insight.priority)}`}>
                    {getPriorityIcon(insight.priority)}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Summary Stats */}
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <div className="text-center">
              <div className="text-xs text-white/50">Yesterday</div>
              <div className="text-sm font-medium text-white/80">
                {dailyRecap?.date ? new Date(dailyRecap.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                }) : '--'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50">Data Points</div>
              <div className="text-sm font-medium text-white/80">
                {(dailyRecap?.foodLogs?.length || 0) + (dailyRecap?.workoutLogs?.length || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50">Insights</div>
              <div className="text-sm font-medium text-white/80">
                {insights.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}