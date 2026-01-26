import React from "react";
import { Flame } from "lucide-react";

interface GamificationStreakProps {
  streak?: number;
  isLoading?: boolean;
}

const GamificationStreak = ({ streak = 0, isLoading = false}: GamificationStreakProps) => {
  if(isLoading) {
    return (
      <div className="w-full bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 flex items-center gap-3 animate-pulse">
        <div className="h-6 w-6 bg-orange-200 rounded-full"></div>
        <div className="h-4 w-1/2 bg-orange-200 rounded"></div>
      </div>
    );
  }

  let message = "Start your streak today";
  if (streak > 0) message = `You've maintaned a ${streak}-day workout streak! Keep it up.`;
  if (streak >= 7) message = `Wow ${streak} days in a row. You're unstoppable!`;

  return (
    <div className="w-full bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900 rounded-xl p-4 flex items-center justify-center gap-3 shadow-sm">
      <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-400"}`}/>
      <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
        {message}
      </span>
    </div>
  );
};

export default GamificationStreak;