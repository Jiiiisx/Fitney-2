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
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/goals/streak", {
          headers: { Authorization: `Bearer ${token}` }
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
    <div className="bg-card p-5 rounded-2xl border shadow-sm h-full flex flex-col justify-between">
        <div className="text-center mb-4">
            <p className="font-semibold text-lg">
            <span className="text-green-500 text-2xl font-bold mr-1">{completedWeeks}</span> 
            Week Streak!
            </p>
            <p className="text-xs text-muted-foreground">Keep the flame alive 🔥</p>
        </div>
        
        <div className="flex items-center justify-between relative px-2">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-2 right-2 h-1 bg-muted -translate-y-1/2 -z-0 rounded-full">
            <div className="h-full bg-green-500 rounded-full" style={{width: `${(completedWeeks / (weeks.length - 1)) * 100}%`, transition: 'width 0.4s ease'}}></div>
          </div>

          {weeks.map((week, index) => {
            const config = statusConfig[week.status as keyof typeof statusConfig] || statusConfig.pending;
            return (
              <div key={index} className="z-10 flex flex-col items-center gap-1 bg-card p-1 rounded-full">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full shadow-sm ring-2 ring-background ${config.bg}`}>
                  {config.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase ${config.text}`}>{week.week}</span>
              </div>
            );
          })}
        </div>
    </div>
  );
}
