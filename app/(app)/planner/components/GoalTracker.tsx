import { Target, Footprints } from "lucide-react";

export default function GoalTracker() {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Goal Tracker</h2>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-yellow-500 mr-2" />
              <p className="font-semibold">Weekly Workouts</p>
            </div>
            <p className="text-sm font-medium text-gray-600">3 / 4</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-yellow-400 h-2.5 rounded-full"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Footprints className="w-5 h-5 text-yellow-500 mr-2" />
              <p className="font-semibold">Running Distance</p>
            </div>
            <p className="text-sm font-medium text-gray-600">7 / 10 km</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-yellow-400 h-2.5 rounded-full"
              style={{ width: "70%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
