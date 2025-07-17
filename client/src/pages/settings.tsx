import { User, Bell, Shield, HelpCircle, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/theme-context";
import BottomNav from "@/components/navigation/bottom-nav";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const settingsGroups = [
    {
      title: "Appearance",
      items: [
        { 
          icon: theme === 'dark' ? Moon : Sun, 
          label: `${theme === 'dark' ? 'Dark' : 'Light'} Mode`, 
          description: "Toggle between light and dark themes",
          action: toggleTheme
        }
      ]
    },
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile Settings", description: "Update your personal information" },
        { icon: Bell, label: "Notifications", description: "Manage your notification preferences" },
        { icon: Shield, label: "Privacy & Security", description: "Control your data and privacy" }
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & FAQ", description: "Get answers to common questions" }
      ]
    }
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="glass-card mx-6 mt-12 mb-6">
        <h1 className="text-2xl font-bold heading-serif" style={{color: 'var(--text-primary)'}}>Settings</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* User Info Card */}
        <div className="glass-card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background: 'rgba(0, 183, 225, 0.2)'}}>
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8" style={{color: 'rgb(0, 183, 225)'}} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold heading-serif" style={{color: 'var(--text-primary)'}}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split('@')[0] || 'User'
                }
              </h3>
              <p className="text-sm body-sans" style={{color: 'var(--text-secondary)'}}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wide px-2 body-sans" style={{color: 'var(--text-tertiary)'}}>
              {group.title}
            </h4>
            <div className="glass-card p-0 overflow-hidden">
              {group.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className="w-full p-4 text-left hover:bg-black/10 transition-colors border-b last:border-b-0 flex items-center gap-4"
                    style={{borderColor: 'var(--glass-card-border)'}}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                      <IconComponent className="w-5 h-5" style={{color: 'var(--text-primary)'}} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium heading-serif" style={{color: 'var(--text-primary)'}}>{item.label}</h3>
                      <p className="text-sm body-sans" style={{color: 'var(--text-secondary)'}}>{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full p-4 transition-colors rounded-3xl flex items-center justify-center gap-3 font-medium glass-card"
            style={{color: 'rgb(239, 68, 68)'}}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}