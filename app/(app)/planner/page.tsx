"use client";

import { useState, useCallback } from "react";
import PlannerSidebar from "./components/PlannerSidebar";
import CalendarGrid from "./components/CalendarGrid";
import UpcomingWorkout from "./components/UpcomingWorkout";
import WeeklySummary from "./components/WeeklySummary";
import GoalTracker from "./components/GoalTracker";
import Recommendations from "./components/Recommendations";
import { AddWorkoutForm } from "../components/forms/AddWorkoutForm";
import { WorkoutTemplates } from "./components/WorkoutTemplates";
import MiniCalendar from "./components/MiniCalendar";
import { Zap } from "lucide-react";

export default function PlannerPage() {
  const [isAddWorkoutModalOpen, setAddWorkoutModalOpen] = useState(false);
  const [isTemplatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [planVersion, setPlanVersion] = useState(0);
  const [filters, setFilters] = useState<string[]>([]);



  const handleFilterChange = (newFilters: string[]) => {
    setFilters(newFilters);
  };

  const handlePlanChange = () => {
    setPlanVersion(v => v + 1);
  };

  const handleAddWorkoutClick = useCallback(() => {
    setAddWorkoutModalOpen(true);
  }, []);

  const handleTemplatesClick = useCallback(() => {
    setTemplatesModalOpen(true);
  }, []);

  return (
    <>
      <AddWorkoutForm
        open={isAddWorkoutModalOpen}
        onOpenChange={setAddWorkoutModalOpen}
        onPlanChange={handlePlanChange}
      />
      <WorkoutTemplates
        open={isTemplatesModalOpen}
        onOpenChange={setTemplatesModalOpen}
        onPlanStarted={handlePlanChange}
      />
      <div className="bg-transparent min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* LEFT SIDEBAR - STICKY */}
            <aside className="lg:col-span-3 lg:sticky lg:top-8 space-y-8">
                <div className="bg-card rounded-3xl p-6 shadow-sm border">
                    <PlannerSidebar
                        onAddWorkoutClick={handleAddWorkoutClick}
                        onTemplatesClick={handleTemplatesClick}
                        onFilterChange={handleFilterChange}
                        selectedFilters={filters}
                    />
                </div>
                
                {/* Mini Calendar Widget */}
                <div className="bg-card rounded-3xl p-2 shadow-sm border">
                    <MiniCalendar />
                </div>

                {/* Daily Tip Widget */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-3xl p-6 shadow-sm border border-yellow-100 dark:border-yellow-900/50">
                    <h3 className="font-bold text-yellow-700 dark:text-yellow-500 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 fill-yellow-500 text-yellow-500" /> 
                        Daily Tip
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        "Consistency is key. Even a 15-minute workout is better than skipping it entirely."
                    </p>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-9 space-y-8">
                {/* 1. CALENDAR GRID */}
                <div className="bg-card rounded-3xl p-6 lg:p-8 shadow-sm border min-h-[500px]">
                    <CalendarGrid 
                        planVersion={planVersion}
                        onChooseProgramClick={handleTemplatesClick} 
                        onPlanChange={handlePlanChange}
                        filters={filters}
                    />
                </div>

                {/* 2. UPCOMING WORKOUT */}
                <div className="bg-card rounded-3xl p-6 shadow-sm border">
                    <UpcomingWorkout planVersion={planVersion} />
                </div>

                {/* 3. WEEKLY SUMMARY */}
                {/* Remove wrapper styling, let the component handle it or wrap in plain card if needed. 
                    WeeklySummary component uses bg-card internally so wrapping it in another bg-card is redundant if not careful.
                    Let's check WeeklySummary again. It has bg-card. 
                    So we can just render it directly OR wrap it cleanly.
                    For consistency with previous refactor, I wrapped it. 
                    Let's wrap it in a div but rely on internal card OR put bg-card on wrapper.
                    Actually, WeeklySummary has `bg-card` inside.
                    Let's just use a fragment or transparent div? 
                    Wait, if I wrap it in `bg-card` and it has `bg-card`, it's double card.
                    I'll revert to render directly IF WeeklySummary is a card.
                    Earlier I saw: return <div className="bg-card..."> in WeeklySummary.tsx.
                    So I will NOT add bg-card wrapper here.
                */}
                <WeeklySummary planVersion={planVersion} />

                {/* 4. GOALS & SUGGESTIONS */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* GoalTracker and Recommendations have bg-card internally too. */}
                    <GoalTracker planVersion={planVersion} />
                    <Recommendations 
                        planVersion={planVersion}
                        onAddFlexibility={handleAddWorkoutClick}
                        onTryTemplate={handleTemplatesClick}
                    />
                </div>
            </main>
        </div>
      </div>
    </>
  );
}
