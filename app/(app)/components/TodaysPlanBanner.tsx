// app/(app)/components/TodaysPlanBanner.tsx
import { ArrowRight, Zap } from "lucide-react";

const TodaysPlanBanner = () => {
  return (
    <div className="relative bg-slate-900 dark:bg-surface text-slate-50 rounded-2xl p-8 overflow-hidden">
      <div className="relative z-10">
        {/* New section for Day and Badges */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Friday Workout Plan
          </p>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded-md">
              Intermediate
            </span>
            <span className="text-xs font-bold bg-white/10 text-slate-200 px-2 py-1 rounded-md">
              45 min session
            </span>
          </div>
        </div>

        <h2 className="text-4xl font-bold mt-2">
          Today's Target: Chest & Triceps
        </h2>
        <p className="mt-4 max-w-md text-slate-300">
          Ready to build some power? Let's get started with today's planned
          workout.
        </p>
        <button className="mt-8 bg-white text-slate-900 font-bold px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors">
          <span>Start Workout</span>
          <ArrowRight size={20} />
        </button>
      </div>
      {/* Decorative background elements */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full z-0"></div>
      <div className="absolute top-0 right-20 w-20 h-20 bg-white/5 rounded-full z-0"></div>
    </div>
  );
};

export default TodaysPlanBanner;
