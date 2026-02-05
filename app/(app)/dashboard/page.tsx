"use client";

import { useEffect, useState } from "react";
import StatsSidebar from "./_components/StatsSidebar";
import TodaysPlanBanner from "./_components/TodaysPlanBanner";
import DailyGoals from "./_components/DailyGoals";
import RecentActivityList from "./_components/RecentActivityList";
import UpgradeBanner from "./_components/UpgradeBanner";
import GamificationStreak from "./_components/GamificationStreak";
import ProgressCharts from "./_components/ProgressCharts";
import WorkoutBreakdown from "./_components/WorkoutBreakdown";
import CompleteProfileBanner from "./_components/CompleteProfileBanner";
import QuickActions from "./_components/QuickActions";
import PremiumAnalytics from "./_components/PremiumAnalytics";
import AIWorkoutGenerator from "./_components/AIWorkoutGenerator";
import PremiumTrends from "./_components/PremiumTrends";
import PremiumTools from "./_components/PremiumTools";
import { Megaphone, X, Loader2, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ShareModal from "../components/sharing/ShareModal";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/app/lib/fetch-helper";
import useSWR from 'swr';

const fetcher = (url: string) => fetchWithAuth(url);

export default function DashboardPage() {
  const { data, isLoading: loading } = useSWR("/api/stats/dashboard", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000
  });
  const { data: announcementData, mutate: mutateAnn } = useSWR("/api/announcements", fetcher);
  const { data: userProfile } = useSWR("/api/users/profile", fetcher);

  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    if (announcementData && announcementData.length > 0) {
      setAnnouncement(announcementData[0]);
    }
  }, [announcementData]);

  if (loading && !data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Preparing your dashboard...</p>
      </div>
    );
  }

  const safeStats = data?.today || { duration: 0, calories: 0, workouts: 0 };
  const safeTodaysPlan = data?.todaysPlan || null;
  const safeWeekly = data?.weekly || [];
  const safeRecent = data?.recent || [];
  const safeStreak = data?.streak || 0;
  const safeBreakdown = data?.breakdown || { mostFrequent: "N/A", avgDuration: 0, heatmap: [] };

  const shareData = {
    type: "Daily Progress",
    durationMinutes: safeStats.duration,
    caloriesBurned: safeStats.calories,
    date: new Date(),
    workoutName: safeStats.workouts > 0 ? `${safeStats.workouts} Workouts Done` : "Daily Activity",
    user: {
      name: userProfile?.fullName || "Fitney User",
      username: "fitney_member",
    }
  };

  return (
    <div className="min-h-screen lg:h-full relative">
      <AnimatePresence>
        {data && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 right-6 z-50 lg:bottom-10 lg:right-10"
          >
            <ShareModal 
              workoutData={shareData}
              trigger={
                <Button 
                  size="icon"
                  className="rounded-full h-12 w-12 lg:h-auto lg:w-auto lg:px-5 lg:py-2.5 shadow-lg shadow-black/10 hover:shadow-xl transition-all bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 lg:flex lg:items-center lg:gap-2 group"
                >
                  <Share2 className="w-5 h-5 lg:w-4 lg:h-4 text-primary" />
                  <span className="hidden lg:inline text-sm font-medium tracking-tight">Share Progress</span>
                </Button>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:grid lg:grid-cols-3 min-h-screen lg:h-full">
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-6 lg:space-y-8 overflow-y-auto p-6 lg:p-8 pb-[10.5rem] lg:pb-[10.5rem] scrollbar-hide">
          {announcement && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-primary rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-lg shadow-primary/20"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10"><Megaphone className="w-16 h-16 sm:w-24 sm:h-24" /></div>
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0 mt-1 sm:mt-0">
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5 sm:pt-0">
                  <p className="text-primary-foreground font-black text-sm sm:text-lg tracking-tight leading-none uppercase italic mb-1">Official Announcement</p>
                  <p className="text-primary-foreground/90 font-medium text-xs sm:text-sm line-clamp-3 sm:line-clamp-none">{announcement.content}</p>
                </div>
                <button 
                  onClick={() => setAnnouncement(null)}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors shrink-0 -mr-2 -mt-2 sm:mr-0 sm:mt-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </button>
              </div>
            </motion.div>
          )}
          <CompleteProfileBanner />
          <AIWorkoutGenerator isPremium={data?.isPremium || false} />
          <TodaysPlanBanner stats={safeStats} plan={safeTodaysPlan} isLoading={loading} />
          <div className="lg:hidden"><QuickActions /></div>
          <GamificationStreak streak={safeStreak} isLoading={loading} />
          <DailyGoals stats={safeStats} targets={data?.targets} />
          <RecentActivityList workouts={safeRecent} isLoading={loading} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressCharts weeklyData={safeWeekly} isLoading={loading} />
            <PremiumAnalytics data={data?.fitnessRadar || []} isPremium={data?.isPremium || false} />
          </div>
          <WorkoutBreakdown stats={safeBreakdown} isLoading={loading} />
          <PremiumTrends data={data?.trendData || []} isPremium={data?.isPremium || false} />
          <PremiumTools isPremium={data?.isPremium || false} />
          {(data?.role === 'user' || data?.role === 'pro' || data?.role === 'premium') && (
              <UpgradeBanner currentRole={data?.role || 'user'} />
          )}
        </div>
        <div className="order-1 lg:order-2 lg:col-span-1 space-y-6 lg:space-y-8 px-6 py-12 sm:py-16 lg:p-8 bg-white dark:bg-neutral-950 lg:bg-muted lg:border-l border-border lg:overflow-y-auto scrollbar-hide rounded-b-[3rem] lg:rounded-none shadow-xl lg:shadow-none z-20 relative">
          <StatsSidebar />
        </div>
      </div>
    </div>
  );
}
