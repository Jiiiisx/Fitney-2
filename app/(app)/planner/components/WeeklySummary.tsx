"use client";

import { useEffect, useState } from 'react';
import { BarChart, TrendingUp, Clock, Zap, Loader2 } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

interface WeeklySummaryProps {
  planVersion: number;
}

interface SummaryStats {
  totalWorkouts: number;
  caloriesBurn: number;
  totalTime: number; // in minutes
  completion: number; // as a percentage
}

export default function WeeklySummary({ planVersion }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setSummary(null);
          return;
        }

        const response = await fetch('/api/users/me/active-plan', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          setSummary(null);
          return;
        }

        const plan = await response.json();
        if (plan && plan.schedule) {
          const today = new Date();
          const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
          const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

          const thisWeekSchedule = plan.schedule.filter((s: any) => 
            isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd })
          );
          
          const totalWorkouts = thisWeekSchedule.filter((s: any) => s.name !== 'Rest Day').length;
          
          const totalTime = thisWeekSchedule.reduce((acc: number, day: any) => {
            if (day.name === 'Rest Day') return acc;
            const duration = day.exercises?.reduce((sum: number, ex: any) => sum + (ex.duration_seconds || 0), 0) / 60;
            return acc + (duration > 0 ? Math.round(duration) : 60);
          }, 0);

          // Placeholder for calories and completion logic
          const caloriesBurn = totalWorkouts * 350; // Example calculation
          const scheduledCount = thisWeekSchedule.length;
          const completion = scheduledCount > 0 ? Math.round((totalWorkouts / scheduledCount) * 100) : 0;

          setSummary({
            totalWorkouts,
            caloriesBurn,
            totalTime,
            completion,
          });
        } else {
          setSummary(null);
        }
      } catch (error) {
        console.error("Failed to fetch weekly summary:", error);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklySummary();
  }, [planVersion]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="mt-2 text-secondary-foreground">Loading Weekly Summary...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-card rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 text-foreground">Weekly Summary</h2>
        <p className="text-center text-secondary-foreground">No data available for this week.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-foreground">
        Weekly Summary
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workouts */}
        <div className="bg-background p-4 rounded-lg">
          <BarChart className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-sm text-secondary-foreground">Total Workouts</p>
          <p className="text-2xl font-bold text-foreground">{summary.totalWorkouts}</p>
        </div>
        {/* Calories */}
        <div className="bg-background p-4 rounded-lg">
          <TrendingUp className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-sm text-secondary-foreground">Calories Burn</p>
          <p className="text-2xl font-bold text-foreground">{summary.caloriesBurn.toLocaleString()} <span className="text-sm font-normal">kcal</span></p>
        </div>
        {/* Total Time */}
        <div className="bg-background p-4 rounded-lg">
          <Clock className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-sm text-secondary-foreground">Total Time</p>
          <p className="text-2xl font-bold text-foreground">{formatTime(summary.totalTime)}</p>
        </div>
        {/* Completion */}
        <div className="bg-background p-4 rounded-lg">
          <Zap className="w-6 h-6 text-primary mb-2" />
          <p className="text-sm text-secondary-foreground">Completion</p>
          <p className="text-2xl font-bold text-foreground">{summary.completion}%</p>
          <div className="w-full bg-secondary rounded-full h-2 mt-1">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${summary.completion}%`, transition: 'width 0.4s ease' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}