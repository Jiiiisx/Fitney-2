import { Medal, Footprints, Weight, Wind, Trophy, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Goal } from "../page";

// Helper to get metric-specific details for long-term goals
const getMetricDetails = (metric: string) => {
  switch (metric) {
    case 'distance_run':
      return { icon: <Footprints className="w-6 h-6 text-blue-500" />, color: 'blue' };
    case 'weight_lifted':
      return { icon: <Weight className="w-6 h-6 text-orange-500" />, color: 'orange' };
    case 'yoga_sessions':
      return { icon: <Wind className="w-6 h-6 text-green-500" />, color: 'green' };
    case 'challenges_joined':
      return { icon: <Trophy className="w-6 h-6 text-yellow-500" />, color: 'yellow' };
    default:
      return { icon: <Trophy className="w-6 h-6 text-gray-500" />, color: 'gray' };
  }
};

const colorVariants = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-500' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500' },
    green: { bg: 'bg-green-500', text: 'text-green-500' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
    gray: { bg: 'bg-gray-500', text: 'text-gray-500' },
}

interface LongTermGoalsProps {
    goals: Goal[];
    onEdit: (goal: Goal) => void;
    onDelete: (goalId: number) => void;
}

export default function LongTermGoals({ goals, onEdit, onDelete }: LongTermGoalsProps) {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        Long-Term Goals
      </h2>
      
      {goals.length === 0 ? (
        <div className="bg-card p-6 rounded-2xl border text-center text-muted-foreground">
            <p>No long-term goals set yet.</p>
            <p className="text-sm">Click "Create Goal" to add one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const details = getMetricDetails(goal.metric);
            const progress = (goal.current_value / goal.target_value) * 100;

            const progressText = ['yoga_sessions', 'challenges_joined'].includes(goal.metric)
                ? `${goal.current_value}/${goal.target_value}`
                : `${Math.round(progress)}%`;

            return (
                <div key={goal.id} className="bg-card p-6 rounded-2xl border">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-muted mr-4">
                                {details.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-card-foreground">{goal.title}</h3>
                                {progress >= 50 && (
                                    <div className="flex items-center text-sm text-yellow-600 font-medium mt-1">
                                        <Medal className="w-4 h-4 mr-1" />
                                        {progress >= 100 ? 'Completed!' : 'Halfway there!'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <p className={`font-bold text-2xl mr-2 ${colorVariants[details.color as keyof typeof colorVariants].text}`}>
                                {progressText}
                            </p>
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
                    <div className="w-full bg-muted rounded-full h-3 my-4">
                    <div
                        className={`${colorVariants[details.color as keyof typeof colorVariants].bg} h-3 rounded-full`}
                        style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
                    ></div>
                    </div>
                </div>
            )
          })}
        </div>
      )}
    </section>
  );
}
