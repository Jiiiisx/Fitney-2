// app/(app)/components/StatsSidebar.tsx
import { User, MoreHorizontal } from "lucide-react";
import QuickActions from "./QuickActions";



const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="absolute w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-border"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className="text-primary"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
  
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute flex items-center justify-center w-24 h-24 bg-muted rounded-full">
        <User className="w-12 h-12 text-muted-foreground" />
      </div>
      <div className="absolute top-0 right-0 bg-foreground text-background text-xs font-bold px-2 py-1 rounded-full">
        {percentage}%
      </div>
    </div>
  );
};

const StatsSidebar = () => {
  const user = {
    name: "Raji",
    progress: 32,
  };

  return (
    <div className="h-full flex flex-col space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Statistic</h2>
      </div>

      <div className="flex flex-col items-center text-center">
        <CircularProgress percentage={user.progress} />
        <h3 className="mt-4 text-xl font-bold text-foreground">
          Good Morning, {user.name}! 🔥
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Continue your journey to achieve your target!
        </p>
      </div>

      <div className="text-center bg-muted border border-border rounded-lg p-3">
        <p className="text-sm text-foreground">
          <span className="font-bold">Good job!</span> Your workout consistency
          is up by <span className="font-bold">15%</span> from last week.
        </p>
      </div>

      <QuickActions />


    </div>
  );
};

export default StatsSidebar;
