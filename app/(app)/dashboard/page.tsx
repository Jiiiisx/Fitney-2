"use client";

import { useEffect, useState } from "react";
// Hapus dynamic import jika tidak perlu lazy loading berat, import biasa lebih aman untuk debugging awal
import StatsSidebar from "../components/StatsSidebar";
import TodaysPlanBanner from "../components/TodaysPlanBanner";
import DailyGoals from "../components/DailyGoals";
import RecentActivityList from "../components/RecentActivityList";
import UpgradeBanner from "../components/UpgradeBanner";
import GamificationStreak from "../components/GamificationStreak";
import ProgressCharts from "../components/ProgressCharts";
import WorkoutBreakdown from "../components/WorkoutBreakdown";
import CompleteProfileBanner from "../components/CompleteProfileBanner";
import DashboardInsight from "../components/DashboardInsight";
import { Megaphone, X } from "lucide-react";
import toast from "react-hot-toast";

// Interface yang lebih fleksibel agar cocok dengan respons API dan props komponen
interface DashboardData {
  today: {
    duration: number;
    calories: number;
    workouts: number;
    water?: number;
  };
  todaysPlan: any; // Tambahkan ini
  weekly: { name: string; value: number }[]; // Spesifikasikan bentuk array weekly
  recent: any[];
  streak: number;
  insight?: string;
  breakdown: {
    mostFrequent: string;
    avgDuration: number;
    heatmap: { date: string; count: number }[];
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, annRes] = await Promise.all([
          fetch("/api/stats/dashboard", { credentials: 'include' }),
          fetch("/api/announcements")
        ]);

        if (dashRes.ok) {
          const result = await dashRes.json();
          setData(result);
        }
        
        if (annRes.ok) {
          const annResult = await annRes.json();
          if (annResult.length > 0) setAnnouncement(annResult[0]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Siapkan data default aman agar tidak error saat null
  const safeStats = data?.today || { duration: 0, calories: 0, workouts: 0 };
  const safeTodaysPlan = data?.todaysPlan || null;
  const safeWeekly = data?.weekly || [];
  const safeRecent = data?.recent || [];
  const safeStreak = data?.streak || 0;
  const safeInsight = data?.insight || "";
  // Menyiapkan data breakdown dengan default value
  const safeBreakdown = data?.breakdown || { mostFrequent: "N/A", avgDuration: 0, heatmap: [] };

  return (
    <div className="min-h-screen lg:h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-screen lg:h-full">
        {/* Main Content Area (Scrollable) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide">
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

          <TodaysPlanBanner stats={safeStats} plan={safeTodaysPlan} isLoading={loading} />

          <GamificationStreak streak={safeStreak} isLoading={loading} />

          <DailyGoals stats={safeStats} />

          <RecentActivityList workouts={safeRecent} isLoading={loading} />

          <ProgressCharts weeklyData={safeWeekly} isLoading={loading} />

          {/* Mengirimkan data breakdown ke komponen */}
          <WorkoutBreakdown stats={safeBreakdown} isLoading={loading} />

          <UpgradeBanner />
        </div>

        {/* Stats Sidebar (Scrollable) */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8 bg-muted lg:border-l border-border lg:overflow-y-auto scrollbar-hide">
          <StatsSidebar />
        </div>
      </div>
    </div>
  );
}