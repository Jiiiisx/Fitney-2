import { Dumbbell, Zap, Heart, Award, Calendar } from "lucide-react";
import React from "react";
import { format } from "date-fns";

type WorkoutLog = {
  id: number;
  name: string;
  type: string;
  date: string; // API sends ISO string
  sets?: number;
  reps?: string;
  weightKg?: string;
  durationMin?: number;
  distanceKm?: string;
};

interface RecentActivityListProps {
  workouts?: WorkoutLog[];
  isLoading?: boolean;
}

const workoutIcons: Record<string, React.ReactNode> = {
  Strength: <Dumbbell className="w-5 h-5 text-white" />,
  Cardio: <Zap className="w-5 h-5 text-white" />,
  Weightlifting: <Dumbbell className="w-5 h-5 text-white" />,
  Flexibility: <Heart className="w-5 h-5 text-white" />,
};

const workoutColors: Record<string, string> = {
  Strength: "bg-blue-500",
  Cardio: "bg-yellow-500",
  Weightlifting: "bg-indigo-500",
  Flexibility: "bg-pink-500",
};

const ActivityCard = ({ workout }: { workout: WorkoutLog }) => {
  const type = workout.type || "Strength";
  const icon = workoutIcons[type] || <Dumbbell className="w-5 h-5 text-white" />;
  const color = workoutColors[type] || "bg-gray-500";

  // Generate detail string
  let details = "";
  if (type === "Strength" || type === "Weightlifting") {
    details = `${workout.sets || 0} sets x ${workout.reps || 0} reps`;
    if (workout.weightKg) details += ` @ ${workout.weightKg}kg`;
  } else {
    if (workout.distanceKm) details += `${workout.distanceKm} km`;
    if (workout.durationMin) details += `${details ? ' in ' : ''}${workout.durationMin} mins`;
  }

  return (
    <div className="bg-card/60 dark:bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
        <h4 className="font-bold text-foreground truncate">{workout.name}</h4>
        <p className="text-sm text-muted-foreground">{details || "No details"}</p>
      </div>
      <p className="text-xs text-muted-foreground/70 mt-3 text-right">
        {format(new Date(workout.date), "MMM d, h:mm a")}
      </p>
    </div>
  );
};

export default function RecentActivityList({ workouts, isLoading }: RecentActivityListProps) {
  if (isLoading) {
    return (
      <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 animate-pulse">
        <div className="h-8 w-1/3 bg-muted rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted rounded-2xl"></div>
          <div className="h-32 bg-muted rounded-2xl"></div>
          <div className="h-32 bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-foreground mb-4">Recent Entries</h2>
      {workouts && workouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <ActivityCard key={workout.id} workout={workout} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No recent activities found.</p>
            <p className="text-sm text-muted-foreground/50">Start logging your workouts to see them here!</p>
        </div>
      )}
    </div>
  );
}