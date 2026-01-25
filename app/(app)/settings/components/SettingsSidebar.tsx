"use client";

import { User, Palette, Bell, LifeBuoy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "appearance" | "notifications" | "support";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
}

const navItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "support", label: "Support", icon: LifeBuoy },
];

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto p-1 bg-muted/50 rounded-xl lg:bg-transparent lg:rounded-none lg:flex-col lg:space-y-1 lg:p-0 scrollbar-hide">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as SettingsTab)}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm transition-all relative whitespace-nowrap lg:w-full lg:px-4 lg:py-3 lg:rounded-md",
            activeTab === item.id
              ? "text-primary-foreground lg:text-foreground lg:bg-primary/10 font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
          )}
        >
          {activeTab === item.id && (
            <motion.div
              layoutId="active-settings-tab"
              className="absolute inset-0 bg-primary rounded-lg lg:hidden"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          {activeTab === item.id && (
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full hidden lg:block" />
          )}
          <item.icon className={cn("h-4 w-4 flex-shrink-0 relative z-10", activeTab === item.id ? "lg:text-primary" : "")} />
          <span className="relative z-10">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
