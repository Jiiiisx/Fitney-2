"use client";

import { Users, Trophy, Hash, User, Loader2, Plus, Filter, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMyGroups, deleteGroup } from "../hooks/useCommunity";
import { useCommunityNavigation } from "../CommunityContext";
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

interface Hashtag {
    tag: string;
    count: number;
}

const LeftSidebar = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trendingTags, setTrendingTags] = useState<Hashtag[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);
  
  // Group Logic
  const [groupFilter, setGroupFilter] = useState<"all" | "created">("all");
  const { groups, isLoading: loadingGroups } = useMyGroups(groupFilter);
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(false);
  const { navigateToGroupChat } = useCommunityNavigation();

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
      if (confirm(`Are you sure you want to delete group "${groupName}"? This action cannot be undone.`)) {
          await deleteGroup(groupId);
      }
  };

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
        setLoadingProfile(false);
      }
    };

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

    fetchProfile();
    fetchTrending();
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

      {/* Popular Topics (Dynamic) */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
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

      {/* My Groups (Dynamic) */}
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center text-foreground">
            <Users className="w-5 h-5 mr-3 text-primary" />
            My Groups
            </h3>
            <div className="flex items-center gap-1">
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
                    <li 
                        key={group.id} 
                        onClick={() => navigateToGroupChat(group.id, group.name)}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group"
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
                    </li>
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
    </div>
  );
};

export default LeftSidebar;
