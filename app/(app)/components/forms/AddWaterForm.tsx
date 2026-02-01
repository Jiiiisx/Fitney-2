"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Minus, Plus, GlassWater, Coffee, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "Small Glass", amount: 250, icon: Coffee },
  { label: "Bottle", amount: 500, icon: GlassWater },
  { label: "Large Bottle", amount: 750, icon: GlassWater }, // Reusing icon but context implies size
];

export default function AddWaterForm({ onCompleted }: { onCompleted?: () => void }) {
  const [currentAmount, setCurrentAmount] = useState(0);
  const [addAmount, setAddAmount] = useState(250);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch current water log
  useEffect(() => {
    const fetchWater = async () => {
      try {
        const res = await fetch("/api/nutrition/water", {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentAmount(data.amountMl || 0);
        }
      } catch (error) {
        console.error("Failed to fetch water log", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWater();
  }, []);

  const handlePresetClick = (amount: number) => {
    setAddAmount(amount);
  };

  const adjustAmount = (delta: number) => {
    setAddAmount(prev => Math.max(0, prev + delta));
  };

  const handleSubmit = async () => {
    if (addAmount <= 0) return;
    setSubmitting(true);

    try {
      const newTotal = currentAmount + addAmount;

      const res = await fetch("/api/nutrition/water", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amountMl: newTotal,
          date: new Date().toISOString().split("T")[0]
        }),
      });

      if (!res.ok) throw new Error("Failed to update water log");

      const data = await res.json();
      setCurrentAmount(data.amountMl);
      toast.success(`Added ${addAmount}ml of water!`);
      if (onCompleted) onCompleted();
      // Optional: Reset add amount or keep it for repeated adds
    } catch (error) {
      toast.error("Failed to log water");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-200">
      <DialogHeader>
        <DialogTitle className="text-center text-xl">Hydration Check</DialogTitle>
        <DialogDescription className="text-center">
          Stay hydrated! Log your water intake below.
        </DialogDescription>
      </DialogHeader>

      <div className="py-6 space-y-6">
        {/* Current Status */}
        <div className="flex flex-col items-center justify-center space-y-1">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Today's Total</span>
              <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                {currentAmount} <span className="text-lg text-muted-foreground font-normal">ml</span>
              </span>
            </>
          )}
        </div>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.amount}
              onClick={() => handlePresetClick(preset.amount)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:bg-sky-50 dark:hover:bg-sky-900/20",
                addAmount === preset.amount
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-1 ring-sky-500"
                  : "border-border bg-card"
              )}
            >
              <preset.icon className={cn(
                "w-6 h-6 mb-2",
                addAmount === preset.amount ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground"
              )} />
              <span className="text-xs font-semibold">{preset.label}</span>
              <span className="text-[10px] text-muted-foreground">{preset.amount}ml</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Custom Amount</Label>
          <div className="flex items-center space-x-3">
            <Button 
                variant="outline" 
                size="icon" 
                onClick={() => adjustAmount(-50)} 
                className="h-10 w-10 shrink-0"
                aria-label="Decrease amount by 50ml"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="relative flex-1">
              <Input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(Number(e.target.value))}
                className="text-center text-lg h-10 font-medium"
              />
              <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">ml</span>
            </div>
            <Button 
                variant="outline" 
                size="icon" 
                onClick={() => adjustAmount(50)} 
                className="h-10 w-10 shrink-0"
                aria-label="Increase amount by 50ml"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Submit Action */}
        <Button
          className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-200 dark:shadow-none"
          onClick={handleSubmit}
          disabled={submitting || loading || addAmount <= 0}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
            </>
          ) : (
            `Add ${addAmount}ml Water`
          )}
        </Button>
      </div>
    </div>
  );
}
