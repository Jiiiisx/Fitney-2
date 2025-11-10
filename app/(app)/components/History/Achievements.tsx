"use client";

import { Award, Star, TrendingUp, Flame } from "lucide-react";

const achievements = [
  {
    name: "7-Day Streak",
    progress: 100,
    description: "Completed a workout 7 days in a row!",
    icon: Award,
    unlocked: true,
    recent: true,
  },
  {
    name: "10k Calories",
    progress: 80,
    description: "Burn a total of 10,000 calories.",
    icon: Flame,
    unlocked: false,
  },
  {
    name: "Marathoner",
    progress: 25,
    description: "Run a total of 42km.",
    icon: Star,
    unlocked: false,
  },
  {
    name: "Century Club",
    progress: 100,
    description: "Complete 100 workouts.",
    icon: TrendingUp,
    unlocked: true,
    recent: false,
  },
];

const CircularProgressMini = ({ percentage }: { percentage: number }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <svg className="absolute w-full h-full" viewBox="0 0 40 40">
        <circle
          className="text-gray-200"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
        <circle
          className="text-yellow-500"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span className="absolute text-xs font-bold">{percentage}%</span>
    </div>
  );
};

const AchievementItem = ({ item }: { item: (typeof achievements)[0] }) => (
  <div className="relative group flex flex-col items-center text-center">
    {item.unlocked ? (
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${item.recent ? "bg-yellow-400" : "bg-gray-200"}`}
      >
        <item.icon
          className={`w-6 h-6 ${item.recent ? "text-white" : "text-gray-500"}`}
        />
      </div>
    ) : (
      <CircularProgressMini percentage={item.progress} />
    )}
    <p className="text-sm mt-2 font-semibold text-gray-600">{item.name}</p>
    <div className="absolute bottom-full mb-2 w-48 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {item.description}
      {!item.unlocked && <span className="font-bold"> ({item.progress}%)</span>}
    </div>
  </div>
);

export default function Achievements() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Achievements</h3>
      <div className="grid grid-cols-4 gap-4">
        {achievements.map((item) => (
          <AchievementItem key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}
