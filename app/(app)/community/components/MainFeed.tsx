"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { useCommunityFeed } from "../hooks/useCommunity";

export default function MainFeed() {
  const { posts, isLoading, mutate } = useCommunityFeed();
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
      // Optimistic delete UI update
      mutate(
          (currentData: any) => currentData.filter((p: any) => p.id !== deletedId),
          false // false = don't revalidate immediately
      );
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <CreatePost />

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
            <p>No posts yet. Be the first to share your journey!</p>
        </div>
      )}
    </div>
  );
}
