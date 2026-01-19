"use client";

import { Flame, Droplet, Dumbbell, Zap, MoreHorizontal, Footprints, Weight, Wind, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { Goal } from "../page";

const getMetricDetails = (metric: string) => {
    switch (metric) {
      case "workout_frequency": return { icon: Dumbbell, color: "text-orange-500", bgColor: "bg-orange-500", bgLight: "bg-orange-50 dark:bg-orange-950/30" };
      case "calories_burned": return { icon: Flame, color: "text-red-500", bgColor: "bg-red-500", bgLight: "bg-red-50 dark:bg-red-950/30" };
      case "active_minutes": return { icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-500", bgLight: "bg-yellow-50 dark:bg-yellow-950/30" };
      case "hydration": return { icon: Droplet, color: "text-blue-500", bgColor: "bg-blue-500", bgLight: "bg-blue-50 dark:bg-blue-950/30" };
      case "distance_run": return { icon: Footprints, color: "text-sky-500", bgColor: "bg-sky-500", bgLight: "bg-sky-50 dark:bg-sky-950/30" };
      case "weight_lifted": return { icon: Weight, color: "text-amber-500", bgColor: "bg-amber-500", bgLight: "bg-amber-50 dark:bg-amber-950/30" };
      case "yoga_sessions": return { icon: Wind, color: "text-teal-500", bgColor: "bg-teal-500", bgLight: "bg-teal-50 dark:bg-teal-950/30" };
      default: return { icon: Trophy, color: "text-gray-500", bgColor: "bg-gray-500", bgLight: "bg-gray-900/30" };
    }
};

interface NewGoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
}

export function NewGoalCard({ goal, onEdit, onDelete }: NewGoalCardProps) {
  const details = getMetricDetails(goal.metric);
  const Icon = details.icon;
  const progressPercentage = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
  
  return (
    <Card className="rounded-2xl hover:shadow-lg transition-all duration-300 border h-full flex flex-col relative overflow-hidden group">
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none ${details.bgColor}`} />

      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${details.bgLight} transition-colors group-hover:scale-105 duration-300`}>
                <Icon className={`w-6 h-6 ${details.color}`} />
            </div>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 -mr-2 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(goal)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-500">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="mb-6 flex-grow">
           <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight mb-1">{goal.title}</h3>
           <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{goal.category.replace('_', ' ')}</p>
        </div>

        <div className="space-y-2 mt-auto">
            <div className="flex justify-between items-end">
                <span className="text-2xl font-bold tabular-nums tracking-tight">{goal.current_value}</span>
                <span className="text-sm font-medium text-muted-foreground mb-1">/ {goal.target_value} {goal.metric.split('_')[1] || 'units'}</span>
            </div>
            <Progress value={progressPercentage} className="h-2.5 bg-muted" indicatorClassName={details.bgColor} />
        </div>
      </CardContent>
    </Card>
  );
}