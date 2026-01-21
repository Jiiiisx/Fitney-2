"use client";

import { useState } from "react";
import { Heart, MessageSquare, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { likePost } from "../hooks/useCommunity";
import CommentSection from "./CommentSection";

interface PostData {
  id: number;
  userId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    name: string;
    avatar?: string;
    username: string;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export default function PostCard({
  post: initialPost,
  currentUserId,
  onDelete,
}: {
  post: PostData;
  currentUserId: string | null;
  onDelete?: (id: number) => void;
}) {
  const [post, setPost] = useState(initialPost);
  const [isLiking, setIsLike] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Helper untuk format tanggal aman
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "just now";
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    // Optimistic Update
    const prevPost = { ...post };
    setPost((p) => ({
      ...p,
      isLiked: !p.isLiked,
      likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
    }));
    setIsLike(true);

    try {
      await likePost(post.id);
      // Success, no action needed as UI is already updated
    } catch (error) {
      // Revert if failed
      setPost(prevPost);
    } finally {
      setIsLike(false);
    }
  };

  const handleDeleteClick = async () => {
      // Logic delete akan ditangani di parent atau hook terpisah jika perlu
      // Untuk sekarang, kita asumsikan props onDelete menangani API call juga
      // atau kita buat API call disini
      if (!confirm("Are you sure you want to delete this post?")) return;
      
      try {
          const token = localStorage.getItem("token");
          const res = await fetch(`/api/community/posts/${post.id}`, { // Pastikan route ini ada
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
              toast.success("Post deleted");
              if (onDelete) onDelete(post.id);
          } else {
              toast.error("Failed to delete post");
          }
      } catch(e) {
          toast.error("Error deleting post");
      }
  };

  return (
    <div className="bg-card p-5 rounded-xl border border-border shadow-sm mb-6 relative group transition-all hover:shadow-md">
      {/* Delete Menu (Only for owner) */}
      {currentUserId === post.userId && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-center mb-4">
        {post.user.avatar ? (
          <img
            src={post.user.avatar}
            alt={post.user.name}
            className="w-10 h-10 rounded-full mr-3 object-cover border border-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3 border border-primary/20">
            <span className="font-bold text-primary">
              {post.user.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className="font-bold text-foreground text-sm">{post.user.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-foreground text-base mb-4 whitespace-pre-wrap break-words leading-relaxed">
        {post.content}
      </p>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post content"
          className="mt-3 rounded-lg w-full object-cover max-h-96 border border-border"
        />
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between text-muted-foreground mt-4 pt-4 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors duration-300 group ${
            post.isLiked ? "text-red-500" : "hover:text-red-500"
          }`}
        >
          <Heart
            className={`w-5 h-5 group-hover:scale-110 transition-transform ${
              post.isLiked ? "fill-current" : ""
            }`}
          />
          <span className="font-medium text-sm">{post.likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-2 hover:text-blue-500 transition-colors duration-300 group ${
            showComments ? "text-blue-500" : ""
          }`}
        >
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">{post.commentsCount}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-green-500 transition-colors duration-300 group">
          <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection 
            postId={post.id} 
            onCommentAdded={() => setPost(p => ({ ...p, commentsCount: p.commentsCount + 1 }))}
        />
      )}
    </div>
  );
}
