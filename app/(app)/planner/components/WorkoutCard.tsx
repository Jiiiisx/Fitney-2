import {
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell,
  Zap,
  HeartPulse,
} from "lucide-react";

export type Workout = {
  name: string;
  type: "Strength" | "Cardio" | "Flexibility" | "Rest Day";
  duration: number; // in minutes
  status: "completed" | "scheduled" | "missed";
};

const statusIcons = {
  completed: <CheckCircle2 className="w-5 h-5 text-green-400" />,
  scheduled: <Clock className="w-5 h-5 text-yellow-400" />,
  missed: <XCircle className="w-5 h-5 text-red-400" />,
};

const typeIcons = {
  Strength: <Dumbbell className="w-4 h-4 text-gray-400" />,
  Cardio: <HeartPulse className="w-4 h-4 text-gray-400" />,
  Flexibility: <Zap className="w-4 h-4 text-gray-400" />,
  "Rest Day": <CheckCircle2 className="w-4 h-4 text-gray-400" />,
};

export default function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <div className="bg-gray-100 p-3 rounded-lg transition-colors hover:bg-gray-200">
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-sm text-gray-800 mb-1">
          {workout.name}
        </h4>
        {statusIcons[workout.status]}
      </div>
      <div className="flex items-center text-xs text-gray-500 space-x-2 mt-2">
        <div className="flex items-center">
          {typeIcons[workout.type]}
          <span className="ml-1.5">{workout.type}</span>
        </div>
        {workout.duration > 0 && (
          <>
            <span>•</span>
            <span>{workout.duration} min</span>
          </>
        )}
      </div>
    </div>
  );
}
