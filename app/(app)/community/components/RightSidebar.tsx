"use client";

import { Award, Calendar, UserPlus, Loader2, User, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import useSWR from "swr"; // Import SWR
import { useSuggestions, followUser } from "../hooks/useCommunity";
import { Button } from "@/components/ui/button";
import { useCommunityNavigation } from "../CommunityContext";

// Reuse fetcher
const fetcher = (url: string) => {
    const token = localStorage.getItem("token");
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    });
};

export default function RightSidebar() {
  const { suggestions, isLoading } = useSuggestions();
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const { setActiveView } = useCommunityNavigation();

  // Fetch Top Achievers (Friends)
  const { data: achievers, isLoading: isLoadingAchievers } = useSWR("/api/community/stats/achievers", fetcher);

  // Fetch Upcoming Events
  const { data: events, isLoading: isLoadingEvents } = useSWR("/api/community/events/upcoming", fetcher);

  const handleFollow = async (userId: string) => {
    // Optimistic UI update local state
    setFollowingIds(prev => new Set(prev).add(userId));
    
    try {
      await followUser(userId);
      // Success is handled in the hook (toast, mutate)
    } catch (error) {
      // Revert local state if failed
      setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Find Friends */}
      <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground">
            Find Friends
            </h3>
            <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setActiveView("find_friends")}>
                View All <ArrowRight className="ml-1 w-3 h-3"/>
            </Button>
        </div>
        
        {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : suggestions && suggestions.length > 0 ? (
            <ul className="space-y-4">
            {suggestions.slice(0, 3).map((user: any) => {
                const isFollowed = followingIds.has(user.id);
                return (
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
                            <p className="text-xs text-muted-foreground truncate">Level {user.level || 1}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleFollow(user.id)}
                        disabled={isFollowed}
                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                            isFollowed 
                            ? 'text-green-500 bg-green-100 cursor-default' 
                            : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                        }`}
                        title={isFollowed ? "Followed" : "Follow"}
                    >
                        {isFollowed ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </button>
                    </li>
                );
            })}
            </ul>
        ) : (
            <p className="text-sm text-muted-foreground text-center">No new suggestions.</p>
        )}
      </div>

      {/* Top Friend Achievers */}
      <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Award className="w-5 h-5 mr-3 text-primary" />
          Top Friend Achievers
        </h3>
        
        {isLoadingAchievers ? (
             <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />)}
             </div>
        ) : achievers && achievers.length > 0 ? (
            <ul className="space-y-3">
            {achievers.map((achiever: any) => (
                <li key={achiever.id} className={`flex items-center p-2 rounded-md ${achiever.isMe ? "bg-primary/5 border border-primary/20" : ""}`}>
                <span className="text-xl mr-3 w-6 text-center">{achiever.rank}</span>
                <div className="flex-1 min-w-0">
                    <span className={`font-semibold block truncate ${achiever.isMe ? "text-primary" : "text-foreground"}`}>
                        {achiever.name} {achiever.isMe && "(You)"}
                    </span>
                    <p className="text-sm text-muted-foreground">{achiever.stat}</p>
                </div>
                </li>
            ))}
            </ul>
        ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
                Add friends to see who's topping the leaderboard!
            </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
          <Calendar className="w-5 h-5 mr-3 text-primary" />
          Upcoming Events
        </h3>
        
        {isLoadingEvents ? (
            <div className="space-y-3">
               {[1,2].map(i => <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />)}
            </div>
        ) : events && !events.error && events.length > 0 ? (
            <ul className="space-y-3">
            {events.map((event: any) => (
                <li key={event.id} className="p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <p className="font-semibold text-foreground truncate">{event.title}</p>
                <p className="text-sm text-muted-foreground">{formatDate(event.startTime)}</p>
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-sm text-muted-foreground">
                {events?.error ? "Please run db migration." : "No upcoming events."}
            </p>
        )}
      </div>
    </div>
  );
};