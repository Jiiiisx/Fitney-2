'use client';

import { Trophy } from 'lucide-react';

const personalBests = [
  { emoji: '🏋️', text: 'Best Bench Press', value: '80kg (Oct 25)' },
  { emoji: '🏃', text: 'Fastest 5K', value: '25:30 (Oct 24)' },
  { emoji: '🔥', text: 'Longest Workout', value: '70 min (Oct 19)' },
];

export default function YourBests() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Your Bests
      </h3>
      <div className="space-y-3">
        {personalBests.map((best) => (
          <div key={best.text} className="flex items-center text-sm">
            <span className="mr-3 text-lg">{best.emoji}</span>
            <span className="text-gray-600 flex-grow">{best.text}</span>
            <span className="font-bold text-gray-800">{best.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
