"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bed } from "lucide-react";

export default function AddSleepForm() {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-2xl">Log Your Sleep</DialogTitle>
        <DialogDescription className="text-center">
          How long did you sleep last night?
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Hours</Label>
            <Input id="hours" type="number" placeholder="e.g., 8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes">Minutes</Label>
            <Input id="minutes" type="number" placeholder="e.g., 30" />
          </div>
        </div>
        <Button className="w-full bg-gray-800 text-white hover:bg-gray-900 pt-4">
          Log Sleep
        </Button>
      </div>
    </>
  );
}