import PersonalGoals from "./components/PersonalGoals";
import LongTermGoals from "./components/LongTermGoals";
import GoalTimeline from "./components/GoalTimeline";
import { CheckCircle } from "lucide-react";

export default function GoalsPage() {
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Your Goals
        </h1>
        <div className="mt-2 flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            <p className="text-lg font-semibold">
                You’ve hit 72% of your monthly target! 🚀
            </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="space-y-12">
        <PersonalGoals />
        <LongTermGoals />
        <GoalTimeline />
      </div>
    </div>
  );
}