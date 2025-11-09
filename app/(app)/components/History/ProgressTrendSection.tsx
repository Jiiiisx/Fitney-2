'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronUp, TrendingUp } from 'lucide-react';

const weightData = [
  { date: 'Oct 1', weight: 80 },
  { date: 'Oct 8', weight: 82 },
  { date: 'Oct 15', weight: 85 },
  { date: 'Oct 22', weight: 84 },
  { date: 'Oct 29', weight: 88 },
];

const calorieData = [
  { date: 'Oct 1', calories: 450 },
  { date: 'Oct 8', calories: 500 },
  { date: 'Oct 15', calories: 480 },
  { date: 'Oct 22', calories: 550 },
  { date: 'Oct 29', calories: 580 },
];

const durationData = [
  { date: 'Oct 1', duration: 55 },
  { date: 'Oct 8', duration: 60 },
  { date: 'Oct 15', duration: 62 },
  { date: 'Oct 22', duration: 65 },
  { date: 'Oct 29', duration: 63 },
];

const MiniTrendChart = ({ data, dataKey, stroke, name }: { data: any[], dataKey: string, stroke: string, name: string }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <h4 className="font-semibold text-gray-600 mb-2 text-sm">{name}</h4>
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default function ProgressTrendSection() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <button 
        className="w-full flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-gray-800" />
          <h2 className="text-xl font-bold text-gray-800">Your Progress Trends</h2>
        </div>
        <ChevronUp className={`w-6 h-6 text-gray-500 transition-transform ${!isOpen && 'rotate-180'}`} />
      </button>
      
      {isOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <MiniTrendChart data={weightData} dataKey="weight" stroke="#8884d8" name="Weight Lifted (kg)" />
          <MiniTrendChart data={calorieData} dataKey="calories" stroke="#82ca9d" name="Calories Burned" />
          <MiniTrendChart data={durationData} dataKey="duration" stroke="#ffc658" name="Avg. Duration (min)" />
        </div>
      )}
    </div>
  );
}
