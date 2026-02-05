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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Plan & Filter</h2>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center py-2.5 sm:py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl transition-all duration-300 hover:bg-primary/90 hover:shadow-md text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
          Add <span className="hidden sm:inline ml-1">Workout</span>
        </button>
        <button
          onClick={onTemplatesClick}
          className="flex items-center justify-center py-2.5 sm:py-3 px-4 bg-secondary text-secondary-foreground font-semibold rounded-xl transition-colors hover:bg-secondary/80 text-sm sm:text-base"
        >
          <LayoutTemplate className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Templates
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold flex items-center mb-3 text-muted-foreground uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 mr-2" />
          Filter by Type
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2">
          {["Cardio", "Strength", "Flexibility", "Rest Day"].map((type) => (
            <label
              key={type}
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg border transition-all ${
                selectedFilters.includes(type) 
                  ? 'bg-primary/10 border-primary/20 text-primary' 
                  : 'bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                checked={selectedFilters.includes(type)}
                onChange={() => handleCheckboxChange(type)}
              />
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}