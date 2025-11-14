"use client";

import { useState, FormEvent } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type WorkoutType = "strength" | "cardio" | "";

// We might want to pass a function to be called on successful submission
interface LogWorkoutFormProps {
  onSuccess?: () => void;
}

export default function LogWorkoutForm({ onSuccess }: LogWorkoutFormProps) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>("");
  
  // State for form fields
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");

  // State for submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setWorkoutType("");
    setName("");
    setSets("");
    setReps("");
    setWeight("");
    setDuration("");
    setDistance("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let body = {};
    if (workoutType === 'strength') {
      body = { type: 'strength', name, sets: Number(sets), reps: Number(reps), weight: Number(weight) };
    } else if (workoutType === 'cardio') {
      body = { type: 'cardio', name, duration: Number(duration), distance: Number(distance) };
    }

    try {
      const response = await fetch('/api/workouts/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log workout');
      }

      // Success
      console.log('Workout logged successfully!');
      resetForm();
      if (onSuccess) {
        onSuccess(); // e.g., close the modal
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">Log a Workout</DialogTitle>
        <DialogDescription className="text-center">
          What did you accomplish? Select a type to begin.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="workout-type">Workout Type</Label>
          <Select 
            onValueChange={(value: WorkoutType) => setWorkoutType(value)} 
            value={workoutType}
            disabled={isSubmitting}
          >
            <SelectTrigger id="workout-type">
              <SelectValue placeholder="Select a type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Strength Training</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Fields for Strength */}
        {workoutType === "strength" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2">
                <Label htmlFor="exercise-name">Exercise Name</Label>
                <Input id="exercise-name" placeholder="e.g., Bench Press" value={name} onChange={e => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Sets</Label>
                <Input id="sets" type="number" placeholder="3" value={sets} onChange={e => setSets(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input id="reps" type="number" placeholder="10" value={reps} onChange={e => setReps(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="60" value={weight} onChange={e => setWeight(e.target.value)} required disabled={isSubmitting} />
              </div>
            </div>
          </div>
        )}

        {/* Conditional Fields for Cardio */}
        {workoutType === "cardio" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2">
                <Label htmlFor="cardio-activity">Activity</Label>
                <Input id="cardio-activity" placeholder="e.g., Running" value={name} onChange={e => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input id="duration" type="number" placeholder="30" value={duration} onChange={e => setDuration(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input id="distance" type="number" placeholder="5" value={distance} onChange={e => setDistance(e.target.value)} required disabled={isSubmitting} />
              </div>
            </div>
          </div>
        )}
        
        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full bg-gray-800 text-white hover:bg-gray-900" disabled={!workoutType || isSubmitting}>
          {isSubmitting ? 'Logging...' : 'Log Workout'}
        </Button>
      </form>
    </>
  );
}