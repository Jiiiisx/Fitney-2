"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  Wind,
  X,
  ChevronDown,
  AlertCircle,
  Check,
  Loader2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type Workout = {
  id: number;
  name: string;
  type: "Strength" | "Cardio" | "Flexibility" | "Rest Day";
  duration: number; // in minutes
  status: "completed" | "scheduled" | "missed";
  exercises?: string[];
};

const typeConfig = {
  Strength: { icon: <Dumbbell className="w-3.5 h-3.5" />, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800" },
  Cardio: { icon: <HeartPulse className="w-3.5 h-3.5" />, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800" },
  Flexibility: { icon: <Wind className="w-3.5 h-3.5" />, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800" },
  "Rest Day": { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" },
};

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (id: number) => Promise<void> | void;
  onComplete?: () => void;
}

export default function WorkoutCard({ workout, onDelete, onComplete }: WorkoutCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const config = typeConfig[workout.type];
  const hasExercises = workout.exercises && workout.exercises.length > 0;

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
        await onDelete(workout.id);
    } catch (error) {
        setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    if (hasExercises) {
      setIsOpen(!isOpen);
    }
  };

  // Status Styling Logic - More subtle backgrounds
  const statusStyles = {
    missed: "border-red-200 bg-white dark:bg-red-950/10 dark:border-red-900/30",
    completed: "border-green-200 bg-white dark:bg-green-950/10 dark:border-green-900/30",
    scheduled: "border-border bg-card",
  };

  return (
    <div className={cn(
      "relative p-3 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md w-full flex flex-col justify-between",
      statusStyles[workout.status] || statusStyles.scheduled,
      isDeleting && "opacity-50 pointer-events-none"
    )}>
      {/* Header Section */}
      <div 
        className={cn("flex justify-between items-start gap-2", hasExercises && "cursor-pointer")}
        onClick={handleCardClick}
      >
        <div className="flex-1 min-w-0">
            {/* Min-height for title ensures alignment across cards */}
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <h4 
                    className="font-bold text-sm text-foreground leading-snug line-clamp-2 min-h-[2.5rem] break-words"
                  >
                    {workout.name}
                  </h4>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium max-w-[200px] break-words">{workout.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-0.5 shrink-0">
          {hasExercises && (
            <button className="p-1 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                 <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                 />
            </button>
          )}
          <button 
            onClick={handleDeleteClick} 
            disabled={isDeleting}
            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors disabled:opacity-50"
            aria-label="Delete workout"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
          </button>
        </div>
      </div>

      {/* Exercises Expandable */}
      <AnimatePresence>
        {isOpen && hasExercises && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-2"
          >
            <ul className="pt-2 space-y-1.5">
              {workout.exercises?.map((ex, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2 pl-1 border-l-2 border-primary/20">
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Section - Stacked for Consistency */}
      <div className="mt-3 space-y-2">
        {/* Metadata Row - Flex Wrap to handle narrow cards */}
        <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2">
            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-semibold w-fit max-w-full", config.bg, config.color)}>
                <div className="shrink-0">{config.icon}</div>
                <span className="truncate">{workout.type}</span>
            </div>
            {workout.duration > 0 && (
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums whitespace-nowrap">
                    {workout.duration} min
                </span>
            )}
        </div>

        {/* Action Button - Full Width for Alignment */}
        <div className="pt-1">
            {workout.status === 'missed' && onComplete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onComplete(); }} 
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all text-xs font-semibold shadow-sm"
                >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Log Missed
                </button>
            )}
            
            {workout.status === 'scheduled' && onComplete && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onComplete(); }} 
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-xs font-semibold shadow-sm"
                >
                    <Check className="w-3.5 h-3.5" />
                    Complete
                </button>
            )}
            
            {workout.status === 'completed' && (
                <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-100 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    Completed
                </div>
            )}
             {/* Read-only scheduled state (no onComplete or duration only) */}
             {workout.status === 'scheduled' && !onComplete && (
                 <div className="w-full h-[28px]"></div> // Spacer to keep height consistent
             )}
        </div>
      </div>
    </div>
  );
}
