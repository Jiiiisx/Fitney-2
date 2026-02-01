"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, CalendarOff, Dumbbell } from "lucide-react";

interface TodaysPlanBannerProps {
  stats?: {
    workouts: number;
    calories: number;
    duration: number;
  };
  plan?: {
    planName: string;
    description?: string;
    programName?: number;
  } | null;
  isLoading?: boolean;
}

export default function TodaysPlanBanner({ stats, plan, isLoading }: TodaysPlanBannerProps) {
  // Logic: If user has done workouts today, show a "Great job" banner.
  // If not, show the "Today's Plan" banner.
  
  const hasActivity = stats && stats.workouts > 0;

  if (isLoading) {
    return <div className="h-48 w-full bg-muted animate-pulse rounded-2xl mb-8"></div>
  }

  if (hasActivity) {
    return (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-700 border-none shadow-lg mb-6 lg:mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-10 pointer-events-none">
            <Flame className="w-16 h-16 sm:w-24 sm:h-24 lg:w-40 lg:h-40 text-white" />
          </div>
          <CardContent className="p-5 sm:p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
            <div className="space-y-2 text-white mb-6 md:mb-0 max-w-full md:max-w-[60%]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[10px] lg:text-xs font-bold mb-1 lg:mb-2">
                <Flame size={10} className="fill-yellow-400 text-yellow-400 lg:w-3 lg:h-3" />
                ON FIRE
              </div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-none">Great Job Today!</h2>
              <p className="text-green-50 text-sm lg:text-base opacity-90">
                You've completed {stats?.workouts} workout{stats && stats.workouts > 1 ? 's' : ''} and burned {stats?.calories} calories so far. Keep it up!
              </p>
            </div>
            <Button variant="secondary" className="font-bold bg-white text-green-700 hover:bg-green-50 w-full md:w-auto py-4 sm:py-6 rounded-xl sm:rounded-2xl lg:py-2 text-sm sm:text-base">
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
    )
  }

  // If there is an active plan today
  if (plan) {
    return (
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-none shadow-lg mb-6 lg:mb-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-700">
             <Dumbbell className="w-16 h-16 sm:w-24 sm:h-24 lg:w-40 lg:h-40 text-white" />
          </div>
          
          <CardContent className="p-5 sm:p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
            <div className="space-y-3 lg:space-y-4 mb-6 md:mb-0 max-w-full md:max-w-[60%]">
              <div className="space-y-1">
                <p className="text-gray-400 text-[10px] lg:text-xs font-bold tracking-widest uppercase">
                  TODAY'S WORKOUT
                </p>
                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
                  {plan.planName}
                </h2>
              </div>
              <p className="text-gray-300 line-clamp-2 text-sm lg:text-base opacity-80">
                {plan.description || "Ready to crush your goals? Let's get moving!"}
              </p>
              <div className="flex items-center gap-3">
                 <span className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-wider">
                    Planned
                 </span>
              </div>
            </div>
    
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold w-full md:w-auto shadow-lg hover:shadow-xl transition-all py-4 sm:py-6 rounded-xl sm:rounded-2xl lg:py-2 text-sm sm:text-base">
              Start Workout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      );
  }

  // If there is NO plan today (Rest Day or no program set)
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-blue-700 border-none shadow-lg mb-6 lg:mb-8 overflow-hidden relative text-white">
      <div className="absolute top-0 right-0 p-4 lg:p-8 opacity-10 pointer-events-none">
        <CalendarOff className="w-16 h-16 sm:w-24 sm:h-24 lg:w-40 lg:h-40 text-white" />
      </div>
      
      <CardContent className="p-5 sm:p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
        <div className="space-y-2 mb-6 md:mb-0 max-w-full md:max-w-[60%]">
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight leading-none">Active Rest Day</h2>
          <p className="text-blue-100 text-sm lg:text-base opacity-90">
            No specific workouts planned for today. It's a great time for recovery or just relaxing!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button variant="secondary" className="font-bold bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/10 w-full md:w-auto py-4 sm:py-6 rounded-xl sm:rounded-2xl lg:py-2 text-sm sm:text-base">
                Browse
            </Button>
            <Button variant="secondary" className="font-bold bg-white text-blue-700 hover:bg-blue-50 w-full md:w-auto py-4 sm:py-6 rounded-xl sm:rounded-2xl lg:py-2 text-sm sm:text-base">
                Log Activity <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
