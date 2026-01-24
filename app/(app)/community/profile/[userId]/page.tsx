"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Calendar, UserPlus, UserCheck, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useRouter } from "next/navigation";
import PostCard from "../../components/PostCard";
import toast from "react-hot-toast";

type UserProfile = {
  user: {
    id: string;
    username: string;
    fullName: string;
    imageUrl: string;
    level: number;
    bio: string;
    joinDate: string;
  };
  stats: {
    followers: number;
    following: number;
    posts: number;
  };
  isFollowing: boolean;
  posts: any[];
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper untuk mendapatkan current user ID dari token (untuk PostCard)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Decode user ID from token safely
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window.atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
        );
        const payload = JSON.parse(jsonPayload);
        if (payload.sub) {
          setCurrentUserId(payload.sub);
        }
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/community/users/${userId}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/community/users/${profile.user.id}/follow`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setProfile(prev => prev ? ({ 
                ...prev, 
                isFollowing: !prev.isFollowing,
                stats: {
                    ...prev.stats,
                    followers: prev.isFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1
                }
            }) : null);
            toast.success(profile.isFollowing ? "Unfollowed" : "Following!");
        }
    } catch (error) {
        toast.error("Failed to update follow status");
    }
  };

  const handleMessage = () => {
      toast("Chat feature coming soon!", { icon: "💬" });
  };

  if (loading) {
      return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!profile) {
      return <div className="text-center p-8">User not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header / Nav */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Profile</h2>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-xl p-6 border shadow-sm space-y-6">
         <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={profile.user.imageUrl} />
                <AvatarFallback className="text-2xl">{profile.user.username[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left space-y-2">
                <div>
                    <h1 className="text-2xl font-bold">{profile.user.fullName}</h1>
                    <p className="text-muted-foreground">@{profile.user.username}</p>
                </div>
                
                <p className="text-sm">{profile.user.bio}</p>

                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Earth</span>
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Joined {new Date(profile.user.joinDate).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="flex gap-2">
                 {/* Don't show follow button on own profile */}
                 {currentUserId !== profile.user.id && (
                     <Button onClick={handleFollow} variant={profile.isFollowing ? "outline" : "default"}>
                        {profile.isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {profile.isFollowing ? "Following" : "Follow"}
                     </Button>
                 )}
                 <Button variant="secondary" size="icon" onClick={handleMessage}>
                    <MessageCircle className="h-4 w-4" />
                 </Button>
            </div>
         </div>

         {/* Stats */}
         <div className="grid grid-cols-3 border-t border-b py-4">
             <div className="text-center">
                 <div className="font-bold text-xl">{profile.stats.posts}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">Posts</div>
             </div>
             <div className="text-center border-l border-r">
                 <div className="font-bold text-xl">{profile.stats.followers}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">Followers</div>
             </div>
             <div className="text-center">
                 <div className="font-bold text-xl">{profile.stats.following}</div>
                 <div className="text-xs text-muted-foreground uppercase tracking-wider">Following</div>
             </div>
         </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
         <h3 className="font-bold text-lg">Posts</h3>
         {profile.posts.length === 0 ? (
             <div className="text-center p-8 text-muted-foreground bg-muted/30 rounded-lg">
                 No posts yet.
             </div>
         ) : (
             profile.posts.map((post: any) => (
                 <PostCard 
                    key={post.id} 
                    post={{
                        ...post,
                        user: { 
                            id: profile.user.id, // Ensure user object is structured correctly for PostCard
                            username: profile.user.username,
                            fullName: profile.user.fullName,
                            imageUrl: profile.user.imageUrl,
                            name: profile.user.fullName || profile.user.username
                        },
                        likesCount: post.likesCount || 0, // Fallback defaults
                        commentsCount: post.commentsCount || 0,
                        isLiked: post.isLiked || false
                    }} 
                    currentUserId={currentUserId}
                />
             ))
         )}
      </div>
    </div>
  );
}
