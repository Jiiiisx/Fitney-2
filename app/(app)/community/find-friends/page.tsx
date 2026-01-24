"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, UserCheck, Loader2, Users, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type UserResult = {
  id: string;
  username: string;
  fullName: string | null;
  imageUrl: string | null;
  level: number;
  isFollowing: boolean;
  isMe: boolean;
};

export default function FindFriendsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // State baru untuk mode tampilan & following list
  const [viewMode, setViewMode] = useState<'list' | 'find'>('find');
  const [followingList, setFollowingList] = useState<UserResult[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);

  const [recommendations, setRecommendations] = useState<UserResult[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // 1. Fetch Following List on Mount
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await fetch(`/api/community/users/following`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setFollowingList(data);
          // Jika punya following, default ke 'list' view
          if (data.length > 0) {
            setViewMode('list');
          } else {
            setViewMode('find');
          }
        }
      } catch (error) {
        console.error("Failed to fetch following list", error);
      } finally {
        setLoadingFollowing(false);
      }
    };

    fetchFollowing();
  }, []);

  // 2. Fetch Recommendations (hanya jika masuk mode find)
  useEffect(() => {
    if (viewMode === 'find') {
      const fetchRecommendations = async () => {
        setLoadingRecs(true);
        try {
          const res = await fetch(`/api/community/users/recommendations`, {
            credentials: 'include'
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
    }
  }, [viewMode]);

  // 3. Search Logic (Debounce)
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
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/community/users/search?q=${query}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent, user: UserResult) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/community/users/${user.id}/follow`, {
        method: "POST",
        credentials: 'include'
      });

      if (res.ok) {
        const isNowFollowing = !user.isFollowing;

        // Update Search Results UI
        setResults(prev => prev.map(u =>
          u.id === user.id ? { ...u, isFollowing: isNowFollowing } : u
        ));

        // Update Recommendations UI
        setRecommendations(prev => prev.map(u =>
          u.id === user.id ? { ...u, isFollowing: isNowFollowing } : u
        ));

        // Update Following List UI locally
        if (isNowFollowing) {
          // Add to list (optimistic)
          setFollowingList(prev => [{ ...user, isFollowing: true }, ...prev]);
        } else {
          // Remove from list
          setFollowingList(prev => prev.filter(u => u.id !== user.id));
        }

        toast.success(isNowFollowing ? "Following!" : "Unfollowed");
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/community/profile/${userId}`);
  };

  // --- RENDER: LOADING INITIAL ---
  if (loadingFollowing) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- RENDER: LIST VIEW (MY CONNECTIONS) ---
  if (viewMode === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/community">
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2"
                title="Back to Feed"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Following</h2>
              <p className="text-muted-foreground">People you follow ({followingList.length})</p>
            </div>
          </div>
          <Button onClick={() => setViewMode('find')}>
            <UserPlus className="mr-2 h-4 w-4" /> Find New Friends
          </Button>
        </div>

        <div className="space-y-4">
          {followingList.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-xl">
              <p className="text-muted-foreground mb-4">You aren't following anyone yet.</p>
              <Button variant="outline" onClick={() => setViewMode('find')}>Start Exploring</Button>
            </div>
          ) : (
            followingList.map((user) => (
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
                  <Button
                    size="sm"
                    variant="secondary" // Always 'secondary' because they are followed
                    onClick={(e) => handleFollowToggle(e, user)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" /> Following
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- RENDER: FIND VIEW (SEARCH & RECS) ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2"
              onClick={() => followingList.length > 0 ? setViewMode('list') : router.push('/community')}
              title={followingList.length > 0 ? "Back to Connections" : "Back to Feed"}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h2 className="text-2xl font-bold">Find Friends</h2>
          </div>
          <p className="text-muted-foreground">Search for people to follow and connect with.</p>
        </div>

        {followingList.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setViewMode('list')} className="hidden md:flex">
            <Users className="mr-2 h-4 w-4" /> Following
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by username or name..."
          className="pl-10 h-12 text-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-4">
        {loadingSearch && (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* REKOMENDASI (Hanya jika tidak sedang mencari) */}
        {!loadingSearch && query === "" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Recommended for You</h3>
            </div>

            {loadingRecs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
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
              <div className="text-sm text-muted-foreground italic">No new recommendations available.</div>
            )}
          </div>
        )}

        {/* HASIL PENCARIAN */}
        {!loadingSearch && results.length === 0 && query.length >= 2 && (
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
