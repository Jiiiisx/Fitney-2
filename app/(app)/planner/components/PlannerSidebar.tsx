"use client";

import { Plus, LayoutTemplate, Filter } from "lucide-react";
import { useAI } from "@/app/lib/AIContext";

interface PlannerSidebarProps {
  onAddWorkoutClick: () => void;
  onTemplatesClick: () => void;
  onFilterChange: (newFilters: string[]) => void;
  selectedFilters: string[];
}

export default function PlannerSidebar({ 
  onAddWorkoutClick, 
  onTemplatesClick,
  onFilterChange,
  selectedFilters 
}: PlannerSidebarProps) {
  const { sayActionTip } = useAI();
  
  const handleCheckboxChange = (type: string) => {
    const newFilters = selectedFilters.includes(type)
      ? selectedFilters.filter(f => f !== type)
      : [...selectedFilters, type];
    onFilterChange(newFilters);
  };

  const handleAddClick = () => {
    sayActionTip('add_workout');
    onAddWorkoutClick();
  };

  return (
    // Remove background color, let it inherit from parent
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Plan & Filter</h2>
      <div className="space-y-3">
        <button
          onClick={handleAddClick}
          className="w-full flex items-center justify-center py-3 px-4 bg-primary text-primary-foreground font-bold rounded-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Workout
        </button>
        <button
          onClick={onTemplatesClick}
          className="w-full flex items-center justify-center py-3 px-4 bg-secondary text-secondary-foreground font-semibold rounded-lg transition-colors hover:bg-secondary/80"
        >
          <LayoutTemplate className="w-4 h-4 mr-2" />
          Templates
        </button>
      </div>
      <div className="mt-6">
        <h3 className="text-base font-semibold flex items-center mb-3 text-foreground">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
          Filter by Type
        </h3>
        <div className="space-y-2">
          {["Cardio", "Strength", "Flexibility", "Rest Day"].map((type) => (
            <label
              key={type}
              className="flex items-center space-x-3 cursor-pointer text-secondary-foreground hover:text-foreground"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={selectedFilters.includes(type)}
                onChange={() => handleCheckboxChange(type)}
              />
              <span className="font-medium">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}