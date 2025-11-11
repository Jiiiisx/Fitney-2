"use client";

import { Plus, LayoutTemplate, Filter } from "lucide-react";

export default function PlannerSidebar() {
  return (
    // Remove background color, let it inherit from parent
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Plan & Filter</h2>
      <div className="space-y-3">
        <button className="w-full flex items-center justify-center py-3 px-4 bg-yellow-400 text-gray-900 font-bold rounded-lg transition-all duration-300 hover:bg-yellow-500 hover:shadow-md">
          <Plus className="w-5 h-5 mr-2" />
          Add Workout
        </button>
        <button className="w-full flex items-center justify-center py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors hover:bg-gray-200">
          <LayoutTemplate className="w-4 h-4 mr-2" />
          Templates
        </button>
      </div>
      <div className="mt-6">
        <h3 className="text-base font-semibold flex items-center mb-3 text-gray-800">
          <Filter className="w-4 h-4 mr-2 text-gray-400" />
          Filter by Type
        </h3>
        <div className="space-y-2">
          {["Cardio", "Strength", "Flexibility", "Rest Day"].map((type) => (
            <label
              key={type}
              className="flex items-center space-x-3 cursor-pointer text-gray-600 hover:text-gray-800"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="font-medium">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}