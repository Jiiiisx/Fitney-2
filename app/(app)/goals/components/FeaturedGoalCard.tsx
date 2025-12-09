"use client";

import { Flame, Droplet, Dumbbell, Zap, Footprints, Weight, Wind, Trophy, CheckCircle, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn progress
import type { Goal } from "../page";

const getMetricDetails = (metric: string) => {
  switch (metric) {
    case "workout_frequency": return { icon: Dumbbell, color: "text-orange-400", bgColor: "bg-orange-400" };
    case "calories_burned": return { icon: Flame, color: "text-red-400", bgColor: "bg-red-400" };
    case "active_minutes": return { icon: Zap, color: "text-yellow-400", bgColor: "bg-yellow-400" };
    case "hydration": return { icon: Droplet, color: "text-blue-400", bgColor: "bg-blue-400" };
    case "distance_run": return { icon: Footprints, color: "text-sky-400", bgColor: "bg-sky-400" };
    case "weight_lifted": return { icon: Weight, color: "text-amber-400", bgColor: "bg-amber-400" };
    case "yoga_sessions": return { icon: Wind, color: "text-teal-400", bgColor: "bg-teal-400" };
    default: return { icon: Trophy, color: "text-gray-400", bgColor: "bg-gray-400" };
  }
};

interface FeaturedGoalCardProps {
  goal: Goal;
}

export function FeaturedGoalCard({ goal }: FeaturedGoalCardProps) {
  if (!goal) return null;

  const details = getMetricDetails(goal.metric);
  const Icon = details.icon;
  const progressPercentage = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0;

  return (
    <Card className="w-full bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 shadow-lg rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-primary">Featured Goal</CardTitle>
        <Icon className={`w-6 h-6 ${details.color}`} />
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-2xl font-bold tracking-tight text-foreground mb-2">{goal.title}</p>
        <div className="flex items-end justify-between mb-2">
            <p className={`text-4xl font-extrabold ${details.color}`}>
                {goal.current_value} 
                <span className="text-xl font-medium text-muted-foreground">/{goal.target_value}</span>
            </p>
            <p className="text-lg font-semibold text-muted-foreground">{goal.metric.split('_').join(' ')}</p>
        </div>
        <Progress value={progressPercentage} indicatorClassName={details.bgColor} />
        {progressPercentage >= 100 && (
            <div className="flex items-center text-green-500 font-semibold mt-3 animate-pulse">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Congratulations! You've hit your goal!</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
