"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import LogWorkoutForm from "./LogWorkoutForm";

interface LogWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogWorkoutModal({ open, onOpenChange }: LogWorkoutModalProps) {
  // This component acts as a wrapper to control the Dialog state
  // and renders the actual form inside.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl border-neutral-200/70">
        <LogWorkoutForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
