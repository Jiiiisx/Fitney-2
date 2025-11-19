"use client";

import { useState, useCallback, useEffect } from "react";
import PlannerSidebar from "./components/PlannerSidebar";
import CalendarGrid from "./components/CalendarGrid";
import UpcomingWorkout from "./components/UpcomingWorkout";
import WeeklySummary from "./components/WeeklySummary";
import GoalTracker from "./components/GoalTracker";
import Recommendations from "./components/Recommendations";
import { AddWorkoutForm } from "../components/forms/AddWorkoutForm";
import { WorkoutTemplates } from "./components/WorkoutTemplates";

export default function PlannerPage() {
  const [isAddWorkoutModalOpen, setAddWorkoutModalOpen] = useState(false);
  const [isTemplatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [planVersion, setPlanVersion] = useState(0);
  const [filters, setFilters] = useState<string[]>([]);

  useEffect(() => {
    const syncHistory = async () => {
      try {
        await fetch('/api/planner/sync-history', { method: 'POST' });
        // We can optionally trigger a re-fetch of data here if needed
        handlePlanChange();
      } catch (error) {
        console.error('Failed to sync history:', error);
      }
    };
    syncHistory();
  }, []);

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
      <div className="bg-background min-h-screen p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Workout Planner
          </h1>
          <p className="text-base text-secondary-foreground mt-1">
            Plan your week, stay consistent, and crush your goals.
          </p>
        </header>

        <div className="bg-card rounded-2xl p-6 lg:p-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <PlannerSidebar
                onAddWorkoutClick={handleAddWorkoutClick}
                onTemplatesClick={handleTemplatesClick}
                onFilterChange={handleFilterChange}
                selectedFilters={filters}
              />
            </aside>
            <main className="lg:col-span-3">
              <CalendarGrid 
                planVersion={planVersion}
                onChooseProgramClick={handleTemplatesClick} 
                onPlanChange={handlePlanChange}
                filters={filters}
              />
            </main>
          </div>
          <footer className="mt-8">
            <UpcomingWorkout planVersion={planVersion} />
          </footer>
        </div>

        <div className="mt-8">
          <WeeklySummary planVersion={planVersion} />
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <GoalTracker planVersion={planVersion} />
          <Recommendations 
            planVersion={planVersion}
            onAddFlexibility={handleAddWorkoutClick}
            onTryTemplate={handleTemplatesClick}
          />
        </div>
      </div>
    </>
  );
}
