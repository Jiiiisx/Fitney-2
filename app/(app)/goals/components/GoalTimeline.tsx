"use client";

import { useState, useEffect } from "react";
import { Check, Flame, Loader, X } from "lucide-react";

interface WeekData {
  week: string;
  status: string;
}

const statusConfig = {
  completed: {
    icon: <Check className="w-4 h-4 text-white" />,
    bg: "bg-green-500",
    text: "text-green-500",
  },
  active: {
    icon: <Flame className="w-4 h-4 text-white" />,
    bg: "bg-orange-500",
    text: "text-orange-500",
  },
  pending: {
    icon: <Loader className="w-4 h-4 text-muted-foreground animate-spin" />,
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
  missed: {
    icon: <X className="w-4 h-4 text-white" />,
    bg: "bg-red-500",
    text: "text-red-500",
  },
};

export default function GoalTimeline() {
  const [weeks, setWeeks] = useState<WeekData[]>([
    { week: "W1", status: "pending" },
    { week: "W2", status: "pending" },
    { week: "W3", status: "pending" },
    { week: "W4", status: "active" },
    { week: "W5", status: "pending" },
  ]);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch("/api/goals/streak", {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setWeeks(data);
        }
      } catch (error) {
        console.error("Failed to fetch streak", error);
      }
    };

    fetchStreak();
  }, []);

  const completedWeeks = weeks.filter(w => w.status === 'completed').length;

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-[2.5rem] border-none shadow-2xl h-full flex flex-col justify-between relative overflow-hidden group">
      {/* Decorative element */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full -ml-12 -mt-12 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 mb-4 transform group-hover:scale-110 transition-transform duration-500">
           <Flame className="w-8 h-8 text-emerald-600 fill-emerald-600 animate-pulse" />
        </div>
        <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter">
          {completedWeeks} Week Streak
        </p>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-60">Keep the momentum alive</p>
      </div>

      <div className="flex items-center justify-between relative px-2 py-4">
        {/* Timeline line */}
        <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-neutral-100 dark:bg-neutral-800 -translate-y-1/2 -z-0 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
            style={{ width: `${(completedWeeks / (weeks.length - 1)) * 100}%`, transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          ></div>
        </div>

        {weeks.map((week, index) => {
          const config = statusConfig[week.status as keyof typeof statusConfig] || statusConfig.pending;
          const isActive = week.status === 'active' || week.status === 'completed';

          return (
            <div key={index} className="z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-110",
                config.bg,
                isActive ? "ring-4 ring-white dark:ring-neutral-900" : "opacity-40"
              )}>
                {config.icon}
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                config.text,
                !isActive && "opacity-40"
              )}>
                {week.week}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
