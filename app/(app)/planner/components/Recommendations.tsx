import { Lightbulb } from "lucide-react";

export default function Recommendations() {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        <Lightbulb className="w-5 h-5 inline-block mr-2 text-yellow-500" />
        Suggestions for Your Next Plan
      </h2>
      <div className="space-y-3">
        <div className="bg-gray-100 p-4 rounded-lg flex items-center">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Add a Flexibility session:</span> you
            haven’t trained mobility this week.
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg flex items-center">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Try “Push Day Template”:</span> to
            balance muscle groups.
          </p>
        </div>
      </div>
    </div>
  );
}
