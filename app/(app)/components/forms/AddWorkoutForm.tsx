"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
  Zap,
  Coffee,
  Plus,
} from "lucide-react";

interface AddWorkoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWorkoutForm({ open, onOpenChange }: AddWorkoutFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl border-neutral-200/70">
        <DialogHeader className="text-left">
          <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
            Plan a New Workout
          </DialogTitle>
          <DialogDescription className="text-gray-500 pt-1">
            What challenge are you taking on next?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Workout Name */}
          <div className="grid gap-2">
            <Label htmlFor="workout-name" className="font-medium text-gray-700">
              Workout Name
            </Label>
            <div className="relative">
              <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="workout-name"
                placeholder="e.g., Morning Run, Leg Day"
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Workout Type */}
            <div className="grid gap-2">
              <Label htmlFor="workout-type" className="font-medium text-gray-700">
                Type
              </Label>
              <Select>
                <SelectTrigger id="workout-type" className="h-11">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardio">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Cardio</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="strength">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span>Strength</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="flexibility">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span>Flexibility</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rest">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-orange-500" />
                      <span>Rest Day</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="grid gap-2">
              <Label htmlFor="duration" className="font-medium text-gray-700">
                Duration
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 45"
                  className="pl-10 h-11"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label htmlFor="workout-date" className="font-medium text-gray-700">
              Date
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input id="workout-date" type="date" className="pl-10 h-11" />
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="ghost" className="text-gray-600">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold h-11 px-6 rounded-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add to Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
