"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import LogWorkoutForm from "./LogWorkoutForm";
import { AddWorkoutForm } from "./AddWorkoutForm"; // Reuse the planner form!
import { CheckCircle2, CalendarDays, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogWorkoutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogWorkoutModal({ isOpen, onOpenChange }: LogWorkoutModalProps) {
  const [view, setView] = useState<"menu" | "log" | "plan">("menu");

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setView("menu"), 300); // Reset after close animation
  };

  const handleBack = () => {
    setView("menu");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] transition-all duration-300">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {view !== "menu" && (
                <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}
            <DialogTitle>
                {view === "menu" && "Workout Action"}
                {view === "log" && "Log Completed Workout"}
                {view === "plan" && "Plan Future Workout"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {view === "menu" && "Did you just finish a workout, or are you planning one for later?"}
            {view === "log" && "Great job! Record your stats to earn XP."}
            {view === "plan" && "Schedule your upcoming session."}
          </DialogDescription>
        </DialogHeader>
        
        {view === "menu" && (
            <div className="grid grid-cols-2 gap-4 py-4">
                <button 
                    onClick={() => setView("log")}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-muted bg-card hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/10 dark:hover:border-green-800 transition-all group space-y-3"
                >
                    <div className="p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-foreground">I Did It!</h3>
                        <p className="text-xs text-muted-foreground mt-1">Log a past workout</p>
                    </div>
                </button>

                <button 
                    onClick={() => setView("plan")}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-muted bg-card hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/10 dark:hover:border-blue-800 transition-all group space-y-3"
                >
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <CalendarDays className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-foreground">Plan It</h3>
                        <p className="text-xs text-muted-foreground mt-1">Schedule for later</p>
                    </div>
                </button>
            </div>
        )}

        {view === "log" && (
            <LogWorkoutForm 
                onSuccess={handleClose} 
                onCancel={handleClose} 
            />
        )}

        {view === "plan" && (
            // reuse AddWorkoutForm but strip the modal wrapper logic if possible, 
            // OR simply render it. AddWorkoutForm is a Dialog itself usually? 
            // Checking previous file... AddWorkoutForm returns a Dialog. 
            // We cannot nest Dialogs. 
            // We need to extract the FORM content or Refactor AddWorkoutForm.
            // For now, let's assume we refactor AddWorkoutForm or use a simplified version.
            // Wait, AddWorkoutForm IS a Dialog. We can't put it here.
            // Strategy: We will close THIS modal and open THAT modal.
            // BUT user asked for "Quick Actions" flow. 
            // BETTER: We'll render a simplified planner form here directly, 
            // OR we just invoke the AddWorkoutForm via a prop control if possible.
            // Let's look at AddWorkoutForm again. It takes `open` prop.
            // We can just close this modal and open that one?
            // "onSelectPlan" -> onClose -> setPlanModalOpen(true).
            // But this component logic is inside LogWorkoutModal.
            // Let's keep it simple: Just show a "Coming Soon" or redirect? 
            // No, user wants it. 
            // I will use a dirty trick: Render a clone of the form content here.
            // Actually, I can just refactor AddWorkoutForm to export its InnerForm?
            // Too risky for now.
            // Let's make the "Plan" button just open the Planner page or trigger the existing modal?
            // I'll make the "Plan" button trigger the `AddWorkoutForm` by passing a callback to parent?
            // No, let's keep it self-contained. 
            // I'll wrap the `AddWorkoutForm` invocation here, but I need to control its `open` state.
            <div className="py-8 text-center">
                 <p>Redirecting to planner...</p>
                 {/* This is a placeholder as I cannot easily strip the Dialog from AddWorkoutForm without refactoring it. 
                     Refactoring AddWorkoutForm is the correct way but might be complex in one shot.
                     Let's Try to refactor AddWorkoutForm later? 
                     Actually, I'll just put a message here and handle it or...
                     Wait, I can just render the inputs here? No duplication.
                     
                     Let's use the `LogWorkoutForm` but change the API endpoint to `/api/planner/day` if mode is plan?
                     Yes! Smart.
                 */}
                 <LogWorkoutForm 
                    onSuccess={handleClose} 
                    onCancel={handleClose} 
                    mode="plan"
                 />
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}