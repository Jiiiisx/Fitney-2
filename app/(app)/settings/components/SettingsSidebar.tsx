"use client";

import { User, Palette, Bell, Shield } from "lucide-react";

type SettingsTab = "profile" | "appearance" | "notifications";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

const navItems = [
  { id: "profile", label: "Profile & Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as SettingsTab)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-md transition-colors relative ${
            activeTab === item.id
              ? "bg-yellow-100 text-yellow-900 font-semibold"
              : "text-gray-500 hover:bg-yellow-50 hover:text-yellow-900"
          }`}
        >
          {activeTab === item.id && (
            <div className="absolute left-0 top-2 h-[calc(100%-1rem)] w-1 bg-yellow-400 rounded-r-full" />
          )}
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
