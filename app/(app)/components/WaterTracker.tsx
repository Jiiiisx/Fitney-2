"use client";

import { useState, useEffect } from "react";
import { Droplets, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function WaterTracker() {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const goal = 2000; // Default goal 2L

  const fetchWater = async () => {
    try {
      const res = await fetch("/api/nutrition/water");
      if (res.ok) {
        const data = await res.json();
        setAmount(data.amountMl);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  const addWater = async (ml: number) => {
    const newAmount = Math.max(0, amount + ml);
    setAmount(newAmount); // Optimistic
    try {
      await fetch("/api/nutrition/water", {
        method: "POST",
        body: JSON.stringify({ amount: ml })
      });
    } catch (e) {
      toast.error("Failed to sync water");
      setAmount(amount); // Revert
    }
  };

  useEffect(() => {
    fetchWater();
  }, []);

  const percentage = Math.min((amount / goal) * 100, 100);

  return (
    <div className="bg-card border rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <Droplets className="text-blue-500 w-6 h-6" /> Hydration
          </h3>
          <p className="text-muted-foreground text-sm font-medium">Goal: {goal}ml per day</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-blue-500">{amount}</span>
          <span className="text-muted-foreground font-bold ml-1">ml</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-12 bg-muted rounded-2xl mb-8 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="absolute inset-y-0 left-0 bg-blue-500 flex items-center justify-end pr-4"
        >
          {percentage > 15 && <span className="text-[10px] font-black text-white uppercase tracking-widest">{Math.round(percentage)}%</span>}
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="rounded-2xl py-6 border-2 border-blue-500/20 text-blue-600 hover:bg-blue-50 hover:border-blue-500 transition-all font-bold gap-2"
          onClick={() => addWater(250)}
        >
          <Plus className="w-4 h-4" /> 250ml
        </Button>
        <Button 
          variant="outline" 
          className="rounded-2xl py-6 border-2 border-blue-500/20 text-blue-600 hover:bg-blue-50 hover:border-blue-500 transition-all font-bold gap-2"
          onClick={() => addWater(500)}
        >
          <Plus className="w-4 h-4" /> 500ml
        </Button>
      </div>
    </div>
  );
}
