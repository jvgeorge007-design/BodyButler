import { Home, TrendingUp, Settings, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import bbLogo from "@assets/image_1752718827591.png";

export default function BottomNav() {
  const [location, setLocation] = useLocation();

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
      icon: () => (
        <img 
          src={bbLogo}
          alt="Body Butler"
          className="w-9 h-9 object-contain"
        />
      ),
      label: "BB",
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
    if (itemId === 'home') {
      // For home tab, always go to dashboard and reset to current day
      setLocation('/dashboard?reset=true');
    } else {
      setLocation(path);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-black/70 border-t border-white/20">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path, item.id)}
              className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${
                isActive 
                  ? 'text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <div className="w-6 h-6 mb-1 flex items-center justify-center">
                <IconComponent 
                  className="w-6 h-6"
                  strokeWidth={2}
                />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}