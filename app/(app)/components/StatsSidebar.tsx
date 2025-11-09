// app/(app)/components/StatsSidebar.tsx
import { User, MoreHorizontal, Plus } from 'lucide-react';
import QuickActions from './QuickActions';
import InsightSection from './InsightSection';

const communityActivities = [
  { name: 'Jane Doe', action: 'completed a 45 min workout', time: '2h ago', emoji: '💥' },
  { name: 'John Smith', action: 'reached a 10-day streak', time: '8h ago', emoji: '🔥' },
  { name: 'Peter Jones', action: 'logged a new personal record', time: 'Yesterday', emoji: '🏆' },
  { name: 'Emily K.', action: 'just finished a yoga session', time: 'Yesterday', emoji: '🧘‍♀️' },
  { name: 'Michael B.', action: 'crushed a 5k run', time: '2 days ago', emoji: '🏃‍♂️' },
];

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
          className="text-gray-800"
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
        <User className="w-12 h-12 text-gray-400" />
      </div>
      <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
        {percentage}%
      </div>
    </div>
  );
};

const StatsSidebar = () => {
  const user = {
    name: 'Raji',
    progress: 32,
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 h-full flex flex-col space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Statistic</h2>
        <button className="text-gray-400 hover:text-gray-700">
          <MoreHorizontal size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center text-center">
        <CircularProgress percentage={user.progress} />
        <h3 className="mt-4 text-xl font-bold text-gray-800">Good Morning, {user.name}! 🔥</h3>
        <p className="mt-1 text-sm text-gray-500">Continue your journey to achieve your target!</p>
      </div>

      <div className="text-center bg-gray-100 border border-gray-200/80 rounded-lg p-3">
        <p className="text-sm text-gray-800">
          <span className="font-bold">Good job!</span> Your workout consistency is up by <span className="font-bold">15%</span> from last week.
        </p>
      </div>

      <QuickActions />

      {/* Community Feed fills remaining space */}
      <div className="flex flex-col flex-grow min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Community Feed</h2>
          <button className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200">
            <Plus size={20} />
          </button>
        </div>
        <div className="space-y-4 flex-grow overflow-y-auto pr-2">
          {communityActivities.map((activity) => (
            <div key={activity.name} className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-800">
                  <span className="font-bold">{activity.name}</span> {activity.action} {activity.emoji}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full text-center text-sm font-bold text-gray-800 mt-4 pt-4 border-t border-gray-200 hover:underline">
          See All
        </button>
      </div>
      
      <InsightSection />
    </div>
  );
};

export default StatsSidebar;
