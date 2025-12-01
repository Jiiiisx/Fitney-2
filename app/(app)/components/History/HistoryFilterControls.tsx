"use client";

import { ChevronDown } from "lucide-react";

export default function HistoryFilterControls() {
  return (
    <div className="flex flex-wrap items-center gap-4">
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
  );
}
