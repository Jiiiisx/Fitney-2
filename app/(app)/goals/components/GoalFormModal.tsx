"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Goal } from "../page";

interface GoalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (savedGoal: Goal) => void;
  goalToEdit?: Goal | null;
}

// Pre-defined metrics for user to choose from
const metrics = {
    weekly: [
        { value: 'workout_frequency', label: 'Workout Frequency' },
        { value: 'calories_burned', label: 'Calories Burned' },
        { value: 'active_minutes', label: 'Active Minutes' },
        { value: 'hydration', label: 'Hydration (glasses)' },
    ],
    long_term: [
        { value: 'distance_run', label: 'Distance Run (km)' },
        { value: 'weight_lifted', label: 'Weight Lifted (kg)' },
        { value: 'yoga_sessions', label: 'Yoga Sessions' },
        { value: 'challenges_joined', label: 'Challenges Joined' },
    ]
};

export function GoalFormModal({ open, onOpenChange, onSave, goalToEdit }: GoalFormModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<'weekly' | 'long_term'>('weekly');
  const [metric, setMetric] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!goalToEdit;

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setCategory(goalToEdit.category);
      setMetric(goalToEdit.metric);
      setTarget(String(goalToEdit.target_value));
    } else {
      // Reset form for create mode
      setTitle('');
      setCategory('weekly');
      setMetric('');
      setTarget('');
    }
  }, [goalToEdit, open]); //Rerun when modal is opened

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const url = isEditMode ? `/api/goals/${goalToEdit.id}` : '/api/goals';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          metric,
          target_value: Number(target),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} goal`);
      }

      const savedGoal = await response.json();
      onSave(savedGoal); // Pass the saved goal back to the parent
      onOpenChange(false); // Close the modal

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Goal' : 'Create a New Goal'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of your goal.' : 'Define your new goal. Make it specific and measurable.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="col-span-3" placeholder="e.g., Run 5k" required />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select onValueChange={(v) => setCategory(v as any)} value={category} disabled={isEditMode}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="long_term">Long-Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric" className="text-right">
                Metric
              </Label>
               <Select onValueChange={setMetric} value={metric} disabled={isEditMode}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metrics[category].map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target" className="text-right">
                Target
              </Label>
              <Input id="target" type="number" value={target} onChange={e => setTarget(e.target.value)} className="col-span-3" placeholder="e.g., 5" required />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
