import { Home, TrendingUp, Settings } from "lucide-react";
import { useLocation } from "wouter";
import bbLogo from "@assets/BB logo_1751937804698.png";

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
        <div className="w-10 h-10 flex items-center justify-center">
          <img 
            src={bbLogo}
            alt="Body Butler"
            className="w-10 h-10 object-contain"
          />
        </div>
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
    <div className="fixed bottom-0 left-0 right-0 glass-card rounded-none border-t z-50" style={{ borderColor: 'hsl(var(--border) / 0.2)' }}>
      <div className="flex items-center justify-around py-4 px-6 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path, item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
              }`}
            >
              <>
                <IconComponent 
                  className="w-6 h-6 mb-1"
                  strokeWidth={2.5}
                />
                <span className="text-xs font-medium body-sans">{item.label}</span>
              </>
            </button>
          );
        })}
      </div>
    </div>
  );
}