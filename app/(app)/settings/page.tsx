"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import SettingsSidebar from "./components/SettingsSidebar";
import AppearanceSettings from "./components/AppearanceSettings";
import NotificationSettings from "./components/NotificationSettings";
import { Progress } from "@/components/ui/progress"; // Import Progress component

const ProfileSettings = dynamic(() => import('./components/ProfileSettings'), { ssr: false });
const SupportSettings = dynamic(() => import('./components/SupportSettings'), { ssr: false });

type SettingsTab = "profile" | "appearance" | "notifications" | "support";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");
  // State for gamification stats
  const [gamificationStats, setGamificationStats] = useState({
    level: 1,
    xp: 0,
    xpForNextLevel: 100,
    progressPercentage: 0,
  });

  // Fetch gamification stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/users/gamification-stats');
        if (response.ok) {
          const data = await response.json();
          setGamificationStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch gamification stats', error);
      }
    }
    fetchStats();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "support":
        return <SupportSettings />;
      default:
        return <div className="text-foreground">Select a category</div>;
    }
  };

  const animationVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-8 lg:px-12 lg:pt-12 lg:pb-8 border-b border-border bg-background flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1 lg:mt-2">
            Manage your account, preferences, and notifications.
          </p>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-grow flex flex-col lg:flex-row max-w-screen-2xl mx-auto w-full lg:overflow-hidden">
        {/* Left Sidebar (Tabs on Mobile) */}
        <aside className="w-full lg:w-1/4 bg-muted/30 lg:bg-muted/50 border-b lg:border-b-0 lg:border-r border-border shrink-0">
          <div className="p-4 lg:p-6">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 bg-background overflow-y-auto">
          <div className="p-6 lg:p-12 space-y-6">
            {/* Gamification Stats Section - Compact & Modern */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Level {gamificationStats.level}</h2>
                <p className="text-sm text-muted-foreground">Keep pushing! You're doing great.</p>
              </div>
              
              <div className="flex-1 w-full sm:max-w-md space-y-2">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Progress</span>
                  <span>{gamificationStats.xp} / {gamificationStats.xpForNextLevel} XP</span>
                </div>
                <Progress value={gamificationStats.progressPercentage} className="h-3" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={animationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
