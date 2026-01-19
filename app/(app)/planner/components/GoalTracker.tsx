"use client";

import { useEffect, useState } from 'react';
import { Target, Footprints, Loader2 } from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

interface GoalTrackerProps {
  planVersion: number;
}

interface Goal {
  id: number;
  type: 'weekly_workouts' | 'running_distance';
  target: number;
  current_progress: number;
}

interface GoalsData {
  weekly_workouts?: Goal;
  running_distance?: Goal;
}

export default function GoalTracker({ planVersion }: GoalTrackerProps) {
  const [goals, setGoals] = useState<GoalsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setGoals({});
          return;
        }

        // Fetch goals and active plan in parallel
        const [goalsResponse, planResponse] = await Promise.all([
          fetch('/api/users/profile/goals', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/users/profile/active-plan', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!goalsResponse.ok) {
          setGoals({});
          // Don't return, still try to process plan
        }

        let goalsData: Goal[] = await goalsResponse.json();
        const processedGoals: GoalsData = {};
        
        if (planResponse.ok) {
          const plan = await planResponse.json();
          if (plan && plan.schedule) {
            const today = new Date();
            const weekStart = startOfWeek(today, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

            const thisWeekSchedule = plan.schedule.filter((s: any) => 
              isWithinInterval(parseISO(s.date), { start: weekStart, end: weekEnd })
            );

            // Calculate current progress from this week's schedule
            const weeklyWorkoutsProgress = thisWeekSchedule.filter((s: any) => s.name !== 'Rest Day').length;
            
            // A simple placeholder for running distance.
            // In a real app, you'd get this from workout data.
            const runningDistanceProgress = thisWeekSchedule
              .filter((s: any) => s.name.toLowerCase().includes('run'))
              .reduce((total: number, s: any) => total + 5, 0); // Assuming each run is 5km

            // Update progress for fetched goals
            goalsData = goalsData.map(goal => {
              if (goal.type === 'weekly_workouts') {
                return { ...goal, current_progress: weeklyWorkoutsProgress };
              }
              if (goal.type === 'running_distance') {
                return { ...goal, current_progress: runningDistanceProgress };
              }
              return goal;
            });
          }
        }
        
        goalsData.forEach(goal => {
          processedGoals[goal.type] = goal;
        });

        setGoals(processedGoals);

      } catch (error) {
        console.error("Failed to fetch goals:", error);
        setGoals({});
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [planVersion]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const weeklyWorkoutsGoal = goals.weekly_workouts;
  const runningDistanceGoal = goals.running_distance;

  return (
    <div className="bg-card rounded-2xl p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-foreground">Goal Tracker</h2>
      <div className="space-y-4">
        {weeklyWorkoutsGoal ? (
          <div className="bg-background p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-foreground">Weekly Workouts</p>
              <p className="text-sm font-bold text-primary">{weeklyWorkoutsGoal.current_progress} / {weeklyWorkoutsGoal.target}</p>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${(weeklyWorkoutsGoal.current_progress / weeklyWorkoutsGoal.target) * 100}%`, transition: 'width 0.4s ease' }}
              ></div>
            </div>
          </div>
        ) : <p className="text-sm text-secondary-foreground text-center py-4">No weekly workout goal set.</p>}
        
        {runningDistanceGoal ? (
          <div className="bg-background p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-foreground">Running Distance</p>
              <p className="text-sm font-bold text-green-500">{runningDistanceGoal.current_progress} / {runningDistanceGoal.target} km</p>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${(runningDistanceGoal.current_progress / runningDistanceGoal.target) * 100}%`, transition: 'width 0.4s ease' }}
              ></div>
            </div>
          </div>
        ) : <p className="text-sm text-secondary-foreground text-center py-4">No running distance goal set.</p>}
      </div>
    </div>
  );
}