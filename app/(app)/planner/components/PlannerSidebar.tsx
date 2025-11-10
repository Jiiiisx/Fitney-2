"use client";

import { Plus, LayoutTemplate, Filter } from "lucide-react";

export default function PlannerSidebar() {
  return (
    <div className="bg-gray-50 p-6 rounded-lg h-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Plan & Filter</h2>
      <div className="space-y-4">
        <button className="w-full flex items-center justify-center py-3 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Workout
        </button>
        <button className="w-full flex items-center justify-center py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
          <LayoutTemplate className="w-4 h-4 mr-2" />
          Templates
        </button>
      </div>
      <div className="mt-8">
        <h3 className="text-md font-semibold flex items-center mb-4 text-gray-900">
          <Filter className="w-4 h-4 mr-2 text-gray-400" />
          Filter by Type
        </h3>
        <div className="space-y-3">
          {["Cardio", "Strength", "Flexibility", "Rest Day"].map((type) => (
            <label
              key={type}
              className="flex items-center space-x-3 cursor-pointer text-gray-600 hover:text-gray-900"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded bg-gray-200 border-gray-300 text-gray-800 focus:ring-gray-500"
              />
              <span className="text-sm font-medium">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
