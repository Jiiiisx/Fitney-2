"use client";

import { useState } from "react";
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
import { Dumbbell } from "lucide-react";

type WorkoutType = "strength" | "cardio" | "";

export default function LogWorkoutForm() {
  const [workoutType, setWorkoutType] = useState<WorkoutType>("");

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">Log a Workout</DialogTitle>
        <DialogDescription className="text-center">
          What did you accomplish? Select a type to begin.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="workout-type">Workout Type</Label>
          <Select onValueChange={(value: WorkoutType) => setWorkoutType(value)}>
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
                <Input id="exercise-name" placeholder="e.g., Bench Press" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Sets</Label>
                <Input id="sets" type="number" placeholder="3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">Reps</Label>
                <Input id="reps" type="number" placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="60" />
              </div>
            </div>
          </div>
        )}

        {/* Conditional Fields for Cardio */}
        {workoutType === "cardio" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2">
                <Label htmlFor="cardio-activity">Activity</Label>
                <Input id="cardio-activity" placeholder="e.g., Running" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input id="duration" type="number" placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance (km)</Label>
                <Input id="distance" type="number" placeholder="5" />
              </div>
            </div>
          </div>
        )}
        
        <Button className="w-full bg-gray-800 text-white hover:bg-gray-900 pt-4" disabled={!workoutType}>
          Log Workout
        </Button>
      </div>
    </>
  );
}