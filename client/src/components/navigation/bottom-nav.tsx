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
        <div className="w-6 h-6 flex items-center justify-center">
          <img 
            src={bbLogo}
            alt="Body Butler"
            className="w-6 h-6 object-contain"
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

  const handleNavClick = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <>
                <IconComponent 
                  className="w-6 h-6 mb-1"
                  strokeWidth={2}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            </button>
          );
        })}
      </div>
    </div>
  );
}