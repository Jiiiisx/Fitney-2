"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// In a real app, this would be a shared component.
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
  // General Settings
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [sound, setSound] = useState("default");
  const [vibration, setVibration] = useState(true);
  const [showPopup, setShowPopup] = useState(true);
  const [showBadge, setShowBadge] = useState(true);

  // Channel Settings
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [achievements, setAchievements] = useState(true);
  const [socialUpdates, setSocialUpdates] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [appUpdates, setAppUpdates] = useState(false);

  // Smart Settings
  const [smartSummary, setSmartSummary] = useState(false);
  const [activityBased, setActivityBased] = useState(false);
  const [goalBased, setGoalBased] = useState(true);


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
              checked={allowNotifications}
              onCheckedChange={setAllowNotifications}
            />
          </SettingRow>

          {allowNotifications && (
            <>
              <SettingRow
                label="Notification Sound"
                description="Choose a sound or mute."
              >
                <Select value={sound} onValueChange={setSound}>
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
                <Switch checked={vibration} onCheckedChange={setVibration} />
              </SettingRow>

              <SettingRow
                label="Show Pop-up / Banner"
                description="Display notifications as a toast pop-up."
              >
                <Switch checked={showPopup} onCheckedChange={setShowPopup} />
              </SettingRow>

              <SettingRow
                label="Show Badge Count"
                description="Show unread count on the app icon."
              >
                <Switch checked={showBadge} onCheckedChange={setShowBadge} />
              </SettingRow>
            </>
          )}
        </div>
      </SettingsCard>

      {allowNotifications && (
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
                        <Switch checked={workoutReminders} onCheckedChange={setWorkoutReminders} />
                    </SettingRow>
                    <SettingRow
                        label="Achievements & Badges"
                        description="Get notified when you unlock a new achievement."
                    >
                        <Switch checked={achievements} onCheckedChange={setAchievements} />
                    </SettingRow>
                    <SettingRow
                        label="Friend Requests & Social Updates"
                        description="Notifications for friend requests, likes, or comments."
                    >
                        <Switch checked={socialUpdates} onCheckedChange={setSocialUpdates} />
                    </SettingRow>
                    <SettingRow
                        label="Weekly Progress Summary"
                        description="Receive your weekly training report."
                    >
                        <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />
                    </SettingRow>
                    <SettingRow
                        label="App Updates / Announcements"
                        description="Info on new features or important updates."
                    >
                        <Switch checked={appUpdates} onCheckedChange={setAppUpdates} />
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
                        <Switch checked={smartSummary} onCheckedChange={setSmartSummary} />
                    </SettingRow>
                    <SettingRow
                        label="Activity-Based Notifications"
                        description="Only show notifications when you are active."
                    >
                        <Switch checked={activityBased} onCheckedChange={setActivityBased} />
                    </SettingRow>
                    <SettingRow
                        label="Goal-Based Reminders"
                        description="Adjust reminders based on your weekly goals."
                    >
                        <Switch checked={goalBased} onCheckedChange={setGoalBased} />
                    </SettingRow>
                </div>
            </SettingsCard>
        </>
      )}
    </div>
  );
}
