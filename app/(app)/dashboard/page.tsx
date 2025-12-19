"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import StatsSidebar from "../components/StatsSidebar";
import TodaysPlanBanner from "../components/TodaysPlanBanner";
import DailyGoals from "../components/DailyGoals";
import RecentActivityList from "../components/RecentActivityList";
import UpgradeBanner from "../components/UpgradeBanner";
import GamificationStreak from "../components/GamificationStreak";
import ProgressCharts from "../components/ProgressCharts";
import WorkoutBreakdown from "../components/WorkoutBreakdown";
import CompleteProfileBanner from "../components/CompleteProfileBanner";
import toast from "react-hot-toast";

interface DashboardData {
  today: {
    duration: number;
    calories: number;
    workouts: number;
  };
  weekly: any[];
  recent: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/stats/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        {/* Main Content Area (Scrollable) */}
        <div className="lg:col-span-2 space-y-8 overflow-y-auto p-8 scrollbar-hide">
          <CompleteProfileBanner/>

          <TodaysPlanBanner stats={data?.today} isLoading={loading} />
          <GamificationStreak/>
          <DailyGoals stats={data?.today} />
          
          <RecentActivityList workouts={data?.recent} isLoading={loading} />
          
          <ProgressCharts weeklyData={data?.weekly} isLoading={loading} />
          
          <WorkoutBreakdown/>
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
