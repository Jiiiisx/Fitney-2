"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { fetchWithAuth } from "@/app/lib/fetch-helper";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const SettingsCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card border rounded-xl">
    <div className="p-6 border-b">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
);

const SettingRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between space-x-2">
    <div className="space-y-1">
      <Label className="font-semibold">{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    {children}
  </div>
);

export default function NotificationSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await fetchWithAuth("/api/users/settings");
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: any) => {
    // Optimistic update
    const previousSettings = { ...settings };
    setSettings({ ...settings, [key]: value });

    try {
      await fetchWithAuth("/api/users/settings", {
        method: "PATCH",
        body: JSON.stringify({ [key]: value }),
      });
    } catch (error) {
      console.error(`Failed to update setting ${key}`, error);
      toast.error("Failed to save changes");
      // Revert on error
      setSettings(previousSettings);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-10">
      <SettingsCard
        title="General Notification Settings"
        description="Atur cara dan frekuensi notifikasi."
      >
        <div className="space-y-8">
          <SettingRow
            label="Allow Notifications"
            description="Enable or disable all notifications."
          >
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(val) => updateSetting("pushNotifications", val)}
            />
          </SettingRow>

          {settings.pushNotifications && (
            <>
              <SettingRow
                label="Notification Sound"
                description="Choose a sound or mute."
              >
                <Select 
                    value={settings.notificationSound} 
                    onValueChange={(val) => updateSetting("notificationSound", val)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="mute">Mute</SelectItem>
                  </SelectContent>
                </Select>
              </SettingRow>

              <SettingRow
                label="Vibration (mobile)"
                description="On/off vibration for notifications."
              >
                <Switch 
                    checked={settings.vibrationEnabled} 
                    onCheckedChange={(val) => updateSetting("vibrationEnabled", val)} 
                />
              </SettingRow>

              <SettingRow
                label="Show Pop-up / Banner"
                description="Display notifications as a toast pop-up."
              >
                <Switch 
                    checked={settings.showPopup} 
                    onCheckedChange={(val) => updateSetting("showPopup", val)} 
                />
              </SettingRow>

              <SettingRow
                label="Show Badge Count"
                description="Show unread count on the app icon."
              >
                <Switch 
                    checked={settings.showBadge} 
                    onCheckedChange={(val) => updateSetting("showBadge", val)} 
                />
              </SettingRow>
            </>
          )}
        </div>
      </SettingsCard>

      {settings.pushNotifications && (
        <>
            <SettingsCard
            title="Notification Channels"
            description="Pilih notifikasi mana yang ingin Anda terima."
            >
                <div className="space-y-8">
                    <SettingRow
                        label="Workout Reminders"
                        description="Reminders for your scheduled training sessions."
                    >
                        <Switch 
                            checked={settings.channelWorkout} 
                            onCheckedChange={(val) => updateSetting("channelWorkout", val)} 
                        />
                    </SettingRow>
                    <SettingRow
                        label="Achievements & Badges"
                        description="Get notified when you unlock a new achievement."
                    >
                        <Switch 
                            checked={settings.channelAchievements} 
                            onCheckedChange={(val) => updateSetting("channelAchievements", val)} 
                        />
                    </SettingRow>
                    <SettingRow
                        label="Friend Requests & Social Updates"
                        description="Notifications for friend requests, likes, or comments."
                    >
                        <Switch 
                            checked={settings.channelSocial} 
                            onCheckedChange={(val) => updateSetting("channelSocial", val)} 
                        />
                    </SettingRow>
                    {/* Placeholder fields not yet in DB, but UI remains for future expansion or we add to DB */}
                    <SettingRow
                        label="Weekly Progress Summary"
                        description="Receive your weekly training report."
                    >
                        <Switch checked={false} disabled />
                    </SettingRow>
                    <SettingRow
                        label="App Updates / Announcements"
                        description="Info on new features or important updates."
                    >
                        <Switch checked={false} disabled />
                    </SettingRow>
                </div>
            </SettingsCard>
            
            <SettingsCard
                title="Smart / Contextual Options"
                description="Get smarter, more relevant notifications."
            >
                <div className="space-y-8">
                    <SettingRow
                        label="Smart Summary Mode"
                        description="Group non-urgent notifications into a daily summary."
                    >
                        <Switch checked={false} disabled />
                    </SettingRow>
                    <SettingRow
                        label="Activity-Based Notifications"
                        description="Only show notifications when you are active."
                    >
                        <Switch checked={false} disabled />
                    </SettingRow>
                    <SettingRow
                        label="Goal-Based Reminders"
                        description="Adjust reminders based on your weekly goals."
                    >
                        <Switch checked={true} disabled />
                    </SettingRow>
                </div>
            </SettingsCard>
        </>
      )}
    </div>
  );
}