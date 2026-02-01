"use client";

import { Card, CardContent } from "@/components/ui/card";
import CircularProgress from "../../components/CircularProgress";
import { Footprints, Flame, Timer, Droplets } from "lucide-react";

interface DailyGoalsProps {
  stats?: {
    duration: number;
    calories: number;
    workouts: number;
    water?: number;
    steps?: number;
  };
  targets?: {
    calories: number;
    water: number;
    duration: number;
    steps: number;
  };
}

export default function DailyGoals({ stats, targets }: DailyGoalsProps) {
  // Defaults if no data
  const calories = stats?.calories || 0;
  const duration = stats?.duration || 0;
  const waterMl = stats?.water || 0;
  const steps = stats?.steps !== undefined ? stats.steps : (calories > 0 ? calories * 12 : 0); 
  
  // Use provided targets or fallbacks
  const targetCalories = targets?.calories || 2000; 
  const targetDuration = targets?.duration || 45; 
  const targetSteps = targets?.steps || 10000;
  const targetWaterMl = targets?.water || 2500;

  const calPercentage = Math.min(100, (calories / targetCalories) * 100);
  const durPercentage = Math.min(100, (duration / targetDuration) * 100);
  const stepsPercentage = Math.min(100, (steps / targetSteps) * 100);
  
  // For water, we show in Liters for better UI but compare in Ml
  const waterL = parseFloat((waterMl / 1000).toFixed(1));
  const targetWaterL = parseFloat((targetWaterMl / 1000).toFixed(1));
  const waterPercentage = Math.min(100, (waterMl / targetWaterMl) * 100);

  const items = [
    {
      label: "Calories",
      value: `${calories}`,
      target: `/ ${targetCalories} kcal`,
      percentage: calPercentage,
      icon: Flame,
      color: "text-orange-500",
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
      value: steps.toLocaleString(),
      target: `/ ${targetSteps.toLocaleString()}`,
      percentage: stepsPercentage,
      icon: Footprints,
      color: "text-emerald-500",
      stroke: "#10b981"
    },
    {
      label: "Water",
      value: `${waterL}`,
      target: `/ ${targetWaterL} L`,
      percentage: waterPercentage,
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
                size={80} // Slightly larger
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