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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  Dumbbell,
  Heart,
  Wind as FlexibilityIcon,
  Plus,
} from "lucide-react";

interface AddWorkoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanChange: () => void;
}

export function AddWorkoutForm({ open, onOpenChange, onPlanChange }: AddWorkoutFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !type || !date) {
      setError('Please fill out all required fields.');
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
          name,
          type,
          date,
          duration: Number(duration) || 0,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to add workout.');
      }

      onPlanChange();
      onOpenChange(false);
      setName('');
      setType('');
      setDuration('');
      setDate('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold">Plan a New Workout</DialogTitle>
          <DialogDescription>What challenge are you taking on next?</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workout-name">Workout Name</Label>
              <div className="relative">
                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="workout-name"
                  placeholder="e.g., Morning Run, Leg Day"
                  className="pl-10 h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="workout-type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="workout-type" className="h-11">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cardio"><div className="flex items-center gap-2"><Heart className="h-4 w-4 text-red-500" /><span>Cardio</span></div></SelectItem>
                    <SelectItem value="Strength"><div className="flex items-center gap-2"><Dumbbell className="h-4 w-4 text-blue-500" /><span>Strength</span></div></SelectItem>
                    <SelectItem value="Flexibility"><div className="flex items-center gap-2"><FlexibilityIcon className="h-4 w-4 text-green-500" /><span>Flexibility</span></div></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 45"
                    className="pl-10 h-11"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">min</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workout-date">Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input id="workout-date" type="date" className="pl-10 h-11" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Adding...' : <><Plus className="h-5 w-5 mr-2" /> Add to Plan</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
