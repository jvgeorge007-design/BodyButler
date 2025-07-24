import { useState } from 'react';
import { X, BookOpen, Plus, Search, Clock, Utensils, TrendingUp } from 'lucide-react';
import FoodLogPopup from './food-log-popup';
import AddFoodCarousel from './add-food-carousel';

interface UnifiedFoodInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  macros: Array<{
    name: string;
    current: number;
    target: number;
    color: string;
  }>;
}

export function UnifiedFoodInterface({ isOpen, onClose, macros }: UnifiedFoodInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'log' | 'add'>('quick');
  const [showFoodLog, setShowFoodLog] = useState(false);
  const [showAddFoodCarousel, setShowAddFoodCarousel] = useState(false);

  if (!isOpen) return null;

  const quickActions = [
    { 
      icon: Clock, 
      label: 'Log Recent', 
      description: 'Add from recent meals',
      action: () => setShowAddFoodCarousel(true)
    },
    { 
      icon: Search, 
      label: 'Search Food', 
      description: 'Find and add new items',
      action: () => setShowAddFoodCarousel(true)
    },
    { 
      icon: BookOpen, 
      label: 'View Log', 
      description: 'See today\'s entries',
      action: () => setShowFoodLog(true)
    },
    { 
      icon: TrendingUp, 
      label: 'Quick Stats', 
      description: 'Macro progress overview',
      action: () => setActiveTab('log')
    }
  ];

  // Calculate overall progress
  const totalProgress = macros.reduce((sum, macro) => sum + (macro.current / macro.target), 0) / macros.length;
  const isOnTrack = totalProgress >= 0.8;
  const needsAttention = macros.filter(m => (m.current / m.target) < 0.5);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
        <div className="w-full bg-black/90 backdrop-blur-xl rounded-t-3xl border-t border-white/10 max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-title3 font-semibold text-white">Food Management</h2>
              <p className="text-callout text-gray-400 mt-1">
                {isOnTrack ? 'Great progress today!' : `${needsAttention.length} macros need attention`}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-system-md haptic-light hover:bg-white/10"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Quick Progress Overview */}
          <div className="p-6 border-b border-white/10">
            <div className="grid grid-cols-3 gap-4">
              {macros.map((macro, index) => {
                const percentage = Math.min((macro.current / macro.target) * 100, 100);
                const isLow = percentage < 50;
                
                return (
                  <div key={macro.name} className="text-center">
                    <div className="text-footnote text-gray-400 mb-1">{macro.name}</div>
                    <div className={`text-body font-medium ${isLow ? 'text-orange-400' : 'text-white'}`}>
                      {macro.current}g
                    </div>
                    <div className="w-full bg-gray-700 rounded-system-xs h-2 mt-2">
                      <div 
                        className="h-2 rounded-system-xs transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: macro.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="p-6">
            <h3 className="text-headline font-medium text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="p-4 bg-white/5 border border-white/10 rounded-system-lg haptic-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <action.icon className="w-6 h-6 text-blue-400 mb-3" />
                  <div className="text-left">
                    <div className="text-body font-medium text-white">{action.label}</div>
                    <div className="text-footnote text-gray-400 mt-1">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Suggestions */}
          {needsAttention.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
              <h3 className="text-headline font-medium text-orange-400 mb-2 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Nutrition Focus
              </h3>
              <p className="text-callout text-gray-300">
                You're low on {needsAttention.map(m => m.name.toLowerCase()).join(' and ')}. 
                Consider adding {needsAttention[0].name === 'Protein' ? 'chicken, fish, or beans' : 
                              needsAttention[0].name === 'Carbs' ? 'rice, oats, or fruits' : 
                              'nuts, oils, or avocado'}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nested Popups */}
      <FoodLogPopup 
        isOpen={showFoodLog}
        onClose={() => setShowFoodLog(false)}
      />
      
      <AddFoodCarousel 
        isOpen={showAddFoodCarousel}
        onClose={() => setShowAddFoodCarousel(false)}
      />
    </>
  );
}