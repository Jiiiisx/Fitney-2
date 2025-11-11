import { Users, Trophy, Hash } from "lucide-react";

const LeftSidebar = () => {
  return (
    <div className="space-y-6">
      {/* My Groups */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Users className="w-5 h-5 mr-3 text-yellow-500" />
          My Groups
        </h3>
        <ul className="space-y-2">
          <li className="font-semibold text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 p-2 rounded-md cursor-pointer transition-colors">
            🏃‍♂️ Weekend Runners
          </li>
          <li className="font-semibold text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 p-2 rounded-md cursor-pointer transition-colors">
            🧘‍♀️ Morning Yoga Club
          </li>
          <li className="font-semibold text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 p-2 rounded-md cursor-pointer transition-colors">
            🥗 Meal Prep Squad
          </li>
        </ul>
      </div>

      {/* Challenges */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Trophy className="w-5 h-5 mr-3 text-yellow-500" />
          Active Challenges
        </h3>
        <ul className="space-y-2">
          <li className="font-semibold text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 p-2 rounded-md cursor-pointer transition-colors">
            30-Day Plank Challenge
          </li>
          <li className="font-semibold text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 p-2 rounded-md cursor-pointer transition-colors">
            10k Steps a Day
          </li>
        </ul>
      </div>

      {/* Topics */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Hash className="w-5 h-5 mr-3 text-yellow-500" />
          Popular Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-yellow-200 transition-colors">
            #running
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-yellow-200 transition-colors">
            #weightloss
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-yellow-200 transition-colors">
            #mealprep
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-yellow-200 transition-colors">
            #motivation
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;