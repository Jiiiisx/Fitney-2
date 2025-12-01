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
      <LogWorkoutModal open={isLogModalOpen} onOpenChange={setLogModalOpen} />
      <div className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Main Diary Content (Scrollable) */}
          <div className="lg:col-span-2 space-y-8 p-8 scrollbar-hide">
            <h1 className="text-3xl font-bold text-foreground">Workout Diary</h1>

            {/* Toolbar for controls - REBUILT */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Filter by:</span>
                  <div className="relative">
                    <select className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                      <option>All Types</option>
                      <option>Strength</option>
                      <option>Cardio</option>
                      <option>Yoga</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                  <div className="relative">
                    <select className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400">
                      <option>All Durations</option>
                      <option>Short (&lt;15min)</option>
                      <option>Medium (15-45min)</option>
                      <option>Long (&gt;45min)</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Sort by:</span>
                  <div className="relative">
                    <select className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400">
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

          {/* Right Sidebar (Scrollable) */}
          <div className="lg:col-span-1 space-y-8 overflow-y-auto p-8 bg-card/50 border-l border-border scrollbar-hide">
            <PerformanceSummary />
            <ProgressTrendSection />
            <YourBests />
            <Achievements />
            <InsightSection />
          </div>
        </div>
      </div>
    </>
  );
}
