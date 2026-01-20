"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Flame, Wind, CheckCircle2, Calendar, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10', 
        border: 'border-l-blue-500',
        icon: Dumbbell 
      };
    case 'Cardio':
      return { 
        color: 'text-red-500', 
        bg: 'bg-red-500/10', 
        border: 'border-l-red-500',
        icon: Flame 
      };
    case 'Flexibility':
      return { 
        color: 'text-green-500', 
        bg: 'bg-green-500/10', 
        border: 'border-l-green-500',
        icon: Wind 
      };
    default: // Rest Day
      return { 
        color: 'text-gray-500', 
        bg: 'bg-gray-500/10', 
        border: 'border-l-gray-500',
        icon: CheckCircle2 
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
      weekday: 'long',
    }).format(date);
};

const LogEntry = ({ log }: { log: WorkoutLog }) => {
  const styles = getWorkoutTypeStyles(log.type);
  const Icon = styles.icon;

  return (
    <div className={cn(
      "group relative bg-card hover:bg-accent/5 transition-all duration-300 rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md",
      "border-l-4", styles.border
    )}>
      <div className="p-5 flex flex-col h-full justify-between">
        {/* Header Section */}
        <div>
            <div className="flex justify-between items-start mb-3">
                <span className={cn("inline-flex items-center justify-center p-2 rounded-lg", styles.bg, styles.color)}>
                    <Icon className="w-5 h-5" />
                </span>
                <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground">{formatDay(log.date)}</p>
                    <p className="text-sm font-bold text-foreground">{formatDate(log.date)}</p>
                </div>
            </div>
            
            <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {log.name}
            </h3>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                {log.type}
            </p>
        </div>

        {/* Stats Section */}
        {log.type !== 'Rest Day' ? (
             <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">{log.duration}</span>
                    <span className="text-xs">min</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-foreground">{log.calories}</span>
                    <span className="text-xs">kcal</span>
                </div>
            </div>
        ) : (
            <div className="mt-auto pt-4 border-t border-border/50">
                 <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                    Start fresh tomorrow! ✨
                 </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default function HistoryWorkoutLog() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/workouts/history');
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

  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted/20 rounded-xl border border-border/50"></div>
            ))}
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center text-red-600">
            <p className="font-medium">Oops! Failed to load history.</p>
            <p className="text-sm opacity-80 mt-1">{error}</p>
        </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center p-12 rounded-2xl bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center">
        <div className="bg-background p-4 rounded-full shadow-sm mb-4">
            <Dumbbell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No workouts logged yet</h3>
        <p className="text-muted-foreground mt-1 mb-6 text-sm max-w-xs mx-auto">
          Start your journey today by logging your first activity!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {logs.map((log) => (
        <LogEntry key={log.id} log={log} />
      ))}
    </div>
  );
}
