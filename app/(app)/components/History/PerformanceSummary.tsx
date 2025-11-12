"use client";

import { Clock, Flame, Zap } from "lucide-react";

const stats = [
  { name: "Total Workouts", value: "76", icon: Zap },
  { name: "Total Active Time", value: "8h 45m", icon: Clock },
  { name: "Calories Burned", value: "12,340 kcal", icon: Flame },
];

export default function PerformanceSummary() {
  return (
    <div className="bg-card p-6 rounded-2xl">
      <h2 className="text-xl font-bold text-foreground mb-4">
        Performance Summary
      </h2>
      <div className="space-y-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex items-center bg-background p-4 rounded-lg"
          >
            <div className="bg-primary/10 p-2 rounded-full">
              <stat.icon className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-secondary-foreground">{stat.name}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
