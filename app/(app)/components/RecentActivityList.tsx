// app/(app)/components/RecentActivityList.tsx
import { query } from '@/app/lib/db';
import { Dumbbell, Zap, Heart, Award } from 'lucide-react';
import React from 'react';

type RecentWorkout = {
  log_id: number;
  exercise_name: string;
  details: string;
  created_at: Date;
  type: 'strength' | 'cardio' | 'flexibility'; // Add workout type
  is_pr: boolean; // Add personal record flag
};

// This function would need to be updated in a real scenario to fetch the new 'type' and 'is_pr' fields.
async function getRecentWorkouts(userId: number, limit: number = 3): Promise<RecentWorkout[]> {
  // For now, we return a richer hardcoded list to demonstrate the UI.
  return [
    { log_id: 1, exercise_name: 'Bench Press', details: '3 sets x 5 reps @ 80 kg', created_at: new Date(), type: 'strength', is_pr: true },
    { log_id: 2, exercise_name: 'Treadmill Run', details: '5 km in 25 min', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'cardio', is_pr: false },
    { log_id: 3, exercise_name: 'Yoga Flow', details: '30 min session', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000), type: 'flexibility', is_pr: false },
  ];
}

const workoutIcons = {
  strength: <Dumbbell className="w-5 h-5 text-white" />,
  cardio: <Zap className="w-5 h-5 text-white" />,
  flexibility: <Heart className="w-5 h-5 text-white" />,
};

const workoutColors = {
  strength: 'bg-blue-500',
  cardio: 'bg-yellow-500',
  flexibility: 'bg-pink-500',
};

const ActivityCard = ({ workout }: { workout: RecentWorkout }) => (
  <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4 flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${workoutColors[workout.type]}`}>
          {workoutIcons[workout.type]}
        </div>
        {workout.is_pr && (
          <div className="flex items-center text-xs font-bold bg-amber-400 text-amber-900 px-2 py-1 rounded-full">
            <Award className="w-4 h-4 mr-1" />
            New PR!
          </div>
        )}
      </div>
      <h4 className="font-bold text-gray-800">{workout.exercise_name}</h4>
      <p className="text-sm text-gray-600">{workout.details}</p>
    </div>
    <p className="text-xs text-gray-400 mt-3 text-right">
      {workout.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </p>
  </div>
);

export default async function RecentActivityList() {
  const userId = 1; // Hardcoded user ID
  const recentWorkouts = await getRecentWorkouts(userId);

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Entries</h2>
      {recentWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentWorkouts.map((workout) => (
            <ActivityCard key={workout.log_id} workout={workout} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-4">No recent activities found.</p>
      )}
    </div>
  );
}