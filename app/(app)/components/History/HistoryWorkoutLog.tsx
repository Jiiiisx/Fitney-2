"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Flame, Wind, CheckCircle2, Calendar, Clock, Activity, Zap, TrendingUp, ChevronRight, Timer } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Define the structure of a single workout log from our API
interface WorkoutLog {
  id: number;
  type: 'Strength' | 'Cardio' | 'Flexibility' | 'Rest Day';
  name: string;
  duration: number; // in minutes
  calories: number;
  date: string; // Formatted as 'YYYY-MM-DD'
}

// Helper to get color and icon based on workout type
const getWorkoutTypeStyles = (type: WorkoutLog['type']) => {
  switch (type) {
    case 'Strength':
      return {
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-500/10',
        ring: 'text-blue-500',
        icon: Dumbbell,
        label: 'Strength'
      };
    case 'Cardio':
      return {
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-500/10',
        ring: 'text-red-500',
        icon: Flame,
        label: 'Cardio'
      };
    case 'Flexibility':
      return {
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10',
        ring: 'text-emerald-500',
        icon: Wind,
        label: 'Yoga & Flex'
      };
    default:
      return {
        color: 'text-neutral-500',
        bg: 'bg-neutral-500/10',
        ring: 'text-neutral-500',
        icon: CheckCircle2,
        label: 'Rest Day'
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const formatDay = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  }).format(date);
};

const LogEntry = ({ log, index }: { log: WorkoutLog; index: number }) => {
  const styles = getWorkoutTypeStyles(log.type);
  const Icon = styles.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white dark:bg-neutral-900 rounded-[2.5rem] p-6 border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
    >
      {/* Decorative Gradient on Hover */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none",
        styles.ring.replace('text-', 'bg-')
      )} />

      <div className="flex flex-col h-full space-y-6 relative z-10">
        {/* Top: Date and Type Badge */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-center justify-center w-12 h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">{formatDay(log.date)}</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white leading-none">{formatDate(log.date).split(' ')[1]}</span>
             </div>
             <div>
                <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", styles.bg, styles.color)}>
                  {styles.label}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-muted-foreground opacity-60">
                   <Calendar className="w-3 h-3" />
                   {formatDate(log.date).split(' ')[0]}
                </div>
             </div>
          </div>
          <div className={cn("p-3 rounded-2xl transition-transform group-hover:rotate-12 duration-500 shadow-inner", styles.bg)}>
             <Icon className={cn("w-5 h-5", styles.color)} />
          </div>
        </div>

        {/* Middle: Title */}
        <div className="flex-grow min-h-[50px]">
           <h3 className="text-xl font-black text-neutral-900 dark:text-white leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
             {log.name}
           </h3>
        </div>

        {/* Bottom: Stats */}
        {log.type !== 'Rest Day' ? (
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Timer className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Duration</p>
                <p className="text-sm font-black text-neutral-900 dark:text-white tracking-tighter">{log.duration}<span className="text-[10px] ml-0.5 opacity-60">m</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Burned</p>
                <p className="text-sm font-black text-neutral-900 dark:text-white tracking-tighter">{log.calories}<span className="text-[10px] ml-0.5 opacity-60">kcal</span></p>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between px-2">
               <p className="text-xs font-bold text-muted-foreground italic opacity-60">Body recharging...</p>
               <TrendingUp className="w-4 h-4 text-emerald-500 opacity-40" />
            </div>
          </div>
        )}
      </div>
      
      {/* Subtle Arrow on Hover */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
         <ChevronRight className="w-5 h-5 text-primary" />
      </div>
    </motion.div>
  );
};

interface HistoryWorkoutLogProps {
  filterType?: string;
  filterDuration?: string;
  sortOrder?: string;
}

export default function HistoryWorkoutLog({
  filterType = "all",
  filterDuration = "all",
  sortOrder = "newest"
}: HistoryWorkoutLogProps) {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/workouts/history', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch workout history');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Filter and Sort Logic
  const filteredLogs = logs.filter(log => {
    // Filter by Type
    if (filterType !== 'all') {
      if (log.type.toLowerCase() !== filterType.toLowerCase()) return false;
    }

    // Filter by Duration
    if (filterDuration !== 'all') {
      const duration = log.duration || 0;
      if (filterDuration === 'short' && duration >= 15) return false;
      if (filterDuration === 'medium' && (duration < 15 || duration > 45)) return false;
      if (filterDuration === 'long' && duration <= 45) return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort Logic
    switch (sortOrder) {
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'calories':
        return (b.calories || 0) - (a.calories || 0);
      case 'duration':
        return (b.duration || 0) - (a.duration || 0);
      case 'newest':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-64 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-[2.5rem]"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 text-center text-red-600">
        <p className="font-bold">Oops! Failed to load history.</p>
        <p className="text-sm opacity-80 mt-1">{error}</p>
      </div>
    );
  }

  if (filteredLogs.length === 0) {
    return (
      <div className="text-center p-16 rounded-[3rem] bg-neutral-50 dark:bg-neutral-900 border-4 border-dashed border-neutral-100 dark:border-neutral-800 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-[2rem] shadow-xl mb-6">
          <Dumbbell className="w-10 h-10 text-muted-foreground opacity-20" />
        </div>
        <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tighter">No workouts found</h3>
        <p className="text-muted-foreground mt-2 mb-8 text-sm max-w-xs mx-auto font-medium">
          Try adjusting your filters or log a new workout to start building your history.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
      <AnimatePresence mode="popLayout">
        {filteredLogs.map((log, index) => (
          <LogEntry key={log.id} log={log} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
}