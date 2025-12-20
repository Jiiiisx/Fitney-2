"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LogWorkoutForm from "./LogWorkoutForm";

interface LogWorkoutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogWorkoutModal({ isOpen, onOpenChange }: LogWorkoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
          <DialogDescription>
            Record your physical activity to track your progress and gain XP.
          </DialogDescription>
        </DialogHeader>
        
        <LogWorkoutForm 
          onSuccess={() => onOpenChange(false)} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}