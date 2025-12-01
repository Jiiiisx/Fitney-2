"use client";

import { useState } from "react";
import HistoryFilterControls from "../components/History/HistoryFilterControls";
import HistoryWorkoutLog from "../components/History/HistoryWorkoutLog";
import PerformanceSummary from "../components/History/PerformanceSummary";
import YourBests from "../components/History/YourBests";
import Achievements from "../components/History/Achievements";
import InsightSection from "../components/InsightSection";
import ProgressTrendSection from "../components/History/ProgressTrendSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LogWorkoutModal } from "../components/forms/LogWorkoutModal";

export default function HistoryPage() {
  const [isLogModalOpen, setLogModalOpen] = useState(false);

  return (
    <>
      <LogWorkoutModal open={isLogModalOpen} onOpenChange={setLogModalOpen} />
      <div className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Main Diary Content (Scrollable) */}
          <div className="space-y-8 p-8 scrollbar-hide">
            <h1 className="text-3xl font-bold text-foreground">Workout Diary</h1>

            {/* Toolbar for controls */}
            <div className="flex items-center justify-between">
              <HistoryFilterControls />
              <Button onClick={() => setLogModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold">
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
