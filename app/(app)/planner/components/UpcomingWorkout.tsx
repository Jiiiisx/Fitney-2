import { Calendar, Clock } from "lucide-react";

export default function UpcomingWorkout() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-gray-900">
        Next Upcoming Workout
      </h2>
      <div className="bg-yellow-100 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Leg Day</h3>
          <p className="text-sm text-yellow-800">
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
