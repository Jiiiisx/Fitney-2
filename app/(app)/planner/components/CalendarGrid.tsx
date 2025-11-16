"use client";

import { useEffect, useState } from 'react';
import WorkoutCard, { Workout } from "./WorkoutCard";
import { addDays, format, parseISO } from 'date-fns';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Interface for the data structure returned by the GET /api/users/me/active-plan
interface ActivePlan {
  id: number;
  name: string;
  start_date: string;
  schedule: {
    id: number;
    day_number: number;
    name: string;
    description: string | null;
    date: string;
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
  onPlanChange: () => void;
}

// Helper to get the 7-day rolling week view
const getWeekDays = () => {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
};

export default function CalendarGrid({ onChooseProgramClick, planVersion, onPlanChange }: CalendarGridProps) {
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const weekDays = getWeekDays();

  const fetchActivePlan = async () => {
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
  };

  const handleDelete = async (dayId: number) => {
    console.log("handleDelete called with dayId:", dayId);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await fetch(`/api/users/me/active-plan/days/${dayId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error('Failed to delete the workout.');
      } else {
        onPlanChange();
      }
    } catch (error) {
      console.error('An error occurred while deleting the workout:', error);
    }
  };

  const handleSetRestDay = async (date: Date) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await fetch('/api/planner/day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Rest Day',
          type: 'Rest Day',
          date: format(date, 'yyyy-MM-dd'),
          duration: 0,
        }),
      });

      if (!response.ok) {
        console.error('Failed to set rest day.');
      } else {
        onPlanChange();
      }
    } catch (error) {
      console.error('An error occurred while setting rest day:', error);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, [planVersion]);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8 col-span-full">Loading your plan...</div>;
    }

    if (error) {
      return <div className="text-center text-red-500 p-8 col-span-full">{error}</div>;
    }

    if (!plan || !plan.schedule) {
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
    
    return weekDays.map((dayDate, index) => {
      const dayOfWeekName = format(dayDate, 'EEEE');
      const dateString = format(dayDate, 'yyyy-MM-dd');
      
      const allEventsForDay = plan.schedule.filter(day => 
        day.date && format(parseISO(day.date), 'yyyy-MM-dd') === dateString
      );

      let eventsToShow = allEventsForDay.filter(day => day.name !== 'Rest Day');
      if (eventsToShow.length === 0 && allEventsForDay.length > 0) {
        eventsToShow = allEventsForDay; // Show rest day if it's the only thing
      }

      const workoutsForDay: Workout[] = eventsToShow.map(scheduledDay => {
          let workoutType: Workout['type'] = 'Strength';
          if (scheduledDay.name === 'Rest Day') {
            workoutType = 'Rest Day';
          } else if (scheduledDay.description?.toLowerCase().includes('cardio')) {
            workoutType = 'Cardio';
          } else if (scheduledDay.description?.toLowerCase().includes('flexibility')) {
            workoutType = 'Flexibility';
          }

          return {
            id: scheduledDay.id,
            name: scheduledDay.name,
            type: workoutType,
            duration: 60,
            status: workoutType === 'Rest Day' ? 'completed' : 'scheduled',
            exercises: scheduledDay.exercises?.map(ex => 
              `${ex.name} - ${ex.sets ? `${ex.sets} sets x ` : ''}${ex.reps ? `${ex.reps} reps` : ''}${ex.duration_seconds ? `${ex.duration_seconds}s` : ''}`
            ) || []
          };
        });

      return (
        <div key={index} className="xl:flex xl:flex-col xl:flex-1">
          <h3 className="font-semibold text-sm text-center text-secondary-foreground mb-3">
            {dayOfWeekName}
            <span className="block text-xs">{format(dayDate, 'd MMM')}</span>
          </h3>
          <div className="space-y-3 xl:flex-grow">
            {workoutsForDay.length > 0 ? (
              workoutsForDay.map((workout, idx) => (
                <WorkoutCard key={idx} workout={workout} onDelete={handleDelete} />
              ))
            ) : (
              <div className="h-24 rounded-lg bg-muted/40 flex items-center justify-center">
                <Button variant="ghost" size="sm" onClick={() => handleSetRestDay(dayDate)}>
                  Set as Rest Day
                </Button>
              </div>
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
