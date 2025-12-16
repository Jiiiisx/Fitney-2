"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import SettingsSidebar from "./components/SettingsSidebar";
import AppearanceSettings from "./components/AppearanceSettings";
import NotificationSettings from "./components/NotificationSettings";
import { Progress } from "@/components/ui/progress"; // Import Progress component

const ProfileSettings = dynamic(() => import('./components/ProfileSettings'), { ssr: false });

type SettingsTab = "profile" | "appearance" | "notifications";

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
      <header className="px-12 pt-12 pb-8 border-b border-border bg-background flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Settings
          </h1>
          <p className="text-base text-muted-foreground mt-2">
            Manage your account, preferences, and notifications.
          </p>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-grow flex max-w-screen-2xl mx-auto w-full overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-1/4 bg-muted/50 border-r border-border">
          <div className="p-6">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 bg-background overflow-y-auto">
          <div className="p-12">
            {/* Gamification Stats Section */}
            <div className="mb-8 p-6 border rounded-lg bg-muted/20">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Level</h2>
              <div className="space-y-3">
                <p className="text-lg text-muted-foreground">
                  <strong>Level:</strong> <span className="text-foreground font-bold">{gamificationStats.level}</span>
                </p>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-muted-foreground">Progress to Next Level</span>
                    <span className="font-mono text-foreground">{gamificationStats.xp} / {gamificationStats.xpForNextLevel} XP</span>
                  </div>
                  <Progress value={gamificationStats.progressPercentage} />
                </div>
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
