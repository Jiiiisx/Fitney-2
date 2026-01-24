"use client";

import { useEffect, useState } from "react";
import { Loader2, Globe, User, Users } from "lucide-react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import StoryTray from "./StoryTray";
import { useCommunityFeed, FeedFilter } from "../hooks/useCommunity";

export default function MainFeed() {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const { posts, isLoading, mutate, loadMore, isLoadingMore, isReachingEnd } = useCommunityFeed(filter);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current user ID from API (cookie-based auth)
    fetch('/api/users/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.userId) {
          setCurrentUserId(data.userId);
        }
      })
      .catch(err => console.error("Error fetching current user", err));
  }, []);

  const handleDeletePost = (deletedId: number) => {
    mutate();
  };

  // Deduplicate posts based on ID to prevent "same key" error
  const uniquePosts = posts
    ? Array.from(new Map(posts.map((p: any) => [p.id, p])).values())
    : [];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <StoryTray />
      <CreatePost />

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-border pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${filter === "all"
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
          className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${filter === "friends"
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
          className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${filter === "mine"
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
      ) : uniquePosts && uniquePosts.length > 0 ? (
        <div className="space-y-6">
          {uniquePosts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={handleDeletePost}
            />
          ))}

          {/* Load More Button */}
          {!isReachingEnd && (
            <div className="flex justify-center pt-6 pb-4">
              <button
                onClick={() => loadMore()}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-full transition-colors font-medium text-sm disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Posts"
                )}
              </button>
            </div>
          )}

          {isReachingEnd && uniquePosts.length > 5 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              You've reached the end of the line! 🚀
            </div>
          )}
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