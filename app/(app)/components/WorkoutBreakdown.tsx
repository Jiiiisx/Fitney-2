"use client";

import { Dumbbell, Timer, Calendar } from "lucide-react";
import { Tooltip as RechartsTooltip, TooltipProps } from "recharts";
import { useState, useEffect } from "react";

// --- Helper Functions & Data ---

// --- Components ---

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center bg-card p-4 rounded-lg">
    <div className="p-3 bg-primary/10 rounded-full">{icon}</div>
    <div className="ml-4">
      <p className="text-sm text-secondary-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const WorkoutHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState<Array<{date: string, count: number}>>([]);

  useEffect(() => {
    // Generate placeholder data for the last 50 days
    const generateHeatmapData = () => {
      const today = new Date();
      const data = [];
      for (let i = 49; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
          date: date.toISOString().split("T")[0],
          count: Math.floor(Math.random() * 4), // 0 to 3 workouts
        });
      }
      return data;
    };
    setHeatmapData(generateHeatmapData());
  }, []); // Empty dependency array ensures this runs only once on the client

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-200";
    if (count === 1) return "bg-yellow-200";
    if (count === 2) return "bg-yellow-400";
    return "bg-yellow-600";
  };

  // Render a placeholder or nothing if data is not yet available
  if (heatmapData.length === 0) {
    // You can return a loading spinner or a skeleton loader here
    return (
        <div className="bg-gray-50 p-4 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: 50 }).map((_, index) => (
                    <div key={index} className="w-full h-4 rounded-sm bg-gray-200" />
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg">
      <h3 className="font-semibold text-foreground mb-3">
        Favorite Workout Days
      </h3>
      <div className="grid grid-cols-10 gap-1.5">
        {heatmapData.map(({ date, count }) => (
          <div key={date} className="relative group">
            <div className={`w-full h-4 rounded-sm ${getColor(count)}`} />
            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {count} workouts on {new Date(date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-foreground mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200" />
          <div className="w-3 h-3 rounded-sm bg-yellow-200" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400" />
          <div className="w-3 h-3 rounded-sm bg-yellow-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default function WorkoutBreakdown() {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-4">
        Workout Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Stats */}
        <div className="space-y-4">
          <StatCard
            icon={<Dumbbell className="w-6 h-6 text-primary" />}
            label="Most Frequent Activity"
            value="Strength Training"
          />
          <StatCard
            icon={<Timer className="w-6 h-6 text-primary" />}
            label="Average Session Duration"
            value="55 Minutes"
          />
        </div>

        {/* Right Column: Heatmap */}
        <div>
          <WorkoutHeatmap />
        </div>
      </div>
    </div>
  );
}
