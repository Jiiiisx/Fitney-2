"use client";

import { useEffect, useState } from 'react';
import WorkoutCard, { Workout } from "./WorkoutCard";
import { addDays, format, parseISO } from 'date-fns';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivePlan {
  id: number;
  name: string;
  start_date: string;
  schedule: {
    id: number;
    day_number: number;
    name: string;
    exercises: {
      name: string;
      sets: number | null;
      reps: string | null;
      duration_seconds: number | null;
    }[];
  }[];
}

interface CalendarGridProps {
  onChooseProgramClick: () => void;
  planVersion: number;
}

const getWeekDays = () => {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
};

export default function CalendarGrid({ onChooseProgramClick, planVersion }: CalendarGridProps) {
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const weekDays = getWeekDays();

  useEffect(() => {
    async function fetchActivePlan() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setPlan(null);
          return;
        }

        const response = await fetch('/api/users/me/active-plan', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (response.status === 404) {
          setPlan(null);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch active plan');
        }
        
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchActivePlan();
  }, [planVersion]);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8 col-span-full">Loading your plan...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500 p-8 col-span-full">{error}</div>;
    }

    if (!plan) {
      return (
        <div className="col-span-full xl:w-full flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-2xl h-full">
          <Sparkles className="w-16 h-16 text-yellow-400 mb-4" />
          <h3 className="text-xl font-bold">Start Your Journey!</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
            You don't have an active workout plan yet. Choose a professionally designed program to get started on your fitness goals.
          </p>
          <Button onClick={onChooseProgramClick} size="lg">
            Choose a Program
          </Button>
        </div>
      );
    }

    const startDate = parseISO(plan.start_date);

    if (isNaN(startDate.getTime())) {
      return <div className="text-center text-red-500 p-8 col-span-full">Error: Invalid plan start date detected.</div>;
    }

    const scheduleMap = new Map(plan.schedule.map(day => {
      const dayDate = addDays(startDate, day.day_number - 1);
      return [format(dayDate, 'yyyy-MM-dd'), day];
    }));
    
    return weekDays.map((dayDate, index) => {
      const dayOfWeekName = format(dayDate, 'EEEE');
      const dateString = format(dayDate, 'yyyy-MM-dd');
      const scheduledDay = scheduleMap.get(dateString);
      
      let workoutsForDay: Workout[] = [];
      
      if (scheduledDay) {
        if (scheduledDay.exercises && scheduledDay.exercises.length > 0) {
          workoutsForDay.push({
            name: scheduledDay.name,
            type: scheduledDay.name.toLowerCase().includes('cardio') ? 'Cardio' : 'Strength', 
            duration: 60,
            status: 'scheduled',
            exercises: scheduledDay.exercises.map(ex => 
              `${ex.name} - ${ex.sets ? `${ex.sets} sets x ` : ''}${ex.reps ? `${ex.reps} reps` : ''}${ex.duration_seconds ? `${ex.duration_seconds}s` : ''}`
            )
          });
        } else {
           workoutsForDay.push({
            name: scheduledDay.name,
            type: 'Rest Day',
            duration: 0,
            status: 'completed'
          });
        }
      }

      return (
        <div key={index} className="xl:flex xl:flex-col xl:flex-1">
          <h3 className="font-semibold text-sm text-center text-secondary-foreground mb-3">
            {dayOfWeekName}
            <span className="block text-xs">{format(dayDate, 'd MMM')}</span>
          </h3>
          <div className="space-y-3 xl:flex-grow">
            {workoutsForDay.length > 0 ? (
              workoutsForDay.map((workout, index) => (
                <WorkoutCard key={index} workout={workout} />
              ))
            ) : (
              <div className="h-24 rounded-lg bg-transparent"></div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        This Week's Plan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:flex gap-4">
        {renderContent()}
      </div>
    </div>
  );
}