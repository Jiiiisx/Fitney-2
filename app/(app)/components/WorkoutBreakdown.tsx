"use client";

import { Dumbbell, Timer } from "lucide-react";

interface HeatmapItem {
  date: string;
  count: number;
}

interface WorkoutBreakdownProps {
  stats?: {
    mostFrequent: string;
    avgDuration: number;
    heatmap: HeatmapItem[];
  };
  isLoading?: boolean;
}

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center bg-card/60 border border-border p-4 rounded-xl">
    <div className="p-3 bg-primary/10 rounded-full">{icon}</div>
    <div className="ml-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const WorkoutHeatmap = ({ data }: { data: HeatmapItem[] }) => {
  const getColor = (count: number) => {
    if (count === 0) return "bg-muted"; 
    if (count === 1) return "bg-yellow-300 dark:bg-yellow-600/50";
    if (count === 2) return "bg-yellow-400 dark:bg-yellow-500/80";
    return "bg-yellow-500 dark:bg-yellow-400"; 
  };

  return (
    <div className="bg-card/60 border border-border p-4 rounded-xl">
      <h3 className="font-semibold text-foreground mb-3 text-sm">
        Activity Heatmap (Last 50 Days)
      </h3>
      <div className="grid grid-cols-10 gap-1.5">
        {data.map(({ date, count }) => (
          <div key={date} className="relative group">
            <div className={`w-full aspect-square rounded-sm ${getColor(count)} cursor-default`} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border z-10">
              {count} workouts on {new Date(date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-3">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-yellow-300 dark:bg-yellow-600/50" />
          <div className="w-3 h-3 rounded-sm bg-yellow-400 dark:bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-sm bg-yellow-500 dark:bg-yellow-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default function WorkoutBreakdown({ stats, isLoading }: WorkoutBreakdownProps) {
  if (isLoading) {
    return (
        <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border-none shadow-sm rounded-2xl p-6 animate-pulse">
            <div className="h-6 w-1/3 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="h-20 bg-muted rounded-xl"></div>
                    <div className="h-20 bg-muted rounded-xl"></div>
                </div>
                <div className="h-40 bg-muted rounded-xl"></div>
            </div>
        </div>
    )
  }

  const mostFrequent = stats?.mostFrequent || "No Data";
  const avgDuration = stats?.avgDuration || 0;
  // Fill default empty heatmap if no data provided
  const heatmapData = stats?.heatmap && stats.heatmap.length > 0 
      ? stats.heatmap 
      : Array.from({ length: 50 }).map((_, i) => ({ date: new Date().toISOString(), count: 0 }));

  return (
    <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border-none shadow-sm rounded-2xl p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">
        Workout Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Stats */}
        <div className="space-y-4">
          <StatCard
            icon={<Dumbbell className="w-5 h-5 text-primary" />}
            label="Most Frequent Activity"
            value={mostFrequent}
          />
          <StatCard
            icon={<Timer className="w-5 h-5 text-primary" />}
            label="Average Session Duration"
            value={`${avgDuration} Minutes`}
          />
        </div>

        {/* Right Column: Heatmap */}
        <div>
          <WorkoutHeatmap data={heatmapData} />
        </div>
      </div>
    </div>
  );
}
