"use client";

import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { useAI } from "@/app/lib/AIContext";
import { TrendingUp, TrendingDown, Zap, Quote, Info } from "lucide-react";
import CircularProgress from "../../components/CircularProgress";
import { cn } from "@/app/lib/utils";
import useSWR from 'swr';
import { fetchWithAuth } from "@/app/lib/fetch-helper";

const DynamicQuickActions = dynamic(() => import('./QuickActions'), { ssr: false });

const fetcher = (url: string) => fetchWithAuth(url);

// Helper to get greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

const StatsSidebar = () => {
  const { currentTip } = useAI();
  const { data: userData, isLoading: userLoading } = useSWR('/api/users/profile', fetcher);
  const { data: statsData, isLoading: statsLoading } = useSWR('/api/stats/sidebar', fetcher);
  
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setMounted(true);
    setGreeting(getGreeting());
  }, []);

  const loading = userLoading || statsLoading;

  if (loading && !statsData) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 animate-pulse p-8">
        <div className="rounded-full bg-neutral-200 dark:bg-neutral-800 h-40 w-40"></div>
        <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
        <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
      </div>
    );
  }

  const isPositive = (statsData?.consistencyChange || 0) >= 0;
  const userName = (userData?.fullName || userData?.username || "User").split(' ')[0];

  return (
    <div className="h-full flex flex-col space-y-10 relative">
      
      {/* HERO SECTION */}
      <div className="flex flex-col items-center text-center relative group">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[80px] opacity-50 pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
        
        <div className="relative transform group-hover:scale-105 transition-transform duration-500">
           <CircularProgress
             percentage={statsData?.progressPercentage || 0}
             size={160}
             strokeWidth={12}
             color="text-primary"
           >
              <div className="text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Level</p>
                 <p className="text-5xl font-black text-neutral-900 dark:text-white tracking-tighter">{statsData?.level || 1}</p>
              </div>
           </CircularProgress>
        </div>

        <div className="mt-8 space-y-2">
           <h3 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tighter leading-none">
             {greeting}, <span className="text-primary">{userName}!</span> 🔥
           </h3>
           <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Quote className="w-3 h-3 opacity-40" />
              <p className="text-xs font-bold italic max-w-[200px] leading-relaxed">
                {currentTip || "Continue your journey to achieve your target!"}
              </p>
           </div>
        </div>
      </div>

      {/* CONSISTENCY INSIGHT CARD */}
      <div className="relative">
        <div className={cn(
            "p-6 rounded-[2rem] border-none shadow-xl relative overflow-hidden group transition-all duration-500 hover:scale-[1.02]",
            isPositive ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
        )}>
           {/* Decorative Icon */}
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
              {isPositive ? <TrendingUp className="w-24 h-24" /> : <TrendingDown className="w-24 h-24" />}
           </div>

           <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                 <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                    <Zap className="w-4 h-4 fill-white" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Weekly Insight</span>
              </div>
              
              <p className="text-sm font-bold leading-snug">
                 <span className="text-lg block mb-1">Great Work!</span>
                 Your consistency is {isPositive ? 'up' : 'down'} by{' '}
                 <span className="text-xl font-black tracking-tighter bg-white/20 px-2 rounded-lg ml-1">
                   {Math.abs(statsData?.consistencyChange || 0)}%
                 </span>
                 {' '}from last week.
              </p>
              
              <div className="flex items-center gap-1.5 pt-2 text-[10px] font-black uppercase opacity-60">
                 <Info className="w-3 h-3" />
                 <span>Based on workout frequency</span>
              </div>
           </div>
        </div>
      </div>

      <div className="hidden lg:block w-full pt-4">
        <div className="flex items-center gap-2 mb-4 px-2">
           <Zap className="w-4 h-4 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Access</span>
        </div>
        <DynamicQuickActions variant="grid" />
      </div>
    </div>
  );
};

export default StatsSidebar;
