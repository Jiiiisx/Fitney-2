"use client";

import {
  Flame,
  Droplet,
  Dumbbell,
  Zap,
  MoreHorizontal,
  Footprints,
  Weight,
  Wind,
  Trophy,
  Medal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Goal } from "../page";

// Combined helper to get metric-specific details for ANY goal
const getMetricDetails = (metric: string) => {
  // Weekly goal metrics
  switch (metric) {
    case "workout_frequency":
      return { icon: Dumbbell, color: "orange", unit: "workouts" };
    case "calories_burned":
      return { icon: Flame, color: "red", unit: "kcal" };
    case "active_minutes":
      return { icon: Zap, color: "green", unit: "min" };
    case "hydration":
      return { icon: Droplet, color: "blue", unit: "glasses" };
    // Long-term goal metrics
    case "distance_run":
      return { icon: Footprints, color: "blue", unit: "km" };
    case "weight_lifted":
      return { icon: Weight, color: "orange", unit: "kg" };
    case "yoga_sessions":
      return { icon: Wind, color: "green", unit: "sessions" };
    case "challenges_joined":
      return { icon: Trophy, color: "yellow", unit: "challenges" };
    default:
      return { icon: Trophy, color: "gray", unit: "" };
  }
};

const bgColorVariants = {
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-500'
};
const textColorVariants = {
    orange: 'text-orange-500',
    red: 'text-red-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500',
    gray: 'text-gray-500'
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


interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const details = getMetricDetails(goal.metric);
  const Icon = details.icon;
  const progressPercentage = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
  const colorKey = details.color as keyof typeof bgColorVariants;

  return (
    <Card className="p-4 rounded-2xl border flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-card-foreground text-md">{goal.title}</h3>
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
      
      <div className="mt-auto">
        <p className="text-2xl font-bold text-card-foreground">
            {goal.current_value} / {goal.target_value}{' '}
            <span className="text-base font-normal text-muted-foreground">{details.unit}</span>
        </p>
        {goal.metric === 'hydration' ? (
            <ProgressDots current={goal.current_value} total={goal.target_value} color={colorKey} />
        ) : (
            <ProgressBar progress={progressPercentage} color={colorKey} />
        )}
      </div>

      {progressPercentage >= 100 && (
          <div className="flex items-center text-sm text-green-600 font-medium mt-3">
              <Medal className="w-4 h-4 mr-1.5" />
              Goal Completed!
          </div>
      )}
    </Card>
  );
}