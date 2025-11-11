import { BarChart, TrendingUp, Clock, Zap } from "lucide-react";

export default function WeeklySummary() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Weekly Summary
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workouts */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <BarChart className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-sm text-gray-500">Total Workouts</p>
          <p className="text-2xl font-bold text-gray-800">6</p>
        </div>
        {/* Calories */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <TrendingUp className="w-6 h-6 text-red-500 mb-2" />
          <p className="text-sm text-gray-500">Calories Burn</p>
          <p className="text-2xl font-bold text-gray-800">2,450 <span className="text-sm font-normal">kcal</span></p>
        </div>
        {/* Total Time */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Clock className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-sm text-gray-500">Total Time</p>
          <p className="text-2xl font-bold text-gray-800">6h 30m</p>
        </div>
        {/* Completion */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Zap className="w-6 h-6 text-yellow-500 mb-2" />
          <p className="text-sm text-gray-500">Completion</p>
          <p className="text-2xl font-bold text-gray-800">83%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-yellow-400 h-2 rounded-full"
              style={{ width: "83%", transition: 'width 0.4s ease' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}