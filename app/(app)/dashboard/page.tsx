import StatsSidebar from "../components/StatsSidebar";
import TodaysPlanBanner from "../components/TodaysPlanBanner";
import DailyGoals from "../components/DailyGoals";
import RecentActivityList from "../components/RecentActivityList";
import UpgradeBanner from "../components/UpgradeBanner";
import GamificationStreak from "../components/GamificationStreak";
import ProgressCharts from "../components/ProgressCharts";
import WorkoutBreakdown from "../components/WorkoutBreakdown";
import { query } from "@/app/lib/db";

export default async function DashboardPage() {
  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        {/* Main Content Area (Scrollable) */}
        <div className="lg:col-span-2 space-y-8 overflow-y-auto p-8 scrollbar-hide">
          <TodaysPlanBanner />
          <GamificationStreak />
          <DailyGoals />
          <RecentActivityList />
          <ProgressCharts />
          <WorkoutBreakdown />
          <UpgradeBanner />
        </div>

        {/* Stats Sidebar (Scrollable) */}
        <div className="lg:col-span-1 space-y-8 overflow-y-auto p-8 bg-muted border-l border-border scrollbar-hide">
          <StatsSidebar />
        </div>
      </div>
    </div>
  );
}