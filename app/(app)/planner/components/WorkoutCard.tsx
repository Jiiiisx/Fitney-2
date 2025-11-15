import {
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell,
  HeartPulse,
  Wind,
  X,
} from "lucide-react";

export type Workout = {
  id: number; // user_plan_day_id
  name: string;
  type: "Strength" | "Cardio" | "Flexibility" | "Rest Day";
  duration: number; // in minutes
  status: "completed" | "scheduled" | "missed";
  exercises?: string[];
};

const statusIcons = {
  completed: <CheckCircle2 className="w-5 h-5 text-success" />,
  scheduled: <Clock className="w-5 h-5 text-warning" />,
  missed: <XCircle className="w-5 h-5 text-destructive" />,
};

const typeConfig = {
  Strength: { icon: <Dumbbell className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-500/10" },
  Cardio: { icon: <HeartPulse className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-500/10" },
  Flexibility: { icon: <Wind className="w-4 h-4" />, color: "text-green-500", bg: "bg-green-500/10" },
  "Rest Day": { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-secondary-foreground", bg: "bg-secondary" },
};

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (id: number) => void;
}

export default function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const config = typeConfig[workout.type];

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    onDelete(workout.id);
  };

  return (
    <div className="bg-background p-3 rounded-lg transition-transform duration-300 hover:-translate-y-1 cursor-pointer border border-border hover:shadow-md relative">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm text-foreground mb-1 pr-6">
          {workout.name}
        </h4>
        {workout.type !== 'Rest Day' && (
            <button onClick={handleDeleteClick} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors">
                <X size={16} />
            </button>
        )}
      </div>

      {/* Exercise List */}
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