"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import PostCard from "../../components/PostCard";
import useSWR from "swr";

// Fetcher
const fetcher = (url: string) => {
    const token = localStorage.getItem("token");
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.postId;
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Decode Token
  useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
          try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
              const payload = JSON.parse(jsonPayload);
              if (payload.sub) setCurrentUserId(payload.sub);
          } catch (e) {
              console.error("Token decode error", e);
          }
      }
  }, []);

  // Fetch Single Post
  // Note: Pastikan endpoint GET /api/community/posts/[id] tersedia di backend.
  // Jika belum, ini akan error 404/500, tapi struktur frontend sudah siap.
  const { data: post, error, isLoading } = useSWR(
      postId ? `/api/community/posts/${postId}` : null,
      fetcher
  );

  if (isLoading) {
      return <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error || !post) {
      return (
          <div className="text-center p-10 space-y-4">
              <p className="text-muted-foreground">Post not found or has been deleted.</p>
              <Button variant="outline" onClick={() => router.push('/community')}>Back to Feed</Button>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Post</h2>
      </div>

      <PostCard 
        post={{
             ...post,
             // Ensure data structure matches PostCard expectations
             user: post.user || { name: 'Unknown', username: 'unknown' },
             likesCount: post.likesCount || post.likes?.length || 0,
             commentsCount: post.commentsCount || post.comments?.length || 0,
             isLiked: post.isLiked || false 
        }} 
        currentUserId={currentUserId} 
      />
      
      {/* Thread/Reply Section could go here later */}
    </div>
  );
}
