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
      {/* iOS Navigation Header */}
      <IOSNavHeader 
        title="Settings" 
        subtitle="Manage your preferences"
      />

      {/* Main Content */}
      <main className="max-w-md mx-auto ios-padding min-h-screen" style={{ 
        paddingTop: 'calc(env(safe-area-inset-top) + 120px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)'
      }}>
        <div className="ios-spacing-large">
          {/* Profile Section */}
          <div className="ios-card">
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
          <div className="ios-card">
            <h3 className="text-headline font-semibold text-white mb-4">Appearance</h3>
            <IOSList grouped>
              <IOSListItem
                icon={theme === 'dark' ? <Moon className="w-5 h-5 ios-blue" /> : <Sun className="w-5 h-5 ios-yellow" />}
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
          <div className="ios-card">
            <h3 className="text-headline font-semibold text-white mb-4">Notifications</h3>
            <IOSList grouped>
              <IOSListItem
                icon={<Bell className="w-5 h-5 ios-blue" />}
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
          <div className="ios-card">
            <h3 className="text-headline font-semibold text-white mb-4">Privacy & Security</h3>
            <IOSList grouped>
              <IOSListItem
                icon={<Shield className="w-5 h-5 ios-green" />}
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
                icon={<Shield className="w-5 h-5 ios-blue" />}
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                showChevron
                onPress={() => {/* TODO: Open privacy policy */}}
              />
              <IOSListItem
                icon={<Shield className="w-5 h-5 ios-blue" />}
                title="Terms of Service"
                subtitle="Read our terms of service"
                showChevron
                onPress={() => {/* TODO: Open terms */}}
              />
            </IOSList>
          </div>

          {/* Support */}
          <div className="ios-card">
            <h3 className="text-headline font-semibold text-white mb-4">Support</h3>
            <IOSList grouped>
              <IOSListItem
                icon={<SettingsIcon className="w-5 h-5 ios-blue" />}
                title="Help Center"
                subtitle="Get help with Body Butler"
                showChevron
                onPress={() => {/* TODO: Open help */}}
              />
              <IOSListItem
                icon={<SettingsIcon className="w-5 h-5 ios-blue" />}
                title="Contact Support"
                subtitle="Reach out to our support team"
                showChevron
                onPress={() => {/* TODO: Contact support */}}
              />
              <IOSListItem
                icon={<SettingsIcon className="w-5 h-5 ios-blue" />}
                title="App Version"
                subtitle="Version 1.0.0"
                accessory={
                  <span className="text-footnote ios-gray">1.0.0</span>
                }
              />
            </IOSList>
          </div>

          {/* Logout */}
          <div className="ios-card">
            <IOSList grouped>
              <IOSListItem
                icon={<LogOut className="w-5 h-5 text-red-500" />}
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