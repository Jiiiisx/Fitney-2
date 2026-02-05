"use client";

import { useEffect, useState } from 'react';
import { Calendar, Clock, Zap } from 'lucide-react';
import { format, parseISO, isFuture, differenceInMinutes, isToday } from 'date-fns';
import { fetchWithAuth } from "@/app/lib/fetch-helper";

interface UpcomingWorkoutProps {
  planVersion: number;
}

interface Workout {
  id: number;
  name: string;
  description: string | null;
  date: string;
  duration_minutes?: number; // Optional duration
}

export default function UpcomingWorkout({ planVersion }: UpcomingWorkoutProps) {
  const [nextWorkout, setNextWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextWorkout = async () => {
      setLoading(true);
      try {
        const plan = await fetchWithAuth('/api/users/profile/active-plan');
        
        if (plan && plan.schedule) {
          const upcoming = plan.schedule
            .map((s: any) => ({ ...s, date: parseISO(s.date) }))
            .filter((s: any) => (isFuture(s.date) || isToday(s.date)) && s.name !== 'Rest Day')
            .sort((a: any, b: any) => a.date - b.date);

          if (upcoming.length > 0) {
            const next = upcoming[0];
            // Estimate duration if not provided. Sum of exercise durations or default.
            const totalDuration = next.exercises?.reduce((sum: number, ex: any) => sum + (ex.duration_seconds || 0), 0) / 60;
            
            setNextWorkout({
              id: next.id,
              name: next.name,
              description: next.description,
              date: next.date.toISOString(),
              duration_minutes: totalDuration > 0 ? Math.round(totalDuration) : 60, // Default to 60 if no exercise durations
            });
          } else {
            setNextWorkout(null);
          }
        } else {
          setNextWorkout(null);
        }
      } catch (error) {
        console.error("Failed to fetch next workout:", error);
        setNextWorkout(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNextWorkout();
  }, [planVersion]);

  if (loading) {
    return (
      <div className="bg-primary/10 p-4 rounded-lg border border-primary/50 text-center">
        <p className="text-secondary-foreground">Loading next workout...</p>
      </div>
    );
  }

  if (!nextWorkout) {
    return (
      <div className="bg-primary/10 p-4 rounded-lg border border-primary/50">
        <h2 className="text-base font-semibold mb-2 text-secondary-foreground">
          Next Upcoming Workout
        </h2>
        <div className="flex items-center justify-center text-center py-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">All Clear!</h3>
            <p className="text-sm text-secondary-foreground">
              No upcoming workouts scheduled. Enjoy your rest!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 p-4 rounded-lg border border-primary/50">
      <h2 className="text-base font-semibold mb-3 text-secondary-foreground">
        Next Upcoming Workout
      </h2>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-foreground leading-tight">{nextWorkout.name}</h3>
          <p className="text-sm text-secondary-foreground mt-1">
            {nextWorkout.description || 'Get ready for your next session.'}
          </p>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-6 text-sm text-secondary-foreground shrink-0">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">{format(parseISO(nextWorkout.date), 'EEEE')}</span>
          </div>
          {nextWorkout.duration_minutes && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium">{nextWorkout.duration_minutes} min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}