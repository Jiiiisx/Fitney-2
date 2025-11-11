import { Calendar, Clock } from "lucide-react";

export default function UpcomingWorkout() {
  return (
    // Using a soft yellow as a highlight background
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h2 className="text-base font-semibold mb-3 text-yellow-900">
        Next Upcoming Workout
      </h2>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800">Leg Day</h3>
          <p className="text-sm text-gray-600">
            The ultimate challenge for your lower body.
          </p>
        </div>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Wednesday</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>75 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}