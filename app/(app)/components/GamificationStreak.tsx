// app/(app)/components/GamificationStreak.tsx
import { Flame } from 'lucide-react';

const GamificationStreak = () => {
  return (
    <div className="bg-orange-100/80 border border-orange-200/80 rounded-2xl p-4 text-center">
      <p className="font-semibold text-orange-800 flex items-center justify-center">
        <Flame className="w-5 h-5 mr-2" />
        You've maintained a 5-day workout streak! Keep it up.
      </p>
    </div>
  );
};

export default GamificationStreak;
