import { Home, TrendingUp, Settings, Plus, UtensilsCrossed, Dumbbell } from "lucide-react";
import { useLocation } from "wouter";
import { useModal } from "@/contexts/modal-context";
import BBAIIcon from "@/components/icons/bb-ai-icon";

export default function BottomNav() {
  const [location, setLocation] = useLocation();
  const { closeAllModals } = useModal();

  const navItems = [
    {
      id: "home",
      icon: Home,
      label: "Home",
      path: "/dashboard"
    },
    {
      id: "progress",
      icon: TrendingUp,
      label: "Progress",
      path: "/progress"
    },
    {
      id: "add",
      icon: Plus,
      label: "Add Food",
      path: "/add-food",
      isMainAction: true
    },
    {
      id: "food",
      icon: UtensilsCrossed,
      label: "Food",
      path: "/meal-log"
    },
    {
      id: "workout",
      icon: Dumbbell,
      label: "Workout",
      path: "/workout"
    }
  ];

  const handleNavClick = (path: string, itemId: string) => {
    // Always navigate to the specified path, regardless of current state
    // This ensures navigation works even when modals/popups are open
    
    // Close all registered modals first
    closeAllModals();
    
    // Also dispatch escape key for any unregistered modals (fallback)
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true
    });
    document.dispatchEvent(escapeEvent);
    
    // Small delay to ensure modals close before navigation
    setTimeout(() => {
      if (itemId === 'home') {
        // For home tab, always go to dashboard and reset to current day
        setLocation('/dashboard?reset=true');
      } else {
        setLocation(path);
      }
    }, 100);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 ios-corner-radius-large" style={{
      backdropFilter: 'blur(24px)',
      background: 'rgba(20, 20, 25, 0.9)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <div className="flex items-center justify-around py-0.5 px-3 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          const isMainAction = item.isMainAction;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path, item.id)}
              className={`flex flex-col items-center justify-center ios-haptic-medium ios-spring-fast ${
                isMainAction 
                  ? 'ios-touch-target-large relative' 
                  : 'ios-padding-small ios-touch-target'
              } ${
                isActive 
                  ? 'ios-blue' 
                  : isMainAction 
                    ? 'text-white' 
                    : 'ios-gray'
              }`}
            >
              {isMainAction ? (
                <>
                  {/* Main action button with elevated design that spills over top border */}
                  <div className="w-11 h-11 -mt-4 mb-0.5 flex items-center justify-center rounded-full transform transition-all duration-200 active:scale-95"
                    style={{
                      backgroundColor: 'rgb(59, 130, 246)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(59, 130, 246)'}
                  >
                    <IconComponent 
                      className="w-5 h-5 text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 mb-0.5 flex items-center justify-center">
                    <IconComponent 
                      className="w-4 h-4"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span className="text-caption-2 font-medium">{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}