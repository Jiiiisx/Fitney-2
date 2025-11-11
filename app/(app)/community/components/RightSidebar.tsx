import { Award, Calendar, UserPlus } from "lucide-react";

const RightSidebar = () => {
  const activeUsers = [
    { name: "Michael B.", avatar: "/assets/Testimonial/michael-b.jpg", mutual: 5 },
    { name: "Emily K.", avatar: "/assets/Testimonial/emily-k.jpg", mutual: 2 },
  ];

  const topAchievers = [
    { name: "Sarah J.", stat: "50 workouts", rank: "🥇" },
    { name: "David L.", stat: "100km run", rank: "🥈" },
  ];

  const upcomingEvents = [
    { name: "Community Yoga", time: "Sunday, 7 AM" },
    { name: "Weekend Jog", time: "Saturday, 8 AM" },
  ];

  return (
    <div className="space-y-6">
      {/* Find Friends */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-gray-800">
          Find Friends
        </h3>
        <ul className="space-y-4">
          {activeUsers.map((user) => (
            <li key={user.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                    <p className="font-bold text-gray-700">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.mutual} mutual friends</p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-yellow-600 p-2 rounded-full hover:bg-yellow-100 transition-colors">
                <UserPlus className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Achievers */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Award className="w-5 h-5 mr-3 text-yellow-500" />
          Top Achievers
        </h3>
        <ul className="space-y-3">
          {topAchievers.map((achiever) => (
            <li key={achiever.name} className="flex items-center text-gray-700">
              <span className="text-xl mr-3">{achiever.rank}</span>
              <div>
                <span className="font-semibold">{achiever.name}</span>
                <p className="text-sm text-gray-500">{achiever.stat}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-gray-800">
          <Calendar className="w-5 h-5 mr-3 text-yellow-500" />
          Upcoming Events
        </h3>
        <ul className="space-y-3">
          {upcomingEvents.map((event) => (
            <li key={event.name} className="p-2 rounded-md hover:bg-gray-50 cursor-pointer">
              <p className="font-semibold text-gray-800">{event.name}</p>
              <p className="text-sm text-gray-500">{event.time}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RightSidebar;