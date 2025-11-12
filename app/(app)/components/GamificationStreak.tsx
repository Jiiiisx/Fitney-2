// app/(app)/components/GamificationStreak.tsx
import { Flame } from "lucide-react";

const GamificationStreak = () => {
  return (
    <div className="bg-amber-100/80 dark:bg-card border border-amber-200/80 dark:border-border rounded-2xl p-4 text-center">
      <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-center">
        <Flame className="w-5 h-5 mr-2" />
        You've maintained a 5-day workout streak! Keep it up.
      </p>
    </div>
  );
};

export default GamificationStreak;
