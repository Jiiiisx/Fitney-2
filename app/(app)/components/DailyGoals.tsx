// app/(app)/components/DailyGoals.tsx
import { Flame, GlassWater, Timer } from 'lucide-react';

const goals = [
  {
    icon: <Flame className="w-6 h-6 text-red-500" />,
    title: 'Calories',
    current: 1250,
    target: 2500,
    unit: 'kcal',
    color: 'bg-red-500',
  },
  {
    icon: <GlassWater className="w-6 h-6 text-sky-500" />,
    title: 'Water Intake',
    current: 4,
    target: 8,
    unit: 'glasses',
    color: 'bg-sky-500',
  },
  {
    icon: <Timer className="w-6 h-6 text-green-500" />,
    title: 'Active Time',
    current: 45,
    target: 60,
    unit: 'min',
    color: 'bg-green-500',
  },
];

const DailyGoalCard = ({ goal }: { goal: (typeof goals)[0] }) => {
  const progressPercentage = (goal.current / goal.target) * 100;

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {goal.icon}
          <h3 className="font-bold text-gray-800">{goal.title}</h3>
        </div>
        <p className="text-sm font-semibold text-gray-700">
          <span className="font-bold">{goal.current}</span> / {goal.target} {goal.unit}
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
        <div
          className={`${goal.color} h-2.5 rounded-full`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const DailyGoals = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <DailyGoalCard key={goal.title} goal={goal} />
      ))}
    </div>
  );
};

export default DailyGoals;
