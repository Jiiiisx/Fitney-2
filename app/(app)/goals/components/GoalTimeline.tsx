import { Check, Flame, Loader, X } from "lucide-react";

const weeks = [
  { week: "W1", status: "completed" },
  { week: "W2", status: "completed" },
  { week: "W3", status: "completed" },
  { week: "W4", status: "active" },
  { week: "W5", status: "pending" },
];

const statusConfig = {
  completed: {
    icon: <Check className="w-5 h-5 text-white" />,
    bg: "bg-green-500",
    text: "text-green-500",
  },
  active: {
    icon: <Flame className="w-5 h-5 text-white" />,
    bg: "bg-orange-500",
    text: "text-orange-500",
  },
  pending: {
    icon: <Loader className="w-5 h-5 text-muted-foreground animate-spin" />,
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
  missed: {
    icon: <X className="w-5 h-5 text-white" />,
    bg: "bg-red-500",
    text: "text-red-500",
  },
};

export default function GoalTimeline() {
  const completedWeeks = weeks.filter(w => w.status === 'completed').length;

  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        Goal Timeline
      </h2>
      <div className="bg-card p-6 rounded-2xl border">
        <p className="font-semibold text-center text-xl mb-2">
          You’ve hit your weekly goal <span className="text-green-500">{completedWeeks} weeks</span> in a row!
        </p>
        <p className="text-center text-muted-foreground mb-8">Keep the flame alive!</p>
        
        <div className="flex items-center justify-between relative">
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2">
            <div className="h-1 bg-green-500" style={{width: `${(completedWeeks / (weeks.length - 1)) * 100}%`, transition: 'width 0.4s ease'}}></div>
          </div>

          {weeks.map((week, index) => {
            const config = statusConfig[week.status as keyof typeof statusConfig];
            return (
              <div key={index} className="z-10 flex flex-col items-center">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full ${config.bg}`}>
                  {config.icon}
                </div>
                <p className={`mt-2 font-bold ${config.text}`}>{week.week}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
