import PlannerSidebar from "./components/PlannerSidebar";
import CalendarGrid from "./components/CalendarGrid";
import UpcomingWorkout from "./components/UpcomingWorkout";
import WeeklySummary from "./components/WeeklySummary";
import GoalTracker from "./components/GoalTracker";
import Recommendations from "./components/Recommendations";

export default function PlannerPage() {
  return (
    <div className="bg-[#F9F7F3] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-yellow-50 text-gray-900 rounded-2xl p-6 sm:p-8">
        <header className="mb-8 border-l-4 border-yellow-400 pl-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Workout Planner
          </h1>
          <p className="text-gray-600 mt-1">
            Plan your week, stay consistent, and crush your goals.
          </p>
        </header>

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

        <div className="mt-8">
          <WeeklySummary />
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <div>
            <GoalTracker />
          </div>
          <div>
            <Recommendations />
          </div>
        </div>
      </div>
    </div>
  );
}
