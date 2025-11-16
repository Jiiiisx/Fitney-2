"use client";

import { useState, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  Dumbbell,
  Plus,
  X,
} from "lucide-react";

interface AddWorkoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanChange: () => void;
}

type ExerciseInput = {
  name: string;
  sets: string;
  reps: string;
};

export function AddWorkoutForm({ open, onOpenChange, onPlanChange }: AddWorkoutFormProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [date, setDate] = useState('');
  const [exercises, setExercises] = useState<ExerciseInput[]>([{ name: '', sets: '', reps: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExerciseChange = (index: number, field: keyof ExerciseInput, value: string) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const addExerciseRow = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '' }]);
  };

  const removeExerciseRow = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workoutName || !date || exercises.some(ex => !ex.name)) {
      setError('Please fill out workout name, date, and at least one exercise name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const response = await fetch('/api/planner/day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: workoutName,
          type: 'Strength', // Defaulting to strength as type is now implicit
          date,
          exercises: exercises.filter(ex => ex.name), // Filter out empty exercise rows
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add workout.');
      }

      onPlanChange();
      onOpenChange(false);
      // Reset form
      setWorkoutName('');
      setDate('');
      setExercises([{ name: '', sets: '', reps: '' }]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold">Plan a New Workout</DialogTitle>
          <DialogDescription>Build your custom workout session.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input id="workout-name" placeholder="e.g., Leg Day" value={workoutName} onChange={(e) => setWorkoutName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workout-date">Date</Label>
                <Input id="workout-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            
            <hr/>

            {/* Dynamic Exercises */}
            <div className="grid gap-4">
              <Label>Exercises</Label>
              {exercises.map((ex, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="grid gap-1.5 flex-grow">
                    <Label htmlFor={`ex-name-${index}`} className="text-xs">Exercise Name</Label>
                    <Input id={`ex-name-${index}`} placeholder="e.g., Squats" value={ex.name} onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} />
                  </div>
                  <div className="grid gap-1.5 w-20">
                    <Label htmlFor={`ex-sets-${index}`} className="text-xs">Sets</Label>
                    <Input id={`ex-sets-${index}`} placeholder="3" value={ex.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)} />
                  </div>
                  <div className="grid gap-1.5 w-24">
                    <Label htmlFor={`ex-reps-${index}`} className="text-xs">Reps</Label>
                    <Input id={`ex-reps-${index}`} placeholder="8-12" value={ex.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeExerciseRow(index)} disabled={exercises.length <= 1}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addExerciseRow} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Adding...' : 'Add to Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}