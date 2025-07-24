import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Settings as SettingsIcon, User, Bell, Shield, Moon, Sun, LogOut, ChevronRight } from "lucide-react";
import IOSNavHeader from "@/components/navigation/ios-nav-header";
import { IOSButton } from "@/components/ui/ios-button";
import { IOSList, IOSListItem } from "@/components/ui/ios-list";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { useTheme } from "@/contexts/theme-context";
import BottomNav from "@/components/navigation/bottom-nav";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Gradient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black to-gray-800/80" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      {/* iOS Navigation Header */}
      <IOSNavHeader 
        title="Settings" 
        subtitle="Manage your preferences"
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-md mx-auto ios-padding min-h-screen" style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 120px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)'
      }}>
        <div className="ios-spacing-large">
          {/* Profile Section */}
          <div className="calm-card">
            <div className="flex items-center ios-spacing-small">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-headline font-semibold text-white">
                  {user?.firstName || 'User'}
                </h3>
                <p className="text-footnote ios-gray">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <IOSButton 
                variant="secondary" 
                size="small"
                onClick={() => {/* TODO: Edit profile */}}
              >
                Edit
              </IOSButton>
            </div>
          </div>

          {/* Appearance */}
          <div className="calm-card">
            <h3 className="text-headline font-semibold text-white mb-4">Appearance</h3>
            <IOSList grouped>
              <IOSListItem
                icon={theme === 'dark' ? <Moon className="w-5 h-5 text-white/80" /> : <Sun className="w-5 h-5 text-white/80" />}
                title="Dark Mode"
                subtitle="Toggle between light and dark themes"
                accessory={
                  <IOSSwitch 
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                }
              />
            </IOSList>
          </div>

          {/* Notifications */}
          <div className="calm-card">
            <h3 className="text-headline font-semibold text-white mb-4">Notifications</h3>
            <IOSList grouped>
              <IOSListItem
                icon={<Bell className="w-5 h-5 text-white/80" />}
                title="Push Notifications"
                subtitle="Receive workout reminders and updates"
                accessory={
                  <IOSSwitch 
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                }
              />
            </IOSList>
          </div>

          {/* Privacy & Security */}
          <div className="calm-card">
            <h3 className="text-headline font-semibold text-white mb-4">Privacy & Security</h3>
            <IOSList grouped>
              <IOSListItem
                icon={<Shield className="w-5 h-5 text-white/80" />}
                title="Biometric Authentication"
                subtitle="Use Face ID or Touch ID to secure your app"
                accessory={
                  <IOSSwitch 
                    checked={biometrics}
                    onChange={(e) => setBiometrics(e.target.checked)}
                  />
                }
              />
              <IOSListItem
                icon={<Shield className="w-5 h-5 text-white/80" />}
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                showChevron
                onPress={() => {/* TODO: Open privacy policy */}}
              />
              <IOSListItem
                icon={<Shield className="w-5 h-5 text-white/80" />}
                title="Terms of Service"
                subtitle="Read our terms of service"
                showChevron
                onPress={() => {/* TODO: Open terms */}}
              />
            </IOSList>
          </div>

          {/* Support */}
          <div className="calm-card">
            <h3 className="text-headline font-semibold text-white mb-4">Support</h3>
            <IOSList grouped>
              <IOSListItem
                icon={<SettingsIcon className="w-5 h-5 text-white/80" />}
                title="Help Center"
                subtitle="Get help with Body Butler"
                showChevron
                onPress={() => {/* TODO: Open help */}}
              />
              <IOSListItem
                icon={<SettingsIcon className="w-5 h-5 text-white/80" />}
                title="Contact Support"
                subtitle="Reach out to our support team"
                showChevron
                onPress={() => {/* TODO: Contact support */}}
              />
              <IOSListItem
                icon={<SettingsIcon className="w-5 h-5 text-white/80" />}
                title="App Version"
                subtitle="Version 1.0.0"
                accessory={
                  <span className="text-footnote ios-gray">1.0.0</span>
                }
              />
            </IOSList>
          </div>

          {/* Logout */}
          <div className="calm-card">
            <IOSList grouped>
              <IOSListItem
                icon={<LogOut className="w-5 h-5 text-white/80" />}
                title="Sign Out"
                subtitle="Sign out of your account"
                destructive
                onPress={handleLogout}
              />
            </IOSList>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}