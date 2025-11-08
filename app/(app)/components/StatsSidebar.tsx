// app/(app)/components/StatsSidebar.tsx
import { User, MoreHorizontal, Plus } from 'lucide-react';

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="absolute w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className="text-purple-600"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full">
        {/* Placeholder for user avatar image */}
        <User className="w-12 h-12 text-gray-400" />
      </div>
      <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
        {percentage}%
      </div>
    </div>
  );
};

const StatsSidebar = () => {
  // All data is hardcoded for now
  const user = {
    name: 'Raji',
    progress: 32,
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 h-full flex flex-col space-y-8">
      {/* Statistic Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Statistic</h2>
        <button className="text-gray-400 hover:text-gray-700">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Profile & Welcome */}
      <div className="flex flex-col items-center text-center">
        <CircularProgress percentage={user.progress} />
        <h3 className="mt-4 text-xl font-bold text-gray-800">Good Morning, {user.name}! 🔥</h3>
        <p className="mt-1 text-sm text-gray-500">Continue your journey to achieve your target!</p>
      </div>

      {/* Bar Chart Placeholder */}
      <div>
        <div className="bg-gray-100 rounded-lg p-4 h-40 flex items-center justify-center">
          <p className="text-gray-400">Bar Chart Placeholder</p>
        </div>
      </div>

      {/* Mentor/Friends List Placeholder */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Community</h2>
          <button className="text-gray-400 hover:text-gray-700">
            <Plus size={24} />
          </button>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
          <p className="text-gray-400">Friends List Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default StatsSidebar;
