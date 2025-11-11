import PlannerSidebar from "./components/PlannerSidebar";
import CalendarGrid from "./components/CalendarGrid";
import UpcomingWorkout from "./components/UpcomingWorkout";
import WeeklySummary from "./components/WeeklySummary";
import GoalTracker from "./components/GoalTracker";
import Recommendations from "./components/Recommendations";

export default function PlannerPage() {
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Workout Planner
        </h1>
        <p className="text-base text-gray-500 mt-1">
          Plan your week, stay consistent, and crush your goals.
        </p>
      </header>

      {/* Main Planner Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <PlannerSidebar />
          </aside>
          <main className="lg:col-span-3">
            <CalendarGrid />
          </main>
        </div>
        <footer className="mt-8">
          <UpcomingWorkout />
        </footer>
      </div>

      {/* Bottom Sections */}
      <div className="mt-8">
        <WeeklySummary />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-8">
        <GoalTracker />
        <Recommendations />
      </div>
    </div>
  );
}