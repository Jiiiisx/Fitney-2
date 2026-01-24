"use client";

import { Users, Trophy, User, Loader2, Plus, Filter, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMyGroups, deleteGroup, useFriends } from "../hooks/useCommunity";
import CreateGroupModal from "./CreateGroupModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
    fullName: string;
    email: string;
    imageUrl?: string;
    followersCount?: number;
    followingCount?: number;
}



const LeftSidebar = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Group Logic
    const [groupFilter, setGroupFilter] = useState<"all" | "created">("all");
    const { groups, isLoading: loadingGroups } = useMyGroups(groupFilter);
    const { friends, isLoading: loadingFriends } = useFriends();
    const [isGroupsExpanded, setIsGroupsExpanded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleDeleteGroup = async (groupId: number, groupName: string) => {
        if (confirm(`Are you sure you want to delete group "${groupName}"? This action cannot be undone.`)) {
            await deleteGroup(groupId);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/users/profile");
                // Fetch automatically uses cookie relative to domain

                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                } else if (res.status === 401) {
                    // Token expired or missing cookie - optional: redirect?
                    // router.push("/login");
                }
            } catch (e) {
                console.error("Failed to fetch profile sidebar", e);
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="space-y-6">
            {/* User Profile Summary */}
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                {loadingProfile ? (
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



            {/* My Groups (Dynamic) */}
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center text-foreground">
                        <Users className="w-5 h-5 mr-3 text-primary" />
                        My Groups
                    </h3>
                    <div className="flex items-center gap-1">
                        {isMounted && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground">
                                        <Filter className="w-4 h-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setGroupFilter('all')}>
                                        All Groups
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setGroupFilter('created')}>
                                        Created by me
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <CreateGroupModal>
                            <button className="p-1 hover:bg-muted rounded-full text-primary hover:text-primary/80" title="Create Group">
                                <Plus className="w-5 h-5" />
                            </button>
                        </CreateGroupModal>
                    </div>
                </div>

                {loadingGroups ? (
                    <div className="space-y-2">
                        <div className="h-8 w-full bg-muted rounded animate-pulse"></div>
                        <div className="h-8 w-full bg-muted rounded animate-pulse"></div>
                    </div>
                ) : groups && groups.length > 0 ? (
                    <>
                        <ul className={`space-y-2 transition-all duration-300 ${isGroupsExpanded ? 'max-h-64 overflow-y-auto pr-2 scrollbar-thin' : ''}`}>
                            {(isGroupsExpanded ? groups : groups.slice(0, 3)).map((group: any) => (
                                <Link
                                    href={`/community/groups/${group.id}`}
                                    key={group.id}
                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group block"
                                >
                                    {group.imageUrl ? (
                                        <img src={group.imageUrl} alt={group.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {group.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="font-semibold text-sm text-secondary-foreground group-hover:text-primary truncate flex-grow">
                                        {group.name}
                                    </span>
                                    {group.isAdmin && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">Admin</span>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevent navigation when deleting
                                                    e.stopPropagation();
                                                    handleDeleteGroup(group.id, group.name);
                                                }}
                                                className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Group"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </ul>

                        {groups.length > 3 && (
                            <button
                                onClick={() => setIsGroupsExpanded(!isGroupsExpanded)}
                                className="w-full mt-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary bg-muted/30 hover:bg-muted rounded-md transition-colors"
                            >
                                {isGroupsExpanded ? "Show Less" : `View ${groups.length - 3} More`}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">You haven't joined any groups yet.</p>
                        <CreateGroupModal>
                            <button className="text-xs text-primary hover:underline font-semibold">
                                Create your first group
                            </button>
                        </CreateGroupModal>
                    </div>
                )}
            </div>

            {/* Friends List (Mutuals) */}
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center text-foreground">
                        <Users className="w-5 h-5 mr-3 text-primary" />
                        Friends
                    </h3>
                    <Link href="/community/friends" className="text-xs text-primary hover:underline font-medium">
                        View All
                    </Link>
                </div>

                {loadingFriends ? (
                    <div className="space-y-2">
                        <div className="h-8 w-full bg-muted rounded animate-pulse"></div>
                        <div className="h-8 w-full bg-muted rounded animate-pulse"></div>
                    </div>
                ) : friends && friends.length > 0 ? (
                    <div className="space-y-3">
                        {friends.slice(0, 3).map((friend: any) => (
                            <Link href={`/community/messages/${friend.id}`} key={friend.id} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors group">
                                <div className="relative">
                                    {friend.imageUrl ? (
                                        <img src={friend.imageUrl} alt={friend.username} className="w-9 h-9 rounded-full object-cover border border-border" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border">
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></div>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                        {friend.fullName || friend.username}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground truncate">
                                        Level {friend.level}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                        No mutual friends yet.
                        <br />
                        <span className="text-xs opacity-70">Follow people who follow you back!</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
