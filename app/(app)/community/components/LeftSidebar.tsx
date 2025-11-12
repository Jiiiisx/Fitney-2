import { Users, Trophy, Hash } from "lucide-react";

const LeftSidebar = () => {
  return (
    <div className="space-y-6">
      {/* My Groups */}
      <div className="bg-background p-5 rounded-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Users className="w-5 h-5 mr-3 text-primary" />
          My Groups
        </h3>
        <ul className="space-y-2">
          <li className="font-semibold text-secondary-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors">
            🏃‍♂️ Weekend Runners
          </li>
          <li className="font-semibold text-secondary-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors">
            🧘‍♀️ Morning Yoga Club
          </li>
          <li className="font-semibold text-secondary-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors">
            🥗 Meal Prep Squad
          </li>
        </ul>
      </div>

      {/* Challenges */}
      <div className="bg-background p-5 rounded-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Trophy className="w-5 h-5 mr-3 text-primary" />
          Active Challenges
        </h3>
        <ul className="space-y-2">
          <li className="font-semibold text-secondary-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors">
            30-Day Plank Challenge
          </li>
          <li className="font-semibold text-secondary-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors">
            10k Steps a Day
          </li>
        </ul>
      </div>

      {/* Topics */}
      <div className="bg-background p-5 rounded-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Hash className="w-5 h-5 mr-3 text-primary" />
          Popular Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors">
            #running
          </span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors">
            #weightloss
          </span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors">
            #mealprep
          </span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors">
            #motivation
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;