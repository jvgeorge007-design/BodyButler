import { Camera, Receipt, Utensils, Clock, Dumbbell } from "lucide-react";
import { useLocation } from "wouter";

interface AddOptionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddOptionsPopup({ isOpen, onClose }: AddOptionsPopupProps) {
  const [, setLocation] = useLocation();

  const options = [
    {
      id: "workout",
      icon: Dumbbell,
      label: "Quick Workout",
      description: "Log exercise",
      path: "/workout",
      bgColor: "rgba(249, 115, 22, 0.2)"
    },
    {
      id: "eating-out",
      icon: Receipt,
      label: "Eating Out",
      description: "Scan receipt",
      path: "/add-food?context=eating-out",
      bgColor: "rgba(59, 130, 246, 0.2)"
    },
    {
      id: "eating-in",
      icon: Camera,
      label: "Eating In",
      description: "Photo food",
      path: "/add-food?context=eating-in",
      bgColor: "rgba(34, 197, 94, 0.2)"
    },
    {
      id: "recent",
      icon: Clock,
      label: "Recent Foods",
      description: "Quick add",
      path: "/meal-log?tab=recent",
      bgColor: "rgba(168, 85, 247, 0.2)"
    }
  ];

  const getOptionGradient = (optionId: string) => {
    switch (optionId) {
      case 'workout': return '#f97316, #ea580c'; // Orange gradient
      case 'eating-out': return '#3b82f6, #2563eb'; // Blue gradient  
      case 'eating-in': return '#22c55e, #16a34a'; // Green gradient
      case 'recent': return '#a855f7, #9333ea'; // Purple gradient
      default: return '#6b7280, #4b5563'; // Gray fallback
    }
  };

  const handleOptionClick = (path: string) => {
    onClose();
    setTimeout(() => {
      setLocation(path);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Background overlay that blurs the page content */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Floating Options Grid */}
      <div className="relative w-full max-w-md mx-auto px-6 pb-32">
        <div className="grid grid-cols-2 gap-6">
          {options.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.path)}
                className="group relative flex flex-col items-center justify-center p-6 rounded-3xl
                         transition-all duration-300 active:scale-95 hover:scale-105 
                         focus:outline-none focus:ring-2 focus:ring-white/50"
                style={{
                  background: 'rgba(20, 20, 25, 0.98)',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transform: `translateY(${index % 2 === 0 ? '0px' : '10px'})`,
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '300ms',
                  animationFillMode: 'both'
                }}
              >
                {/* Icon container */}
                <div 
                  className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4
                           transition-all duration-200 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${getOptionGradient(option.id)})`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <IconComponent size={28} className="text-white" strokeWidth={2} />
                </div>
                
                {/* Text */}
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {option.label}
                  </h3>
                  <p className="text-xs text-white/70">
                    {option.description}
                  </p>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-white/5 opacity-0 group-hover:opacity-100 
                               transition-opacity duration-200" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}