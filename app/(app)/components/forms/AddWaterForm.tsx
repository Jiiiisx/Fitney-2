"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export default function AddWaterForm() {
  const [glasses, setGlasses] = useState(1);

  const increment = () => setGlasses((prev) => prev + 1);
  const decrement = () => setGlasses((prev) => Math.max(1, prev - 1));

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">Log Your Water Intake</DialogTitle>
        <DialogDescription className="text-center">
          How many glasses of water did you drink?
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-center space-x-4">
          <Button variant="outline" size="icon" onClick={decrement}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-4xl font-bold w-20 text-center">{glasses}</span>
          <Button variant="outline" size="icon" onClick={increment}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button className="w-full bg-gray-800 text-white hover:bg-gray-900">
          Log {glasses} {glasses > 1 ? "Glasses" : "Glass"}
        </Button>
      </div>
    </>
  );
}