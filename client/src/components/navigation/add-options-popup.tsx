import { UtensilsCrossed, Receipt, Clock, Dumbbell } from "lucide-react";
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
      icon: UtensilsCrossed,
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
    <>
      {/* Full screen overlay for click-outside handling */}
      <div 
        className="fixed inset-0"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      />
      
      {/* Background blur overlay that excludes bottom nav */}
      <div 
        className="fixed inset-0 bg-gray-600/60 transition-all duration-300 pointer-events-none"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          bottom: '80px', // Exclude bottom nav area from blur
          zIndex: 9998
        }}
      />
      
      {/* Simple Options Grid - Cal.ai style */}
      <div 
        className="fixed bottom-24 left-0 right-0 px-4" 
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-sm mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.path)}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white
                           transition-all duration-200 active:scale-95 hover:scale-105 
                           focus:outline-none shadow-lg"
                  style={{
                    minHeight: '120px'
                  }}
                >
                  {/* Simple icon */}
                  <IconComponent 
                    size={24} 
                    className="text-gray-800 mb-3" 
                    strokeWidth={2} 
                  />
                  
                  {/* Simple text */}
                  <span className="text-sm font-medium text-gray-800 text-center leading-tight">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}