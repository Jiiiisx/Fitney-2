import { Award, Medal, Trophy, Footprints, Weight, Wind } from "lucide-react";

const goals = [
  {
    name: "Run 100 km total",
    progress: 72,
    icon: <Footprints className="w-6 h-6 text-blue-500" />,
    color: "blue",
  },
  {
    name: "Lift 10,000 kg cumulative",
    progress: 45,
    icon: <Weight className="w-6 h-6 text-orange-500" />,
    color: "orange",
  },
  {
    name: "12 Yoga Sessions",
    progress: 66,
    icon: <Wind className="w-6 h-6 text-green-500" />,
    color: "green",
    progressText: "8/12"
  },
  {
    name: "Join 5 Challenges",
    progress: 80,
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
    color: "yellow",
    progressText: "4/5"
  },
];

const colorVariants = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-500' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500' },
    green: { bg: 'bg-green-500', text: 'text-green-500' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
}

export default function LongTermGoals() {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">
        Long-Term Goals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal, index) => (
          <div key={index} className="bg-card p-6 rounded-2xl border">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-muted mr-4">
                        {goal.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-card-foreground">{goal.name}</h3>
                        {goal.progress >= 50 && (
                            <div className="flex items-center text-sm text-yellow-600 font-medium mt-1">
                                <Medal className="w-4 h-4 mr-1" />
                                {goal.progress === 100 ? 'Completed!' : 'Halfway there!'}
                            </div>
                        )}
                    </div>
                </div>
                <p className={`font-bold text-2xl ${colorVariants[goal.color as keyof typeof colorVariants].text}`}>
                    {goal.progressText ? goal.progressText : `${goal.progress}%`}
                </p>
            </div>
            <div className="w-full bg-muted rounded-full h-3 my-4">
              <div
                className={`${colorVariants[goal.color as keyof typeof colorVariants].bg} h-3 rounded-full`}
                style={{ width: `${goal.progress}%`, transition: 'width 0.4s ease' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
