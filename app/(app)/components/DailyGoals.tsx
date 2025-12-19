"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "./CircularProgress";
import { Footprints, Flame, Timer, Droplets } from "lucide-react";

interface DailyGoalsProps {
  stats?: {
    duration: number;
    calories: number;
    workouts: number;
  };
}

export default function DailyGoals({ stats }: DailyGoalsProps) {
  // Defaults if no data
  const calories = stats?.calories || 0;
  const duration = stats?.duration || 0;
  
  // Hardcoded targets for now (Fase 4 will make these dynamic)
  const targetCalories = 500; 
  const targetDuration = 60; 

  const calPercentage = Math.min(100, (calories / targetCalories) * 100);
  const durPercentage = Math.min(100, (duration / targetDuration) * 100);

  const items = [
    {
      label: "Calories",
      value: `${calories}`,
      target: `/ ${targetCalories} kcal`,
      percentage: calPercentage,
      icon: Flame,
      color: "#f97316", // orange-500
    },
    {
      label: "Duration",
      value: `${duration}`,
      target: `/ ${targetDuration} min`,
      percentage: durPercentage,
      icon: Timer,
      color: "#3b82f6", // blue-500
    },
    {
      label: "Steps",
      value: "2,400",
      target: "/ 10,000",
      percentage: 24,
      icon: Footprints,
      color: "#10b981", // emerald-500
    },
    {
      label: "Water",
      value: "1.2",
      target: "/ 2.5 L",
      percentage: 48,
      icon: Droplets,
      color: "#06b6d4", // cyan-500
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card key={index} className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative">
              <CircularProgress
                size={70}
                strokeWidth={6}
                percentage={item.percentage}
                color={item.color}
              />
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <item.icon size={20} style={{ color: item.color }} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{item.target}</p>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}