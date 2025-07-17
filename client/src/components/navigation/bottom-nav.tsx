import { Home, TrendingUp, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { useModal } from "@/contexts/modal-context";
import BBAIIcon from "@/components/icons/bb-ai-icon";
import bbLogo from "@assets/BB logo_1752757975860.png";

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
      id: "ai",
      icon: BBAIIcon,
      label: "BB AI",
      path: "/ai-chat"
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      path: "/settings"
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
      <div className="flex items-center justify-around py-3 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path, item.id)}
              className={`flex flex-col items-center justify-center ios-padding-small ios-haptic-light ios-spring-fast ios-touch-target ${
                isActive 
                  ? 'ios-blue' 
                  : 'ios-gray'
              }`}
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <IconComponent 
                  className="w-6 h-6"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className="text-caption-2 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}