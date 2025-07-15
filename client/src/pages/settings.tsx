import { User, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/navigation/bottom-nav";

export default function Settings() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const settingsGroups = [
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 pt-12">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split('@')[0] || 'User'
                }
              </h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-2">
              {group.title}
            </h4>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {group.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={itemIndex}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
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
            className="w-full p-4 bg-red-50 hover:bg-red-100 transition-colors rounded-3xl flex items-center justify-center gap-3 text-red-600 font-medium"
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