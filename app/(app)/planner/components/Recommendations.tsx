import { Lightbulb } from "lucide-react";

export default function Recommendations() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        <Lightbulb className="w-5 h-5 inline-block mr-2 text-yellow-500" />
        Suggestions
      </h2>
      <div className="space-y-3">
        <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition-colors">
          <p className="font-semibold text-gray-700">Add a Flexibility session</p>
          <p className="text-sm text-gray-500">
            You haven’t trained mobility this week.
          </p>
        </div>
        <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition-colors">
          <p className="font-semibold text-gray-700">Try “Push Day Template”</p>
          <p className="text-sm text-gray-500">
            A great way to balance your muscle groups.
          </p>
        </div>
      </div>
    </div>
  );
}