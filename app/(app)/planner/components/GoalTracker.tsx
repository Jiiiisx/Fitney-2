import { Target, Footprints } from "lucide-react";

export default function GoalTracker() {
  return (
    <div className="bg-card rounded-2xl p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-foreground">Goal Tracker</h2>
      <div className="space-y-4">
        {/* Weekly Workouts Goal */}
        <div className="bg-background p-4 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-foreground">Weekly Workouts</p>
            <p className="text-sm font-bold text-primary">3 / 4</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: "75%", transition: 'width 0.4s ease' }}
            ></div>
          </div>
        </div>
        {/* Running Distance Goal */}
        <div className="bg-background p-4 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-foreground">Running Distance</p>
            <p className="text-sm font-bold text-success">7 / 10 km</p>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className="bg-success h-2.5 rounded-full"
              style={{ width: "70%", transition: 'width 0.4s ease' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}