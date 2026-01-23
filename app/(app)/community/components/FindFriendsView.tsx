"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useCommunityNavigation } from "../CommunityContext";
import toast from "react-hot-toast";

type UserResult = {
  id: string;
  username: string;
  fullName: string | null;
  imageUrl: string | null;
  level: number;
  isFollowing: boolean;
  isMe: boolean;
};

export default function FindFriendsView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { setActiveView, setSelectedUser } = useCommunityNavigation();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/community/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent, user: UserResult) => {
    e.stopPropagation(); // Prevent card click
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/community/users/${user.id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
         setResults(prev => prev.map(u => 
            u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
         ));
         toast.success(user.isFollowing ? "Unfollowed" : "Following!");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleViewProfile = (userId: string) => {
      setSelectedUser(userId);
      setActiveView("user_profile");
  };

  const [recommendations, setRecommendations] = useState<UserResult[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
        setLoadingRecs(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/community/users/recommendations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRecommendations(data);
            }
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setLoadingRecs(false);
        }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Find Friends</h2>
        <p className="text-muted-foreground">Search for people to follow and connect with.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search by username or name..." 
          className="pl-10 h-12 text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {loading && (
             <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
        )}

        {!loading && query === "" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Recommended for You</h3>
                    <Button variant="link" className="text-primary h-auto p-0">View All</Button>
                </div>
                
                {loadingRecs ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => (
                             <Card key={i} className="h-24 animate-pulse bg-muted/50" />
                        ))}
                    </div>
                ) : recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.map((user) => (
                             <Card 
                                key={user.id} 
                                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-sm"
                                onClick={() => handleViewProfile(user.id)}
                            >
                                <CardContent className="p-4 flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border border-border">
                                        <AvatarImage src={user.imageUrl || ""} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">{user.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{user.fullName || user.username}</h4>
                                        <p className="text-xs text-muted-foreground truncate">@{user.username} • Lvl {user.level}</p>
                                    </div>
                                    <Button 
                                        size="icon" 
                                        variant="ghost"
                                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
                                        onClick={(e) => handleFollowToggle(e, user)}
                                    >
                                        <UserPlus className="h-5 w-5" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground italic">No recommendations available at the moment.</div>
                )}
            </div>
        )}

        {!loading && results.length === 0 && query.length >= 2 && (
            <div className="text-center p-8 text-muted-foreground">
                No users found matching "{query}"
            </div>
        )}

        {results.map((user) => (
            <Card 
                key={user.id} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewProfile(user.id)}
            >
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background">
                            <AvatarImage src={user.imageUrl || ""} />
                            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-semibold text-lg leading-none">{user.fullName || user.username}</h4>
                            <p className="text-sm text-muted-foreground">@{user.username} • Lvl {user.level}</p>
                        </div>
                    </div>
                    
                    {!user.isMe && (
                        <Button 
                            size="sm" 
                            variant={user.isFollowing ? "secondary" : "default"}
                            onClick={(e) => handleFollowToggle(e, user)}
                        >
                            {user.isFollowing ? (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" /> Following
                                </>
                            ) : (
                                <>
                                  <UserPlus className="mr-2 h-4 w-4" /> Follow
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
