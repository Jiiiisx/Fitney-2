"use client";

import { useState, useEffect } from "react";
import { Flame, Droplet, Dumbbell, Zap, Footprints, Weight, Wind, Trophy, CheckCircle, Target, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Goal } from "../page";
import CircularProgress from "@/app/(app)/components/CircularProgress";
import { cn } from "@/app/lib/utils";

const getMetricDetails = (metric: string) => {
  switch (metric) {
    case "workout_frequency": return { icon: Dumbbell, color: "text-orange-500", ring: "text-orange-500", bg: "bg-orange-500/10" };
    case "calories_burned": return { icon: Flame, color: "text-red-500", ring: "text-red-500", bg: "bg-red-500/10" };
    case "active_minutes": return { icon: Zap, color: "text-yellow-500", ring: "text-yellow-500", bg: "bg-yellow-500/10" };
    case "hydration": return { icon: Droplet, color: "text-blue-500", ring: "text-blue-500", bg: "bg-blue-500/10" };
    case "distance_run": return { icon: Footprints, color: "text-sky-500", ring: "text-sky-500", bg: "bg-sky-500/10" };
    case "weight_lifted": return { icon: Weight, color: "text-amber-500", ring: "text-amber-500", bg: "bg-amber-500/10" };
    case "yoga_sessions": return { icon: Wind, color: "text-teal-500", ring: "text-teal-500", bg: "bg-teal-500/10" };
    default: return { icon: Trophy, color: "text-purple-500", ring: "text-purple-500", bg: "bg-purple-500/10" };
  }
};

interface FeaturedGoalCardProps {
  goal: Goal;
}

export function FeaturedGoalCard({ goal }: FeaturedGoalCardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!goal) return null;

  const details = getMetricDetails(goal.metric);
  const Icon = details.icon;
  const progressPercentage = goal.target_value > 0 ? Math.min((goal.current_value / goal.target_value) * 100, 100) : 0;

  return (
    <Card className="overflow-hidden border-none shadow-2xl bg-white dark:bg-neutral-900 relative group min-h-[320px] rounded-[2.5rem]">
      {/* Decorative Gradients */}
      <div className={cn("absolute top-0 right-0 w-80 h-80 rounded-full -mr-40 -mt-40 blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000", details.bg.replace('/10', '/30'))} />
      
      <CardContent className="p-8 sm:p-10 relative h-full">
        <div className="flex flex-col lg:flex-row gap-10 items-center h-full">
          
          {/* Left Side: Visual Progress */}
          <div className="relative flex-shrink-0">
             <div className={cn("absolute inset-0 rounded-full blur-3xl opacity-20 scale-110", details.bg.replace('/10', '/40'))} />
             <CircularProgress 
                percentage={progressPercentage} 
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? 180 : 220} 
                strokeWidth={14} 
                color={details.ring}
             >
                <div className="text-center">
                  <p className="text-4xl sm:text-6xl font-black tracking-tighter text-neutral-900 dark:text-white leading-none">
                    {Math.round(progressPercentage)}<span className="text-xl sm:text-2xl opacity-40">%</span>
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-2">Progress</p>
                </div>
             </CircularProgress>
             
             {/* Goal Icon Floating Badge */}
             <div className={cn("absolute -top-2 -right-2 p-4 rounded-3xl shadow-xl border-4 border-white dark:border-neutral-900 transform group-hover:scale-110 transition-transform duration-500", details.bg.replace('/10', '/100'), "bg-white dark:bg-neutral-800")}>
                <Icon className={cn("w-6 h-6", details.color)} />
             </div>
          </div>

          {/* Right Side: Details */}
          <div className="flex-grow w-full space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                   {goal.category === 'weekly' ? 'Weekly Sprint' : 'North Star'}
                 </span>
                 {progressPercentage >= 100 && (
                   <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                     <CheckCircle className="w-3 h-3" /> Completed
                   </span>
                 )}
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white leading-tight tracking-tight mb-2">
                {goal.title}
              </h3>
              <p className="text-muted-foreground font-medium flex items-center gap-2 italic">
                <Target className="w-4 h-4" />
                Pushing towards {goal.target_value} {goal.metric.split('_').join(' ')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current</p>
                  <p className="text-2xl font-black text-neutral-900 dark:text-white">{goal.current_value}</p>
               </div>
               <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Target</p>
                  <p className="text-2xl font-black text-neutral-900 dark:text-white">{goal.target_value}</p>
               </div>
            </div>

            <div className="flex items-center justify-between pt-2">
               <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                 <Calendar className="w-4 h-4" />
                 Ends {goal.end_date ? new Date(goal.end_date).toLocaleDateString() : 'No limit'}
               </div>
               <div className="flex items-center gap-1.5">
                  <TrendingUp className={cn("w-4 h-4", details.color)} />
                  <span className="text-xs font-black uppercase tracking-wider">Keep going!</span>
               </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
