"use client";

import { Flame, Droplet, Dumbbell, Zap, MoreHorizontal, Footprints, Weight, Wind, Trophy, Medal } from "lucide-react";
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
    <Card className="rounded-xl hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${details.bgColor}/10`}>
            <Icon className={`w-6 h-6 ${details.color}`} />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-foreground">{goal.title}</p>
            <p className={`font-bold text-sm ${details.color}`}>
              {goal.current_value} / {goal.target_value}
            </p>
          </div>
          <Progress value={progressPercentage} className="h-2 mt-2" indicatorClassName={details.bgColor} />
        </div>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 self-start">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(goal)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-500">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
