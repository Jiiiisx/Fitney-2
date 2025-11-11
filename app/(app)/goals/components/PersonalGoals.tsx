import { Flame, Droplet, Dumbbell, Zap } from "lucide-react";

const ProgressRing = ({
  radius,
  stroke,
  progress,
  color,
}: {
  radius: number;
  stroke: number;
  progress: number;
  color: string;
}) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="-rotate-90">
      <circle
        stroke="#F5F5F5" // Light gray background
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color} // Accent color
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

export default function PersonalGoals() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Workout Frequency */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Workout Frequency</h3>
          <Dumbbell className="w-6 h-6 text-orange-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">3 / 5 <span className="text-base font-normal text-gray-500">workouts</span></p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div
            className="bg-orange-400 h-2.5 rounded-full"
            style={{ width: "60%", transition: 'width 0.4s ease' }}
          ></div>
        </div>
      </div>

      {/* Calories Burned */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Calories Burned</h3>
          <Flame className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">2,150 <span className="text-base font-normal text-gray-500">kcal</span></p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div
            className="bg-red-400 h-2.5 rounded-full"
            style={{ width: "71.6%", transition: 'width 0.4s ease' }}
          ></div>
        </div>
      </div>

      {/* Active Minutes */}
      <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Active Minutes</h3>
          <Zap className="w-6 h-6 text-green-400" />
        </div>
        <div className="flex items-center justify-center">
            <div className="relative">
                <ProgressRing radius={40} stroke={6} progress={75} color="#81C784" />
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <p className="text-xl font-bold">45</p>
                    <p className="text-xs text-gray-500">min</p>
                </div>
            </div>
        </div>
      </div>

      {/* Hydration */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Hydration</h3>
          <Droplet className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">6 / 8 <span className="text-base font-normal text-gray-500">glasses</span></p>
        <div className="flex items-center space-x-2 mt-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-2 rounded-full bg-gray-200">
                <div className={`h-2 rounded-full ${i < 6 ? 'bg-blue-400' : 'bg-transparent'}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
