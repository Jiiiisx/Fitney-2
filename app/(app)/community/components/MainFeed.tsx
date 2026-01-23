"use client";

import { useEffect, useState } from "react";
import { Loader2, Globe, User, Users } from "lucide-react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { useCommunityFeed, FeedFilter } from "../hooks/useCommunity";

export default function MainFeed() {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const { posts, isLoading, mutate } = useCommunityFeed(filter);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Decode user ID from token safely
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
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

  const handleDeletePost = (deletedId: number) => {
      mutate(
          (currentData: any) => currentData.filter((p: any) => p.id !== deletedId),
          false 
      );
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <CreatePost />

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-border pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${
            filter === "all"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-4 h-4" />
          Community
          {filter === "all" && (
            <span className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-primary rounded-full" />
          )}
        </button>

        <button
          onClick={() => setFilter("friends")}
          className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${
            filter === "friends"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Friends
          {filter === "friends" && (
            <span className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-primary rounded-full" />
          )}
        </button>

        <button
          onClick={() => setFilter("mine")}
          className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${
            filter === "mine"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="w-4 h-4" />
          My Posts
          {filter === "mine" && (
            <span className="absolute bottom-[-9px] left-0 w-full h-[2px] bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Feed Content */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-dashed border-border p-8">
            <p>
                {filter === 'mine' 
                    ? "You haven't posted anything yet. Share your first update!" 
                    : "No posts yet. Be the first to share your journey!"}
            </p>
        </div>
      )}
    </div>
  );
}