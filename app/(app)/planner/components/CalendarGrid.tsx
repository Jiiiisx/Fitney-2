"use client";

import { useEffect, useState } from 'react';
import WorkoutCard, { Workout } from "./WorkoutCard";
import { addDays, format, parseISO } from 'date-fns';
import { fetchWithAuth } from '@/app/lib/fetch-helper';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

// Interface for the data structure returned by the GET /api/users/profile/active-plan
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
    is_completed: boolean; // Add this field
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
  filters: string[];
}

// Helper to get the 7-day rolling week view
const getWeekDays = () => {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
};

export default function CalendarGrid({ onChooseProgramClick, planVersion, onPlanChange, filters }: CalendarGridProps) {
  const [plan, setPlan] = useState<ActivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const weekDays = getWeekDays();

  const fetchActivePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/users/profile/active-plan');
      setPlan(data);
    } catch (err: any) {
       // If 404, it means no active plan, which is valid state (not error)
       if (err.message && err.message.includes('404')) {
            setPlan(null);
            return;
       }
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dayId: number) => {
    console.log("handleDelete called with dayId:", dayId);
    try {
      await fetchWithAuth(`/api/users/profile/active-plan/days/${dayId}`, {
        method: 'DELETE',
      });
      // Success
      onPlanChange();
    } catch (error: any) {
        if (error.message && error.message.includes('404')) {
             // Already deleted
             onPlanChange();
             return;
        }
      console.error('An error occurred while deleting the workout:', error);
    }
  };

  const handleCompleteWorkout = async (workout: Workout, date: Date) => {
    try {
      const toastId = toast.loading('Logging workout...');

      const data = await fetchWithAuth('/api/workouts/log', {
        method: 'POST',
        body: JSON.stringify({
            name: workout.name,
            type: workout.type === 'Rest Day' ? 'Rest' : workout.type,
            duration: workout.duration,
            date: format(date, 'yyyy-MM-dd'),
            sets: 1, 
            reps: '1',
        })
      });

      toast.success(`Workout logged! +${data.xpGained} XP`, { id: toastId });
      
      onPlanChange(); // Refresh grid
    } catch (error) {
        console.error(error);
        toast.error('Failed to complete workout');
    }
  };

  const handleSetRestDay = async (date: Date) => {
    try {
      await fetchWithAuth('/api/planner/day', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Rest Day',
          type: 'Rest Day',
          date: format(date, 'yyyy-MM-dd'),
          duration: 0,
        }),
      });
      // Success
      onPlanChange();
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
      const displayDate = format(dayDate, 'd MMM');
      const isToday = format(new Date(), 'yyyy-MM-dd') === dateString;
      const todayDateString = format(new Date(), 'yyyy-MM-dd');
      
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

          // --- LOGIC STATUS BARU ---
          let status: Workout['status'] = 'scheduled';
          
          if (scheduledDay.is_completed) {
            status = 'completed';
          } else if (workoutType === 'Rest Day') {
            // Rest Day dianggap completed jika hari ini atau lewat (karena 'doing' rest day = diam)
            if (dateString <= todayDateString) {
                status = 'completed';
            }
          } else if (dateString < todayDateString) {
            // Jika BUKAN rest day, dan tanggal sudah lewat, dan BELUM completed -> Missed
            status = 'missed';
          }
          // -------------------------

          return {
            id: scheduledDay.id,
            name: scheduledDay.name,
            type: workoutType,
            duration: 60,
            status: status,
            exercises: scheduledDay.exercises?.map(ex => 
              `${ex.name} - ${ex.sets ? `${ex.sets} sets x ` : ''}${ex.reps ? `${ex.reps} reps` : ''}${ex.duration_seconds ? `${ex.duration_seconds}s` : ''}`
            ) || []
          };
        });

      const filteredWorkouts = filters.length > 0 
        ? workoutsForDay.filter(workout => filters.includes(workout.type))
        : workoutsForDay;

      return (
        <div key={index} className="xl:flex xl:flex-col xl:flex-1 min-w-[140px]">
          {/* Day Header */}
          <div className={`text-center mb-4 pb-2 border-b-2 ${isToday ? 'border-primary' : 'border-transparent'}`}>
            <h3 className={`font-bold text-sm ${isToday ? 'text-primary' : 'text-foreground'}`}>
              {dayOfWeekName}
            </h3>
            <span className={`text-xs font-medium ${isToday ? 'text-primary/80' : 'text-muted-foreground'}`}>
              {displayDate}
            </span>
          </div>

          {/* Workouts Container */}
          <div className="space-y-3 xl:flex-grow h-full min-h-[200px] rounded-xl bg-muted/20 p-2">
            {filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout, idx) => (
                <WorkoutCard 
                    key={idx} 
                    workout={workout} 
                    onDelete={handleDelete} 
                    onComplete={() => handleCompleteWorkout(workout, dayDate)} // PASS PROP BARU
                />
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-2 opacity-0 hover:opacity-100 transition-opacity group">
                 <p className="text-xs text-muted-foreground mb-2">No workout</p>
                 <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleSetRestDay(dayDate)}>
                  Set Rest
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">
            This Week's Plan
        </h2>
      </div>
      
      {/* Scrollable Container for Mobile/Tablet */}
      <div className="pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:flex xl:flex-row gap-6">
            {renderContent()}
        </div>
      </div>
    </div>
  );
}

