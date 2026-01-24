"use client";

import { Award, UserPlus, Loader2, User, Check, ArrowRight, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import useSWR from "swr"; // Import SWR
import { useSuggestions, followUser } from "../hooks/useCommunity";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Hashtag {
    tag: string;
    count: number;
}

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
    const [trendingTags, setTrendingTags] = useState<Hashtag[]>([]);
    const [loadingTags, setLoadingTags] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch("/api/community/hashtags/trending");
                if (res.ok) {
                    const data = await res.json();
                    setTrendingTags(data);
                }
            } catch (e) {
                console.error("Failed to fetch trending tags", e);
            } finally {
                setLoadingTags(false);
            }
        };
        fetchTrending();
    }, []);

    // Fetch Top Achievers (Friends)
    const { data: achievers, isLoading: isLoadingAchievers } = useSWR("/api/community/stats/achievers", fetcher);



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



    return (
        <div className="space-y-6">
            {/* Find Friends */}
            <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-foreground">
                        Find Friends
                    </h3>
                    <Link href="/community/find-friends" className="text-xs text-primary hover:underline flex items-center font-medium">
                        View All <ArrowRight className="ml-1 w-3 h-3" />
                    </Link>
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
                                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${isFollowed
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
                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />)}
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


            {/* Popular Topics (Dynamic) */}
            <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center text-foreground">
                    <Hash className="w-5 h-5 mr-3 text-primary" />
                    Popular Topics
                </h3>
                {loadingTags ? (
                    <div className="flex gap-2">
                        <div className="h-6 w-16 bg-muted rounded-full animate-pulse"></div>
                        <div className="h-6 w-20 bg-muted rounded-full animate-pulse"></div>
                    </div>
                ) : trendingTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {trendingTags.map((tag) => (
                            <span key={tag.tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1">
                                #{tag.tag}
                                <span className="text-[10px] opacity-70">({tag.count})</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No trending topics yet.</p>
                )}
            </div>
        </div>
    );
};