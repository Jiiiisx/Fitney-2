// app/(app)/components/RecentActivities.tsx
import { Dumbbell, Zap, Heart } from 'lucide-react';
import React from 'react';

const activities = [
  {
    icon: <Dumbbell className="w-5 h-5 text-white" />,
    bgColor: 'bg-blue-500',
    title: 'Bench Press',
    details: '3 sets x 10 reps',
    time: '10 min ago',
  },
  {
    icon: <Zap className="w-5 h-5 text-white" />,
    bgColor: 'bg-yellow-500',
    title: 'HIIT Cardio',
    details: '20 min session',
    time: '1 hour ago',
  },
  {
    icon: <Heart className="w-5 h-5 text-white" />,
    bgColor: 'bg-red-500',
    title: 'LISS Jogging',
    details: '5 km',
    time: '3 hours ago',
  },
  {
    icon: <Dumbbell className="w-5 h-5 text-white" />,
    bgColor: 'bg-indigo-500',
    title: 'Deadlift',
    details: '5 sets x 5 reps',
    time: 'Yesterday',
  },
  {
    icon: <Dumbbell className="w-5 h-5 text-white" />,
    bgColor: 'bg-green-500',
    title: 'Squats',
    details: '4 sets x 8 reps',
    time: 'Yesterday',
  },
];

const ActivityCard = ({ activity }: { activity: (typeof activities)[0] }) => (
  <div className="flex-shrink-0 w-64 bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-4">
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-lg ${activity.bgColor}`}>
        {activity.icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-800">{activity.title}</h4>
        <p className="text-sm text-gray-500">{activity.details}</p>
      </div>
    </div>
    <p className="text-xs text-gray-400 mt-3 text-right">{activity.time}</p>
  </div>
);

const RecentActivities = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activities</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4">
        {activities.map((activity, index) => (
          <ActivityCard key={index} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
