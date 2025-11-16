"use client";

import {
  CheckCircle2,
  Clock,
  Dumbbell,
  HeartPulse,
  Wind,
} from "lucide-react";

// This type is now defined and exported from CalendarGrid.tsx, 
// but we can redefine it here for simplicity as we rebuild.
export type Workout = {
  id: number;
  name: string;
  type: "Strength" | "Cardio" | "Flexibility" | "Rest Day";
  duration: number; // in minutes
  status: "completed" | "scheduled" | "missed";
  exercises?: string[];
};

const statusIcons = {
  completed: <CheckCircle2 className="w-5 h-5 text-success" />,
  scheduled: <Clock className="w-5 h-5 text-warning" />,
  missed: <CheckCircle2 className="w-5 h-5 text-destructive" />, // Using CheckCircle as a placeholder
};

const typeConfig = {
  Strength: { icon: <Dumbbell className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10" },
  Cardio: { icon: <HeartPulse className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/10" },
  Flexibility: { icon: <Wind className="w-4 h-4" />, color: "text-green-500", bg: "bg-green-500/10" },
  "Rest Day": { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-secondary-foreground", bg: "bg-secondary" },
};

// The onDelete prop is removed for now
export default function WorkoutCard({ workout }: { workout: Workout }) {
  const config = typeConfig[workout.type];

  return (
    <div className="bg-background p-3 rounded-lg border border-border">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm text-foreground mb-1 pr-2">
          {workout.name}
        </h4>
        {statusIcons[workout.status]}
      </div>

      {workout.exercises && workout.exercises.length > 0 && (
        <ul className="mt-2 ml-1 space-y-1 text-xs text-muted-foreground">
          {workout.exercises.map((ex, index) => (
            <li key={index} className="pl-2 border-l-2 border-border">
              {ex}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center text-xs text-secondary-foreground space-x-2 mt-3">
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
          {config.icon}
          <span className="ml-1.5">{workout.type}</span>
        </div>
        {workout.duration > 0 && (
          <>
            <span className="text-muted-foreground">•</span>
            <span>{workout.duration} min</span>
          </>
        )}
      </div>
    </div>
  );
}