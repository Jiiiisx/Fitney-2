import { Lightbulb } from "lucide-react";

export default function Recommendations() {
  return (
    <div className="bg-card rounded-2xl p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-foreground">
        <Lightbulb className="w-5 h-5 inline-block mr-2 text-primary" />
        Suggestions
      </h2>
      <div className="space-y-3">
        <div className="bg-background hover:bg-secondary/80 p-4 rounded-lg cursor-pointer transition-colors">
          <p className="font-semibold text-foreground">Add a Flexibility session</p>
          <p className="text-sm text-secondary-foreground">
            You haven’t trained mobility this week.
          </p>
        </div>
        <div className="bg-background hover:bg-secondary/80 p-4 rounded-lg cursor-pointer transition-colors">
          <p className="font-semibold text-foreground">Try “Push Day Template”</p>
          <p className="text-sm text-secondary-foreground">
            A great way to balance your muscle groups.
          </p>
        </div>
      </div>
    </div>
  );
}