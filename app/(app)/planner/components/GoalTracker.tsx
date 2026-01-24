"use client";

import { useEffect, useState } from 'react';
import { Target, Footprints, Loader2, Flame, Timer, Dumbbell } from "lucide-react";
import { fetchWithAuth } from "@/app/lib/fetch-helper";

interface GoalTrackerProps {
  planVersion: number;
}

interface Goal {
  id: number;
  title: string;
  metric: string;
  targetValue: number;
  currentValue: number;
}

export default function GoalTracker({ planVersion }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      try {
        // Fetch user goals directly
        const data = await fetchWithAuth('/api/goals');
        setGoals(data);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [planVersion]);

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-6 h-full flex items-center justify-center min-h-[200px] border shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- Helper for Icons & Colors based on Metric ---
  const getGoalConfig = (metric: string) => {
    switch (metric) {
      case 'workout_frequency': return { icon: <Dumbbell className="w-4 h-4" />, color: "bg-blue-500", label: "Workouts" };
      case 'calories_burned': return { icon: <Flame className="w-4 h-4" />, color: "bg-orange-500", label: "kcal" };
      case 'active_minutes': return { icon: <Timer className="w-4 h-4" />, color: "bg-purple-500", label: "mins" };
      case 'distance_run': return { icon: <Footprints className="w-4 h-4" />, color: "bg-green-500", label: "km" };
      default: return { icon: <Target className="w-4 h-4" />, color: "bg-primary", label: "" };
    }
  };

  return (
    <div className="bg-card rounded-3xl p-6 h-full border shadow-sm flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
        <Target className="w-5 h-5 text-primary fill-primary/20" />
        Goal Tracker
      </h2>
      
      <div className="space-y-5 flex-1 overflow-y-auto max-h-[300px] scrollbar-hide">
        {goals.length > 0 ? (
          goals.map(goal => {
             const config = getGoalConfig(goal.metric);
             const percentage = Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100));
             
             return (
              <div key={goal.id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${config.color} bg-opacity-10 text-${config.color.replace('bg-', '')}`}>
                        {config.icon}
                    </div>
                    <p className="font-semibold text-sm text-foreground">{goal.title}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">{goal.currentValue}</span>
                    <span className="text-xs text-muted-foreground"> / {goal.targetValue} {config.label}</span>
                  </div>
                </div>
                
                <div className="relative w-full h-2.5 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${config.color} transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
             );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3">
             <div className="p-3 bg-muted rounded-full">
                <Target className="w-6 h-6 text-muted-foreground" />
             </div>
             <p className="text-sm text-muted-foreground">No active goals yet.</p>
             {/* You could add a button here to navigate to Goals page if you had routing props */}
          </div>
        )}
      </div>
    </div>
  );
}