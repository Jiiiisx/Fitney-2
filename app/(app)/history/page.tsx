import HistoryFilterControls from "../components/History/HistoryFilterControls";
import HistoryWorkoutLog from "../components/History/HistoryWorkoutLog";
import PerformanceSummary from "../components/History/PerformanceSummary";
import YourBests from "../components/History/YourBests";
import Achievements from "../components/History/Achievements";
import InsightSection from "../components/InsightSection";
import ProgressTrendSection from "../components/History/ProgressTrendSection";

export default function HistoryPage() {
  return (
    <div className="h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        {/* Main Diary Content (Scrollable) */}
        <div className="lg:col-span-2 space-y-8 overflow-y-auto p-8 scrollbar-hide">
          <h1 className="text-3xl font-bold text-gray-800">Workout Diary</h1>
          <HistoryFilterControls />
          <HistoryWorkoutLog />
        </div>

        {/* Right Sidebar (Scrollable) */}
        <div className="lg:col-span-1 space-y-8 overflow-y-auto p-8 bg-white/50 border-l border-gray-200/80 scrollbar-hide">
          <PerformanceSummary />
          <ProgressTrendSection />
          <YourBests />
          <Achievements />
          <InsightSection />
        </div>
      </div>
    </div>
  );
}
