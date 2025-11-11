import { Target, Footprints } from "lucide-react";

export default function GoalTracker() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Goal Tracker</h2>
      <div className="space-y-4">
        {/* Weekly Workouts Goal */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-gray-700">Weekly Workouts</p>
            <p className="text-sm font-bold text-yellow-600">3 / 4</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-yellow-400 h-2.5 rounded-full"
              style={{ width: "75%", transition: 'width 0.4s ease' }}
            ></div>
          </div>
        </div>
        {/* Running Distance Goal */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-gray-700">Running Distance</p>
            <p className="text-sm font-bold text-green-600">7 / 10 km</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: "70%", transition: 'width 0.4s ease' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}