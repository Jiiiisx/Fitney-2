import { BarChart, TrendingUp, Clock, Zap } from "lucide-react";

export default function WeeklySummary() {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Weekly Summary
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-100 p-4 rounded-lg">
          <BarChart className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
          <p className="text-sm text-gray-600">Total Workouts</p>
          <p className="text-2xl font-bold">6</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <TrendingUp className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
          <p className="text-sm text-gray-600">Calories to Burn</p>
          <p className="text-2xl font-bold">2,450</p>
          <p className="text-xs text-gray-500">kcal</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <Clock className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
          <p className="text-sm text-gray-600">Total Time</p>
          <p className="text-2xl font-bold">6h 30m</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <Zap className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
          <p className="text-sm text-gray-600">Completion (Last Wk)</p>
          <p className="text-2xl font-bold">83%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-yellow-400 h-2.5 rounded-full"
              style={{ width: "83%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
