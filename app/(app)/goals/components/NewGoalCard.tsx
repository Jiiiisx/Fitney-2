"use client";

import { Flame, Droplet, Dumbbell, Zap, MoreHorizontal, Footprints, Weight, Wind, Trophy, CheckCircle } from "lucide-react";
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
import { cn } from "@/app/lib/utils";

const getMetricDetails = (metric: string) => {
    switch (metric) {
      case "workout_frequency": return { icon: Dumbbell, color: "text-orange-500", bgColor: "bg-orange-500", bgLight: "bg-orange-500/10" };
      case "calories_burned": return { icon: Flame, color: "text-red-500", bgColor: "bg-red-500", bgLight: "bg-red-500/10" };
      case "active_minutes": return { icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-500", bgLight: "bg-yellow-500/10" };
      case "hydration": return { icon: Droplet, color: "text-blue-500", bgColor: "bg-blue-500", bgLight: "bg-blue-500/10" };
      case "distance_run": return { icon: Footprints, color: "text-sky-500", bgColor: "bg-sky-500", bgLight: "bg-sky-500/10" };
      case "weight_lifted": return { icon: Weight, color: "text-amber-500", bgColor: "bg-amber-500", bgLight: "bg-amber-500/10" };
      case "yoga_sessions": return { icon: Wind, color: "text-teal-500", bgColor: "bg-teal-500", bgLight: "bg-teal-500/10" };
      default: return { icon: Trophy, color: "text-purple-500", bgColor: "bg-purple-500", bgLight: "bg-purple-500/10" };
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
    <Card className="rounded-[2rem] hover:shadow-2xl hover:shadow-neutral-200 dark:hover:shadow-black/40 transition-all duration-500 border-none bg-white dark:bg-neutral-900 h-full flex flex-col relative overflow-hidden group">
      {/* Dynamic Background Blur */}
      <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none", details.bgColor)} />

      <CardContent className="p-6 sm:p-7 flex flex-col flex-grow relative">
        <div className="flex justify-between items-start mb-6">
            <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110 duration-500 shadow-sm", details.bgLight)}>
                <Icon className={cn("w-6 h-6", details.color)} />
            </div>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 p-0 -mr-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl p-2 border-neutral-100 dark:border-neutral-800 shadow-xl">
                    <DropdownMenuItem onClick={() => onEdit(goal)} className="rounded-xl font-bold py-2.5">Edit Goal</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-500 rounded-xl font-bold py-2.5">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="mb-8 flex-grow">
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                {goal.category.replace('_', ' ')}
              </span>
              {progressPercentage >= 100 && (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              )}
           </div>
           <h3 className="font-black text-xl text-neutral-900 dark:text-white leading-tight mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
             {goal.title}
           </h3>
        </div>

        <div className="space-y-4 mt-auto">
            <div className="flex justify-between items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tabular-nums tracking-tighter text-neutral-900 dark:text-white">
                    {goal.current_value}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    / {goal.target_value}
                  </span>
                </div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter mb-1 opacity-60">
                   {goal.metric.split('_').join(' ')}
                </span>
            </div>
            <div className="relative pt-1">
               <Progress 
                value={progressPercentage} 
                className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full" 
                indicatorClassName={cn("rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]", details.bgColor)} 
               />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}