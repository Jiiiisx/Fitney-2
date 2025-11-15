"use client";

import { useEffect, useState } from 'react';
import WorkoutCard, { Workout } from "./WorkoutCard";
import { getDay, startOfWeek, addDays, format } from 'date-fns';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define the structure of the plan returned by our API
interface ActivePlan {
  id: number;
  name: string;
  start_date: string;
  schedule: {
    day: number;
    name: string;
    exercises: { name:string }[];
  }[];
}

interface CalendarGridProps {
  onChooseProgramClick: () => void;
}

// Helper to get the days of the current week starting from Monday
const getWeekDays = () => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // 1 = Monday
  return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
};

export default function CalendarGrid({ onChooseProgramClick }: CalendarGridProps) {
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const weekDays = getWeekDays();

  useEffect(() => {
    async function fetchActivePlan() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // No need to throw an error, just means user is not logged in or has no plan
          setPlan(null);
          return;
        }

        const response = await fetch('/api/users/me/active-plan', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
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
  }, []);

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

    // Calculate workouts for the current week view
    const startDate = new Date(plan.start_date);
    
    return weekDays.map(dayDate => {
      const dayOfWeekName = format(dayDate, 'EEEE'); // Monday, Tuesday...
      const dayDiff = Math.floor((dayDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      
      let workoutsForDay: Workout[] = [];
      
      if (dayDiff >= 0) {
        const planDayIndex = (dayDiff % plan.schedule.length);
        const scheduledDay = plan.schedule[planDayIndex];

        if (scheduledDay && scheduledDay.exercises && scheduledDay.exercises.length > 0) {
          workoutsForDay.push({
            name: scheduledDay.name,
            type: scheduledDay.name.toLowerCase().includes('cardio') ? 'Cardio' : 'Strength', 
            duration: 60, // Placeholder duration
            status: 'scheduled'
          });
        } else if (scheduledDay) {
           workoutsForDay.push({
            name: scheduledDay.name,
            type: 'Rest Day',
            duration: 0,
            status: 'completed'
          });
        }
      }

      return (
        <div key={dayOfWeekName} className="xl:flex xl:flex-col xl:flex-1">
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
              <div className="h-24 rounded-lg bg-transparent"></div> // Placeholder for empty day
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
