import StatsSidebar from "../components/StatsSidebar";
import TodaysPlanBanner from "../components/TodaysPlanBanner";
import DailyGoals from "../components/DailyGoals";
import RecentActivityList from "../components/RecentActivityList";
import UpgradeBanner from "../components/UpgradeBanner";
import GamificationStreak from "../components/GamificationStreak";
import ProgressCharts from "../components/ProgressCharts";
import WorkoutBreakdown from "../components/WorkoutBreakdown";
import { query } from "@/app/lib/db";

// --- Page Component ---
export default async function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content Area (Left) - 2/3 width */}
      <div className="lg:col-span-2 space-y-8">
        <TodaysPlanBanner />
        <GamificationStreak />
        <DailyGoals />
        <RecentActivityList />
        <ProgressCharts />
        <WorkoutBreakdown />
        <UpgradeBanner />
      </div>

      {/* Stats Sidebar (Right) - 1/3 width */}
      <div className="lg:col-span-1 h-fit sticky top-8">
        <StatsSidebar />
      </div>
    </div>
  );
}
