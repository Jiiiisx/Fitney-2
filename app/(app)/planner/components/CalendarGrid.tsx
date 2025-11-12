import WorkoutCard, { Workout } from "./WorkoutCard";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const sampleWorkouts: { [key: string]: Workout[] } = {
  Monday: [
    { name: "Morning Run", type: "Cardio", duration: 30, status: "completed" },
    { name: "Chest & Triceps", type: "Strength", duration: 60, status: "completed" },
  ],
  Tuesday: [
    { name: "Yoga Session", type: "Flexibility", duration: 45, status: "scheduled" },
  ],
  Wednesday: [
    { name: "Leg Day", type: "Strength", duration: 75, status: "scheduled" },
  ],
  Thursday: [
    { name: "Swimming", type: "Cardio", duration: 45, status: "missed" },
  ],
  Friday: [
    { name: "Back & Biceps", type: "Strength", duration: 60, status: "scheduled" },
  ],
  Saturday: [
    { name: "Long Hike", type: "Cardio", duration: 120, status: "scheduled" },
  ],
  Sunday: [
    { name: "Rest Day", type: "Rest Day", duration: 0, status: "completed" },
  ],
};

export default function CalendarGrid() {
  return (
    <div className="h-full">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        This Week's Plan
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day}>
            <h3 className="font-semibold text-sm text-center text-secondary-foreground mb-3">
              {day}
            </h3>
            <div className="space-y-3">
              {sampleWorkouts[day] ? (
                sampleWorkouts[day].map((workout, index) => (
                  <WorkoutCard key={index} workout={workout} />
                ))
              ) : (
                <div className="h-24 rounded-lg bg-background/50"></div> // Placeholder for empty day
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}