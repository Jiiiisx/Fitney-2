import {
  CheckCircle2,
  XCircle,
  Clock,
  Dumbbell,
  HeartPulse,
  Wind, // Replaced Zap for better Flexibility icon
} from "lucide-react";

export type Workout = {
  name: string;
  type: "Strength" | "Cardio" | "Flexibility" | "Rest Day";
  duration: number; // in minutes
  status: "completed" | "scheduled" | "missed";
};

const statusIcons = {
  completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  scheduled: <Clock className="w-5 h-5 text-yellow-500" />,
  missed: <XCircle className="w-5 h-5 text-red-500" />,
};

const typeConfig = {
  Strength: { icon: <Dumbbell className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-50" },
  Cardio: { icon: <HeartPulse className="w-4 h-4" />, color: "text-red-500", bg: "bg-red-50" },
  Flexibility: { icon: <Wind className="w-4 h-4" />, color: "text-green-500", bg: "bg-green-50" },
  "Rest Day": { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-gray-500", bg: "bg-gray-100" },
};

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const config = typeConfig[workout.type];

  return (
    <div className="bg-gray-50 p-3 rounded-lg transition-transform duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 hover:shadow-md">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm text-gray-800 mb-1 pr-2">
          {workout.name}
        </h4>
        {statusIcons[workout.status]}
      </div>
      <div className="flex items-center text-xs text-gray-500 space-x-2 mt-2">
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
          {config.icon}
          <span className="ml-1.5">{workout.type}</span>
        </div>
        {workout.duration > 0 && (
          <>
            <span className="text-gray-300">•</span>
            <span>{workout.duration} min</span>
          </>
        )}
      </div>
    </div>
  );
}