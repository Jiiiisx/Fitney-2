"use client";

import { useState } from "react";
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

  return (
    <>
      <AddWorkoutForm
        open={isAddWorkoutModalOpen}
        onOpenChange={setAddWorkoutModalOpen}
      />
      <WorkoutTemplates
        open={isTemplatesModalOpen}
        onOpenChange={setTemplatesModalOpen}
      />
      <div className="bg-background min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Workout Planner
          </h1>
          <p className="text-base text-secondary-foreground mt-1">
            Plan your week, stay consistent, and crush your goals.
          </p>
        </header>

        {/* Main Planner Section */}
        <div className="bg-card rounded-2xl p-6 lg:p-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <PlannerSidebar
                onAddWorkoutClick={() => setAddWorkoutModalOpen(true)}
                onTemplatesClick={() => setTemplatesModalOpen(true)}
              />
            </aside>
            <main className="lg:col-span-3">
              <CalendarGrid onChooseProgramClick={() => setTemplatesModalOpen(true)} />
            </main>
          </div>
          <footer className="mt-8">
            <UpcomingWorkout />
          </footer>
        </div>

        {/* Bottom Sections */}
        <div className="mt-8">
          <WeeklySummary />
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <GoalTracker />
          <Recommendations />
        </div>
      </div>
    </>
  );
}


