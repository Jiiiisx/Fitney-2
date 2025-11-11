"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Utensils } from "lucide-react";

export default function AddMealForm() {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">Log a Meal</DialogTitle>
        <DialogDescription className="text-center">
          What did you eat? Fill in the details below.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="meal-name">Meal Name</Label>
          <Input id="meal-name" placeholder="e.g., Chicken Salad" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="calories">Calories</Label>
          <Input id="calories" type="number" placeholder="e.g., 450" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input id="protein" type="number" placeholder="30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input id="carbs" type="number" placeholder="20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Fat (g)</Label>
            <Input id="fat" type="number" placeholder="15" />
          </div>
        </div>
        <Button className="w-full bg-gray-800 text-white hover:bg-gray-900 pt-4">
          Log Meal
        </Button>
      </div>
    </>
  );
}