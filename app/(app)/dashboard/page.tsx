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
// Pastikan toast di-import jika digunakan, atau hapus jika tidak
import toast from "react-hot-toast"; 

// Interface yang lebih fleksibel agar cocok dengan respons API dan props komponen
interface DashboardData {
  today: {
    duration: number;
    calories: number;
    workouts: number;
  };
  weekly: { name: string; value: number }[]; // Spesifikasikan bentuk array weekly
  recent: any[];
  streak: number;
  breakdown: {
    mostFrequent: string;
    avgDuration: number;
    heatmap: { date: string; count: number }[];
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Tambahkan handling jika token tidak ada
        if (!token) {
            console.log("No token found");
            setLoading(false);
            return;
        }

        const res = await fetch("/api/stats/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
            console.error("API Error:", res.status);
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
  const safeWeekly = data?.weekly || [];
  const safeRecent = data?.recent || [];
  const safeStreak = data?.streak || 0;
  // Menyiapkan data breakdown dengan default value
  const safeBreakdown = data?.breakdown || { mostFrequent: "N/A", avgDuration: 0, heatmap: [] };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        {/* Main Content Area (Scrollable) */}
        <div className="lg:col-span-2 space-y-8 overflow-y-auto p-8 scrollbar-hide">
          <CompleteProfileBanner/>

          <TodaysPlanBanner stats={safeStats} isLoading={loading} />
          
          <GamificationStreak streak={safeStreak} isLoading={loading}/>
          
          <DailyGoals stats={safeStats} />
          
          <RecentActivityList workouts={safeRecent} isLoading={loading} />
          
          <ProgressCharts weeklyData={safeWeekly} isLoading={loading} />
          
          {/* Mengirimkan data breakdown ke komponen */}
          <WorkoutBreakdown stats={safeBreakdown} isLoading={loading} />
          
          <UpgradeBanner/>
        </div>

        {/* Stats Sidebar (Scrollable) */}
        <div className="lg:col-span-1 space-y-8 overflow-y-auto p-8 bg-muted border-l border-border scrollbar-hide">
          <StatsSidebar />
        </div>
      </div>
    </div>
  );
}