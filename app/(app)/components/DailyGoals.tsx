"use client";

import { Card, CardContent } from "@/components/ui/card";
import CircularProgress from "./CircularProgress";
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
  
  // Hardcoded targets for now
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
      color: "text-orange-500", // Tailwind class
      stroke: "#f97316"
    },
    {
      label: "Duration",
      value: `${duration}`,
      target: `/ ${targetDuration} min`,
      percentage: durPercentage,
      icon: Timer,
      color: "text-blue-500",
      stroke: "#3b82f6"
    },
    {
      label: "Steps",
      value: "2,400",
      target: "/ 10,000",
      percentage: 24,
      icon: Footprints,
      color: "text-emerald-500",
      stroke: "#10b981"
    },
    {
      label: "Water",
      value: "1.2",
      target: "/ 2.5 L",
      percentage: 48,
      icon: Droplets,
      color: "text-cyan-500",
      stroke: "#06b6d4"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card key={index} className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative">
              <CircularProgress
                size={80} // Sedikit lebih besar
                strokeWidth={8}
                percentage={item.percentage}
                color={item.stroke}
              />
              <div className={`absolute inset-0 flex items-center justify-center ${item.color}`}>
                <item.icon size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground leading-none">{item.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{item.target}</p>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
