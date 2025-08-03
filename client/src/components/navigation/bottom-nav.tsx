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
      path: "/meal-log",
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
      <div className="flex items-center justify-around py-2 px-3 max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          const isMainAction = item.isMainAction;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path, item.id)}
              className={`flex items-center justify-center ios-haptic-medium ios-spring-fast h-full ${
                isMainAction 
                  ? 'ios-touch-target-large relative' 
                  : 'ios-padding-small ios-touch-target flex-col'
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
                  {/* Main action button with elevated design */}
                  <div className="w-14 h-14 flex items-center justify-center rounded-full transform transition-all duration-200 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgb(37, 99, 235), rgb(29, 78, 216))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))';
                    }}
                  >
                    <IconComponent 
                      className="w-6 h-6 text-white"
                      strokeWidth={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 mb-1 flex items-center justify-center">
                    <IconComponent 
                      className="w-4 h-4"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span className="text-caption-2 font-medium leading-none">{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}