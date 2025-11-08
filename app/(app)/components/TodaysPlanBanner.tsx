// app/(app)/components/TodaysPlanBanner.tsx
import { ArrowRight } from 'lucide-react';

const TodaysPlanBanner = () => {
  return (
    <div className="relative bg-gray-800 text-white rounded-2xl p-8 overflow-hidden">
      <div className="relative z-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Today's Focus
        </p>
        <h2 className="text-4xl font-bold mt-2">
          Upper Body Strength
        </h2>
        <p className="mt-4 max-w-md text-gray-300">
          Ready to build some power? Let's get started with today's planned workout.
        </p>
        <button className="mt-6 bg-white text-gray-800 font-bold px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors">
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
