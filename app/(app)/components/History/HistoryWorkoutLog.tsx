'use client';

import { Book, Dumbbell, Flame, MessageSquare } from 'lucide-react';

const diaryEntries = [
  {
    date: 'Monday, October 27, 2025',
    title: 'Chest & Triceps Power Day',
    exercises: [
      { name: 'Bench Press', details: '3 sets x 5 reps @ 80kg' },
      { name: 'Incline Dumbbell Press', details: '3 sets x 8 reps @ 30kg' },
      { name: 'Dips', details: '3 sets x 12 reps (bodyweight)' },
      { name: 'Tricep Pushdown', details: '3 sets x 15 reps @ 25kg' },
    ],
    note: 'Felt really strong on the bench press today! Finally hit 80kg for reps. Dips were a struggle at the end.',
  },
  {
    date: 'Saturday, October 25, 2025',
    title: 'Morning 5K Run',
    exercises: [
      { name: 'Running', details: '5.02 km distance' },
      { name: 'Pace', details: 'Avg. 5:58 /km' },
      { name: 'Time', details: '30:01 total' },
    ],
    note: 'A bit slower than last time, but the weather was perfect. Focused on keeping a steady heart rate.',
  },
  {
    date: 'Friday, October 24, 2025',
    title: 'Active Recovery & Yoga',
    exercises: [
      { name: 'Vinyasa Yoga', details: '45 min session' },
      { name: 'Stretching', details: '15 min deep stretch' },
    ],
    note: 'Needed this after a tough week. Feeling much more flexible and less sore.',
  },
];

const DiaryEntry = ({ entry }: { entry: typeof diaryEntries[0] }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm">
    {/* Header */}
    <div className="border-b border-gray-200 pb-4 mb-4">
      <p className="text-sm font-semibold text-yellow-600">{entry.date}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{entry.title}</h3>
    </div>

    {/* Exercises */}
    <div className="mb-4">
      <h4 className="text-md font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Dumbbell className="w-5 h-5" />
        Exercises
      </h4>
      <ul className="space-y-2">
        {entry.exercises.map((ex) => (
          <li key={ex.name} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-lg">
            <span className="font-medium text-gray-700">{ex.name}</span>
            <span className="font-mono text-gray-500">{ex.details}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Note */}
    {entry.note && (
      <div>
        <h4 className="text-md font-bold text-gray-700 mb-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          My Notes
        </h4>
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic">
          "{entry.note}"
        </p>
      </div>
    )}
  </div>
);


export default function HistoryWorkoutLog() {
  return (
    <div className="space-y-8">
      {diaryEntries.map((entry) => (
        <DiaryEntry key={entry.date} entry={entry} />
      ))}
    </div>
  );
}
