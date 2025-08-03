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
      
      {/* Popup container */}
      <div className="relative w-full max-w-md mx-auto px-4 pb-32">
        <div 
          className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 
                     transform transition-all duration-300 ease-out translate-y-0"
          style={{
            background: 'linear-gradient(145deg, rgba(30,30,35,0.95) 0%, rgba(20,20,25,0.95) 100%)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          {/* Options grid */}
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.path)}
                  className="group relative overflow-hidden rounded-xl p-4 text-left
                           transition-all duration-200 active:scale-95
                           hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{
                    background: option.bgColor,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg mb-3
                                 bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                    <IconComponent size={20} className="text-white" />
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {option.label}
                    </h3>
                    <p className="text-xs text-white/60">
                      {option.description}
                    </p>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 
                                 transition-opacity duration-200 rounded-xl" />
                </button>
              );
            })}
          </div>
          
          {/* Handle indicator */}
          <div className="flex justify-center mt-4">
            <div className="w-8 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}