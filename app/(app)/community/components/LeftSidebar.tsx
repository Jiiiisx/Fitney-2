"use client";

import { Users, Trophy, Hash, User, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserProfile {
  fullName: string;
  email: string;
  imageUrl?: string;
  // stats placeholder
  followersCount?: number;
  followingCount?: number;
}

const LeftSidebar = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error("Failed to fetch profile sidebar", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
        {loading ? (
           <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : profile ? (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center overflow-hidden mb-3 border-2 border-primary/20">
              {profile.imageUrl ? (
                <img src={profile.imageUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <h2 className="font-bold text-lg text-foreground truncate">{profile.fullName || "User"}</h2>
            <p className="text-sm text-muted-foreground mb-4 truncate">{profile.email}</p>
            
            <div className="flex justify-center gap-4 border-t border-border pt-4">
              <div className="text-center">
                <span className="block font-bold text-foreground">0</span>
                <span className="text-xs text-muted-foreground">Followers</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-foreground">0</span>
                <span className="text-xs text-muted-foreground">Following</span>
              </div>
            </div>
            
            <Link href="/settings" className="block mt-4 text-xs font-semibold text-primary hover:underline">
                Edit Profile
            </Link>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-muted-foreground">Please login to view profile</p>
          </div>
        )}
      </div>

      {/* My Groups (Static) */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Users className="w-5 h-5 mr-3 text-primary" />
          My Groups
        </h3>
        <ul className="space-y-2">
          <li className="font-semibold text-secondary-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors">
            Weekend Runners
          </li>
          <li className="font-semibold text-secondary-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors">
            Morning Yoga Club
          </li>
          <li className="font-semibold text-secondary-foreground hover:text-primary hover:bg-primary/10 p-2 rounded-md cursor-pointer transition-colors">
            Meal Prep Squad
          </li>
        </ul>
      </div>

      {/* Challenges (Static) */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
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

      {/* Topics (Static) */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Hash className="w-5 h-5 mr-3 text-primary" />
          Popular Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {["#running", "#weightloss", "#mealprep", "#motivation"].map((tag) => (
            <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
