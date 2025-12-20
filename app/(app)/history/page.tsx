"use client";

import { useState } from "react";
import HistoryWorkoutLog from "../components/History/HistoryWorkoutLog";
import PerformanceSummary from "../components/History/PerformanceSummary";
import YourBests from "../components/History/YourBests";
import Achievements from "../components/History/Achievements";
import InsightSection from "../components/InsightSection";
import ProgressTrendSection from "../components/History/ProgressTrendSection";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { LogWorkoutModal } from "../components/forms/LogWorkoutModal";

export default function HistoryPage() {
  const [isLogModalOpen, setLogModalOpen] = useState(false);

  return (
    <>
      <LogWorkoutModal isOpen={isLogModalOpen} onOpenChange={setLogModalOpen} />
      <div className="space-y-8 p-8">
        <h1 className="text-3xl font-bold text-foreground">Workout Diary</h1>
 
        {/* Toolbar for controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Filter by:</span>
              <div className="relative">
                <select aria-label="Filter by type" className="appereance-none rounded-lg border border-input bg-background py-2 pl-3 pr-8 text-sm font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>All Types</option>
                  <option>Strength</option>
                  <option>Cardio</option>
                  <option>Yoga</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              <div className="relative">
                <select aria-label="Filter by duration" className="appereance-none rounded-lg border border-input bg-background py-2 pl-3 pr-8 text-sm font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>All Durations</option>
                  <option>Short {"(<15min)"}</option>
                  <option>Medium (15-45min)</option>
                  <option>Long {">(45min)"}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Sort by:</span>
              <div className="relative">
                <select aria-label="Sort by" className="appereance-none rounded-lg border border-input bg-background py-2 pl-3 pr-8 text-sm font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Newest</option>
                  <option>Calories</option>
                  <option>Duration</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          <Button onClick={() => setLogModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold flex-shrink-0">
            <Plus className="w-5 h-5 mr-2" />
            Log Workout
          </Button>
        </div>

        <HistoryWorkoutLog />
      </div>
    </>
  );
}
