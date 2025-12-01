import { Flame, Droplet, Dumbbell, Zap, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Goal } from "../page";

// Helper to get metric-specific details
const getMetricDetails = (metric: string) => {
  switch (metric) {
    case 'workout_frequency':
      return { icon: Dumbbell, color: 'orange', unit: 'workouts' };
    case 'calories_burned':
      return { icon: Flame, color: 'red', unit: 'kcal' };
    case 'active_minutes':
      return { icon: Zap, color: 'green', unit: 'min' };
    case 'hydration':
      return { icon: Droplet, color: 'blue', unit: 'glasses' };
    default:
      return { icon: Dumbbell, color: 'gray', unit: '' };
  }
};

const ProgressRing = ({ radius, stroke, progress, color }: { radius: number; stroke: number; progress: number; color: string; }) => {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
  
    return (
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle stroke="currentColor" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} className="text-muted" />
        <circle stroke={color} fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + " " + circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
      </svg>
    );
};

const bgColorVariants = {
    orange: 'bg-orange-400',
    red: 'bg-red-400',
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    gray: 'bg-gray-400'
};

const ProgressBar = ({ progress, color }: { progress: number, color: keyof typeof bgColorVariants }) => (
    <div className="w-full bg-muted rounded-full h-2.5 mt-3">
        <div className={`${bgColorVariants[color] || bgColorVariants.gray} h-2.5 rounded-full`} style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
    </div>
);

const ProgressDots = ({ current, total, color }: { current: number, total: number, color: keyof typeof bgColorVariants }) => (
    <div className="flex items-center space-x-2 mt-3">
        {[...Array(total)].map((_, i) => (
            <div key={i} className="w-full h-2 rounded-full bg-muted">
                <div className={`h-2 rounded-full ${i < current ? (bgColorVariants[color] || bgColorVariants.gray) : 'bg-transparent'}`} />
            </div>
        ))}
    </div>
);

interface PersonalGoalsProps {
    goals: Goal[];
    onEdit: (goal: Goal) => void;
    onDelete: (goalId: number) => void;
}

export default function PersonalGoals({ goals, onEdit, onDelete }: PersonalGoalsProps) {
    if (goals.length === 0) {
        return (
            <div className="bg-card p-6 rounded-2xl border text-center text-muted-foreground">
                <p>No weekly goals set yet.</p>
                <p className="text-sm">Click "Create Goal" to add one.</p>
            </div>
        )
    }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {goals.map((goal) => {
        const details = getMetricDetails(goal.metric);
        const Icon = details.icon;
        const progressPercentage = (goal.current_value / goal.target_value) * 100;

        return (
          <div key={goal.id} className="bg-card p-6 rounded-2xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">{goal.title}</h3>
              <div className="flex items-center">
                <Icon className={`w-6 h-6 text-${details.color}-400 mr-2`} />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(goal)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <>
                    <p className="text-2xl font-bold text-card-foreground">
                        {goal.current_value} / {goal.target_value}{' '}
                        <span className="text-base font-normal text-muted-foreground">{details.unit}</span>
                    </p>
                    {goal.metric === 'hydration' ? (
                        <ProgressDots current={goal.current_value} total={goal.target_value} color={details.color} />
                    ) : (
                        <ProgressBar progress={progressPercentage} color={details.color} />
                    )}
                </>
          </div>
        );
      })}
    </section>
  );
}
