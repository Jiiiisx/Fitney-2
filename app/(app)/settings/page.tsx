"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import SettingsSidebar from "./components/SettingsSidebar";
import AppearanceSettings from "./components/AppearanceSettings";
import NotificationSettings from "./components/NotificationSettings";
import { Progress } from "@/components/ui/progress";
import { User, Shield, Bell, Palette, LifeBuoy, ChevronLeft, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/app/lib/utils";

const ProfileSettings = dynamic(() => import('./components/ProfileSettings'), { ssr: false });
const SupportSettings = dynamic(() => import('./components/SupportSettings'), { ssr: false });

type SettingsTab = "profile" | "appearance" | "notifications" | "support";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);
  const [gamificationStats, setGamificationStats] = useState({
    level: 1,
    xp: 0,
    xpForNextLevel: 100,
    progressPercentage: 0,
  });

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

  const menuItems = [
    { id: "profile", label: "Account Profile", icon: User, desc: "Personal info, email, and security", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "appearance", label: "Display & Appearance", icon: Palette, desc: "Themes, font sizes, and layout", color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "notifications", label: "Push Notifications", icon: Bell, desc: "Alerts, sounds, and preferences", color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "support", label: "Help & Support", icon: LifeBuoy, desc: "FAQs, contact, and legal", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettings />;
      case "appearance": return <AppearanceSettings />;
      case "notifications": return <NotificationSettings />;
      case "support": return <SupportSettings />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-black font-poppins">
      <div className="max-w-[1400px] mx-auto px-6 py-10 md:p-12 lg:p-16">
        
        {/* Header - Adaptive Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
               {activeTab && (
                 <button 
                  onClick={() => setActiveTab(null)}
                  className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors -ml-2"
                 >
                   <ChevronLeft className="w-6 h-6" />
                 </button>
               )}
               <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-neutral-900 dark:text-white">
                 Settings
               </h1>
            </div>
            <p className="text-muted-foreground font-medium text-sm md:text-base italic">
              {activeTab ? `Adjusting your ${activeTab} preferences` : "Customize your Fitney experience to match your flow."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Stats Card - Always visible or top on mobile */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white dark:bg-neutral-950 p-8 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
               
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                     <Zap className="w-8 h-8 fill-current" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Your Growth</p>
                     <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter">Level {gamificationStats.level}</h2>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground opacity-60">Progress to Level {gamificationStats.level + 1}</span>
                     <span className="text-sm font-black tabular-nums">{gamificationStats.xp} / {gamificationStats.xpForNextLevel} XP</span>
                  </div>
                  <div className="relative pt-1">
                     <Progress value={gamificationStats.progressPercentage} className="h-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-full" indicatorClassName="bg-primary shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground italic opacity-60 text-center pt-2">Keep pushing! Consistency is your superpower.</p>
               </div>
            </div>

            {/* Desktop Menu - Sidebar style */}
            <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-[2rem] p-4 shadow-sm border border-neutral-100 dark:border-neutral-800">
               <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as SettingsTab)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
                        activeTab === item.id 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                          : "text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : item.color)} />
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* RIGHT: Content or Category Grid */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!activeTab ? (
                <motion.div 
                  key="menu-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {menuItems.map((item, index) => (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.id}
                      onClick={() => setActiveTab(item.id as SettingsTab)}
                      className="group p-8 rounded-[2.5rem] bg-white dark:bg-neutral-950 border-none shadow-sm hover:shadow-2xl transition-all duration-500 text-left relative overflow-hidden"
                    >
                      <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700", item.bg.replace('/10', ''))} />
                      
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:rotate-6 duration-500", item.bg)}>
                        <item.icon className={cn("w-7 h-7", item.color)} />
                      </div>
                      <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">{item.label}</h3>
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-6">{item.desc}</p>
                      
                      <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                        Configure <ArrowRight className="w-3 h-3" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="active-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="bg-white dark:bg-neutral-950 p-8 sm:p-10 rounded-[3rem] shadow-2xl border-none"
                >
                  <div className="mb-10 pb-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl", menuItems.find(i => i.id === activeTab)?.bg)}>
                           {(() => {
                             const ItemIcon = menuItems.find(i => i.id === activeTab)?.icon || User;
                             return <ItemIcon className={cn("w-6 h-6", menuItems.find(i => i.id === activeTab)?.color)} />;
                           })()}
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">{menuItems.find(i => i.id === activeTab)?.label}</h2>
                     </div>
                     <button 
                      onClick={() => setActiveTab(null)}
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-neutral-900 dark:hover:text-white transition-colors"
                     >
                       Close
                     </button>
                  </div>
                  {renderActiveContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}