'use client';

import { Plus, Utensils, GlassWater, Bed } from 'lucide-react';

const actions = [
  { label: 'Log Workout', icon: Plus, color: 'bg-blue-100', textColor: 'text-blue-600' },
  { label: 'Add Meal', icon: Utensils, color: 'bg-green-100', textColor: 'text-green-600' },
  { label: 'Add Water', icon: GlassWater, color: 'bg-sky-100', textColor: 'text-sky-600' },
  { label: 'Add Sleep', icon: Bed, color: 'bg-purple-100', textColor: 'text-purple-600' },
];

const ActionButton = ({ action }: { action: typeof actions[0] }) => (
  <button className="flex flex-col items-center justify-center space-y-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors w-full">
    <div className={`p-3 rounded-full ${action.color}`}>
      <action.icon className={`w-6 h-6 ${action.textColor}`} />
    </div>
    <span className="text-xs font-semibold text-gray-700">{action.label}</span>
  </button>
);

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action) => (
          <ActionButton key={action.label} action={action} />
        ))}
      </div>
    </div>
  );
}
