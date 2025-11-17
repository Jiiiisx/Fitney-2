"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  Wind,
  X,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type Workout = {
  id: number;
  name: string;
  type: "Strength" | "Cardio" | "Flexibility" | "Rest Day";
  duration: number; // in minutes
  status: "completed" | "scheduled" | "missed";
  exercises?: string[];
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
  const [isOpen, setIsOpen] = useState(false);
  const config = typeConfig[workout.type];
  const hasExercises = workout.exercises && workout.exercises.length > 0;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(workout.id);
  };

  const handleCardClick = () => {
    if (hasExercises) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="bg-background p-3 rounded-lg border border-border group">
      <div 
        className={`flex justify-between items-start ${hasExercises ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
      >
        <h4 className="font-bold text-sm text-foreground mb-1 pr-6">
          {workout.name}
        </h4>
        
        <div className="flex items-center space-x-2">
          {hasExercises && (
            <ChevronDown
              size={18}
              className={`text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
          <button 
            onClick={handleDeleteClick} 
            className="text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
            aria-label="Delete workout"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && hasExercises && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ul className="space-y-1 text-xs text-muted-foreground">
              {workout.exercises.map((ex, index) => (
                <li key={index} className="pl-2 border-l-2 border-border">
                  {ex}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

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
