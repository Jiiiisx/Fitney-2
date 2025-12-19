"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame } from "lucide-react";

interface TodaysPlanBannerProps {
  stats?: {
    workouts: number;
    calories: number;
    duration: number;
  };
  isLoading?: boolean;
}

export default function TodaysPlanBanner({ stats, isLoading }: TodaysPlanBannerProps) {
  // Logic: If user has done workouts today, show a "Great job" banner.
  // If not, show the "Today's Plan" banner.
  
  const hasActivity = stats && stats.workouts > 0;

  if (isLoading) {
    return <div className="h-48 w-full bg-muted animate-pulse rounded-2xl mb-8"></div>
  }

  if (hasActivity) {
    return (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-700 border-none shadow-lg mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Flame className="w-40 h-40 text-white" />
          </div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between relative z-10">
            <div className="space-y-2 text-white mb-4 md:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
                <Flame size={12} className="fill-yellow-400 text-yellow-400" />
                ON FIRE
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Great Job Today!</h2>
              <p className="text-green-50 max-w-md">
                You've completed {stats.workouts} workout{stats.workouts > 1 ? 's' : ''} and burned {stats.calories} calories so far. Keep it up!
              </p>
            </div>
            <Button variant="secondary" className="font-bold bg-white text-green-700 hover:bg-green-50">
              View Details <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-none shadow-lg mb-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <div className="w-40 h-40 rounded-full border-8 border-white/20" />
      </div>
      
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="space-y-4 mb-6 md:mb-0">
          <div className="space-y-1">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">
              FRIDAY WORKOUT PLAN
            </p>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Today's Target: Chest & Triceps
            </h2>
          </div>
          <p className="text-gray-300 max-w-md">
            Ready to build some power? Let's get started with today's planned workout.
          </p>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-500 text-xs font-bold">
                Intermediate
             </span>
             <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">
                45 min session
             </span>
          </div>
        </div>

        <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold w-full md:w-auto">
          Start Workout <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}