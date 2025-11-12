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
      <div className="bg-background p-5 rounded-xl">
        <h3 className="font-bold text-lg mb-4 text-foreground">
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
                    <p className="font-bold text-foreground">{user.name}</p>
                    <p className="text-xs text-secondary-foreground">{user.mutual} mutual friends</p>
                </div>
              </div>
              <button className="text-secondary-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors">
                <UserPlus className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Top Achievers */}
      <div className="bg-background p-5 rounded-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Award className="w-5 h-5 mr-3 text-primary" />
          Top Achievers
        </h3>
        <ul className="space-y-3">
          {topAchievers.map((achiever) => (
            <li key={achiever.name} className="flex items-center text-foreground">
              <span className="text-xl mr-3">{achiever.rank}</span>
              <div>
                <span className="font-semibold">{achiever.name}</span>
                <p className="text-sm text-secondary-foreground">{achiever.stat}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Upcoming Events */}
      <div className="bg-background p-5 rounded-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Calendar className="w-5 h-5 mr-3 text-primary" />
          Upcoming Events
        </h3>
        <ul className="space-y-3">
          {upcomingEvents.map((event) => (
            <li key={event.name} className="p-2 rounded-md hover:bg-secondary/80 cursor-pointer">
              <p className="font-semibold text-foreground">{event.name}</p>
              <p className="text-sm text-secondary-foreground">{event.time}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RightSidebar;