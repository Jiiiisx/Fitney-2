"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SettingsSidebar from "./components/SettingsSidebar";
import ProfileSettings from "./components/ProfileSettings";
import AppearanceSettings from "./components/AppearanceSettings";
// import NotificationSettings from "./components/NotificationSettings";

type SettingsTab = "profile" | "appearance" | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "notifications":
        return <div>Notification Settings Component Here</div>; // Placeholder
      default:
        return <div className="text-gray-800">Select a category</div>;
    }
  };

  const animationVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="px-12 pt-12 pb-8 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Settings
          </h1>
          <p className="text-base text-gray-500 mt-2">
            Manage your account, preferences, and notifications.
          </p>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-grow flex max-w-screen-2xl mx-auto w-full overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-1/4 bg-gray-50 overflow-y-auto border-r border-gray-200">
          <div className="p-6">
            <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 bg-white overflow-y-auto">
          <div className="p-12">
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
