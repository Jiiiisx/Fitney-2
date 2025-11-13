import PersonalGoals from "./components/PersonalGoals";
import LongTermGoals from "./components/LongTermGoals";
import GoalTimeline from "./components/GoalTimeline";

export default function GoalsPage() {
  return (
    <div className="h-full">
      {/* Main Content Area (Scrollable) */}
      <div className="space-y-8 overflow-y-auto p-8 scrollbar-hide">
        <h1 className="text-4xl font-bold tracking-tight">Your Goals</h1>
        <PersonalGoals />
        <LongTermGoals />
        <GoalTimeline />
      </div>
    </div>
  );
}