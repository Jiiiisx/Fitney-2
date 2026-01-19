"use client";

import { Award, Calendar, UserPlus, Loader2, User } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface SuggestedUser {
    id: string;
    fullName: string;
    username: string;
    imageUrl?: string;
    reason: string;
}

const RightSidebar = () => {
  const [suggestedFriends, setSuggestedFriends] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchSuggestions = async () => {
          try {
              const token = localStorage.getItem("token");
              if (!token) return;
              
              const res = await fetch("/api/community/friends/suggestions", {
                  headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                  const data = await res.json();
                  setSuggestedFriends(data);
              }
          } catch (e) {
              console.error(e);
          } finally {
              setLoading(false);
          }
      };
      fetchSuggestions();
  }, []);

  const handleFollow = (username: string) => {
      // Placeholder logic
      toast.success(`Followed ${username}`);
  };

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
      <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-foreground">
          Find Friends
        </h3>
        {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : suggestedFriends.length > 0 ? (
            <ul className="space-y-4">
            {suggestedFriends.map((user) => (
                <li key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    {user.imageUrl ? (
                        <img
                        src={user.imageUrl}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">{user.fullName || user.username}</p>
                        <p className="text-xs text-muted-foreground truncate" title={user.reason}>{user.reason}</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleFollow(user.username)}
                    className="text-muted-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors flex-shrink-0"
                >
                    <UserPlus className="w-5 h-5" />
                </button>
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-sm text-muted-foreground text-center">No suggestions yet.</p>
        )}
      </div>

      {/* Top Achievers */}
      <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
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
      <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Calendar className="w-5 h-5 mr-3 text-primary" />
          Upcoming Events
        </h3>
        <ul className="space-y-3">
          {upcomingEvents.map((event) => (
            <li key={event.name} className="p-2 rounded-md hover:bg-secondary/80 cursor-pointer transition-colors">
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