"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Flame, Wind, CheckCircle2 } from "lucide-react";

// Define the structure of a single workout log from our API
interface WorkoutLog {
  id: number;
  type: 'Strength' | 'Cardio' | 'Flexibility' | 'Rest Day';
  name: string;
  duration: number; // in minutes
  calories: number;
  date: string; // Formatted as 'YYYY-MM-DD'
}

// A helper to format the details of a workout log
const formatDetails = (log: WorkoutLog) => {
  if (log.type === 'Rest Day') {
    return 'A well-deserved rest day.';
  }
  return `${log.duration} min / ${log.calories} kcal`;
};

// A helper to format the date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const LogEntry = ({ log }: { log: WorkoutLog }) => (
  <div className="bg-card p-6 rounded-2xl">
    <div className="border-b border-border pb-4 mb-4">
      <p className="text-sm font-semibold text-primary">{formatDate(log.date)}</p>
      <h3 className="text-2xl font-bold text-foreground mt-1 flex items-center">
        {log.type === 'Strength' ? <Dumbbell className="w-6 h-6 mr-3 text-blue-500" /> : 
         log.type === 'Cardio' ? <Flame className="w-6 h-6 mr-3 text-red-500" /> :
         log.type === 'Flexibility' ? <Wind className="w-6 h-6 mr-3 text-green-500" /> :
         <CheckCircle2 className="w-6 h-6 mr-3 text-gray-500" />}
        {log.name}
      </h3>
    </div>
    <div className="mb-4">
      <ul className="space-y-2">
        <li className="flex justify-between items-center text-sm bg-background p-3 rounded-lg">
          <span className="font-medium text-foreground">Details</span>
          <span className="font-mono text-secondary-foreground">{formatDetails(log)}</span>
        </li>
      </ul>
    </div>
  </div>
);

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
    return <div className="text-center p-8">Loading workout history...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  }

  if (logs.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-2xl">
        <h3 className="text-lg font-semibold">No Workouts Logged Yet</h3>
        <p className="text-muted-foreground mt-2">
          Click the "Log Workout" button to start tracking your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {logs.map((log) => (
        <LogEntry key={log.id} log={log} />
      ))}
    </div>
  );
}
